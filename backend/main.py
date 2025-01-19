import os
from datetime import datetime, timedelta
import base64
from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.staticfiles import StaticFiles
from tortoise.contrib.fastapi import register_tortoise
from jose import jwt, JWTError
from dotenv import load_dotenv
import config
import random
import string

from models import UsersModel, ListsModel, ProductsModel
from schemas.RegisterSchema import RegisterFormSchema
from schemas.LoginSchema import LoginFormSchema
from schemas.CreateListSchema import CreateListSchema
from schemas.CreateProductSchema import CreateProductSchema
from schemas.GetProductSchema import GetProductSchema

# 載入 .env 檔案
load_dotenv()

# 從 .env 獲取 JWT 配置
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-secret-key")  # 如果未設置，使用預設密鑰
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 15))


async def get_next_id(table) -> int:
    """
    查詢資料庫中最大的 id，並返回下一個 id
    """
    last_item = await table.all().order_by('-id').first()  # 查詢最大的 id
    if last_item:
        return int(last_item.id) + 1
    return 1  # 如果沒有記錄，從 1 開始


async def generate_unique_user_uid() -> str:
    """
    生成一個唯一的 6 位亂數 user_uid，保證不重複
    """
    while True:
        user_uid = ''.join(random.choices(string.digits, k=6))  # 生成 6 位數字亂數
        existing_user = await UsersModel.filter(user_uid=user_uid).first()
        if not existing_user:
            return user_uid


async def generate_unique_list_uid() -> str:
    """
    生成一個唯一的 6 位亂數 list_uid，保證不重複
    """
    while True:
        list_uid = ''.join(random.choices(string.digits, k=6))  # 生成 6 位數字亂數
        existing_list = await ListsModel.filter(list_uid=list_uid).first()
        if not existing_list:
            return list_uid


def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    創建 JWT Token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str):
    """
    驗證 JWT Token 並提取用戶 UID
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_uid: str = payload.get("sub")
        if user_uid is None:
            raise HTTPException(status_code=401, detail="Token 無效")
        return user_uid
    except JWTError:
        raise HTTPException(status_code=401, detail="Token 驗證失敗")


async def get_current_user(authorization: str = Header(...)):
    """
    從 Authorization 標頭驗證 JWT Token 並返回使用者
    """
    token = authorization.replace("Bearer ", "")
    user_uid = verify_access_token(token)
    user = await UsersModel.filter(user_uid=user_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="使用者不存在")
    return user


app = FastAPI()
app.mount("/api/resource", StaticFiles(directory="resource"), name="resource")

@app.get("/api/")
async def read_root():
    return {"Hello": "World"}


@app.post("/api/register/")
async def create_user(data: RegisterFormSchema):
    # 確認密碼一致
    if data.password2 != data.password1:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # 檢查用戶是否已存在
    existing_user = await UsersModel.filter(username=data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    next_id = await get_next_id(UsersModel)  # 確保返回有效的 id
    user_uid = await generate_unique_user_uid()

    current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    # 建立新用戶，密碼需加密
    user = await UsersModel.create(
        id=str(next_id),
        user_uid=str(user_uid),
        username=data.username,
        email=data.email,
        password=data.password2,
        created_at=current_time,
        updated_at=current_time
    )

    return {"id": user.id, "username": user.username, "email": user.email}


@app.post("/api/login/")
async def login_user(data: LoginFormSchema):
    """
    處理用戶登入請求
    """
    # 嘗試查詢用戶，根據 username_or_email 查找
    user = await UsersModel.filter(
        username=data.username_or_email
    ).first() or await UsersModel.filter(
        email=data.username_or_email
    ).first()

    # 驗證用戶是否存在
    if not user:
        raise HTTPException(status_code=404, detail="用戶不存在")

    # 驗證密碼
    if user.password != data.password:  # 這裡是明文比對，未來應該改用加密驗證
        raise HTTPException(status_code=401, detail="密碼錯誤")

    # 創建 JWT Token
    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.user_uid}, expires_delta=access_token_expires
    )

    # 返回基本用戶資訊和 Token
    return {
        "user_uid": user.user_uid,
        "username": user.username,
        "email": user.email,
        "access_token": access_token,
        "token_type": "bearer",
        "message": "登入成功",
    }

@app.post("/api/get_lists/")
async def get_user_lists(current_user: UsersModel = Depends(get_current_user)):
    """
    獲取當前使用者的所有清單（僅返回名稱和描述）
    """
    user_lists = await ListsModel.filter(f_user_id=current_user).all()
    return [
        {
            "list_name": lst.list_name,
            "description": lst.description,
        }
        for lst in user_lists
    ]


@app.post("/api/create_list/")
async def create_list(data: CreateListSchema, current_user: UsersModel = Depends(get_current_user)):
    """
    創建清單 API
    """
    created_at = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

    # 檢查清單名稱是否已存在
    existing_list = await ListsModel.filter(f_user_id=current_user, list_name=data.list_name).first()
    if existing_list:
        raise HTTPException(status_code=400, detail="清單名稱已存在")

    # 創建清單
    list_uid = await generate_unique_list_uid()
    new_list = await ListsModel.create(
        list_uid=list_uid,
        f_user_id=current_user,
        list_name=data.list_name,
        description=data.description,
        created_at=created_at,
    )

    return {
        "list_uid": new_list.list_uid,
        "list_name": new_list.list_name,
        "description": new_list.description,
        "created_at": new_list.created_at,
        "message": "清單創建成功",
    }



@app.post("/api/create_product/")
async def create_product(
    data: CreateProductSchema, 
    current_user: UsersModel = Depends(get_current_user)
):
    """
    新增商品 API，處理 Base64 編碼的圖片
    """
    print("123123")
    # 確認'清單是否存在且屬於當前用戶
    user_list = await ListsModel.filter(list_name=data.list_name, f_user_id=current_user).first()
    if not user_list:
        raise HTTPException(status_code=404, detail="清單不存在或無權限訪問")

    # 確認商品是否已存在（依條碼和有效期判定）
    existing_product = await ProductsModel.filter(
        f_user_id=current_user,
        f_list_id=user_list,
        product_barcode=data.product_barcode,
        expiry_date=data.expiry_date
    ).first()
    if existing_product:
        raise HTTPException(status_code=400, detail="相同條碼和效期的商品已存在")

    # 處理 Base64 編碼的圖片
    try:
        image_data = base64.b64decode(data.product_image)  # 解碼 Base64 圖片
    except Exception:
        raise HTTPException(status_code=400, detail="圖片的 Base64 編碼無效")

    # 建立資料夾結構：resource/{user_uid}/{list_name}/
    folder_path = Path("resource") / str(current_user.user_uid) / data.list_name

    # 檢查資料夾是否存在，如果不存在則建立
    if not folder_path.exists():
        folder_path.mkdir(parents=True, exist_ok=True)

    # 儲存圖片
    unique_filename = f"{uuid4().hex}.jpg"  # 假設圖片儲存為 JPG 格式
    image_path = folder_path / unique_filename

    with open(image_path, "wb") as buffer:
        buffer.write(image_data)

    # 創建商品
    new_product = await ProductsModel.create(
        f_user_id=current_user,
        f_list_id=user_list,
        product_name=data.product_name,
        product_barcode=data.product_barcode,
        product_number=data.product_number,
        product_image_url=str(image_path),  # 將圖片路徑儲存到資料庫
        expiry_date=data.expiry_date,
        description=data.description
    )

    return {
        "message": "商品新增成功"
    }


@app.post("/api/get_product/")
async def get_product(
    data: GetProductSchema,  # 這個 Schema 只需要有 list_name (可依照你的需求擴充)
    current_user: UsersModel = Depends(get_current_user)
) -> List[str]:
    """
    從 token 取得使用者，並查詢該使用者在某個清單（list_name）下的所有商品。
    只回傳商品的圖片網址 (product_image_url)。
    """

    # 1. 找到該使用者指定的清單
    user_list = await ListsModel.filter(
        f_user_id=current_user,
        list_name=data.list_name
    ).first()

    if not user_list:
        raise HTTPException(
            status_code=404,
            detail="清單不存在或無權限訪問"
        )

    # 2. 查詢該清單底下所有商品
    products = await ProductsModel.filter(
        f_user_id=current_user,
        f_list_id=user_list
    )

    # 3. 只回傳每個商品的圖片 URL
    return [product.product_image_url for product in products]

register_tortoise(
    app,
    config=config.TORTOISE_ORM,
    generate_schemas=True,
    add_exception_handlers=True,
)
