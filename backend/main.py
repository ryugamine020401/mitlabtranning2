from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional
from uuid import uuid4
import os, base64

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.staticfiles import StaticFiles
from tortoise.contrib.fastapi import register_tortoise
from jose import jwt, JWTError
from dotenv import load_dotenv
import config, random, string, httpx

from models import UsersModel, ListsModel, ProductsModel, ProfilesModel
from schemas.CreateProductSchema import CreateProductSchema
from schemas.GetProductSchema import GetProductSchema
from schemas.UsersSchema import *
from schemas.ProfilesSchema import *
from schemas.ListsSchema import *
from schemas.ProductsSchema import *


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


register_tortoise(
    app,
    config=config.TORTOISE_ORM,
    generate_schemas=True,
    add_exception_handlers=True,
)


@app.get("/api/")
async def read_root():
    return {"Hello": "World"}


@app.post("/api/create_user/")
async def create_user(data: CreatesUserSchema):
    """
    使用者註冊
    """
    try:
        # 檢查資料完整性
        if not all([data.username, data.email, data.password, data.name, data.phone_number, data.date_of_birth, data.address]):
            return {"status": "fail", "msg": "Fail to create user.", "data": []}

        # 檢查 email 是否已註冊
        existing_email = await UsersModel.filter(email=data.email).first()
        if existing_email:
            return {"status": "fail", "msg": "This email has already been registered.", "data": []}

        # 檢查 username 是否已存在
        existing_user = await UsersModel.filter(username=data.username).first()
        if existing_user:
            return {"status": "fail", "msg": "This username has already been registered.", "data": []}

        next_id = await get_next_id(UsersModel)  # 確保返回有效的 id
        user_uid = await generate_unique_user_uid()
        current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

        # 建立新用戶，密碼需加密
        user = await UsersModel.create(
            id=str(next_id),
            user_uid=str(user_uid),
            username=data.username,
            email=data.email,
            password=data.password,
            verify_num=str(-1),
            created_at=current_time,
            updated_at=current_time
        )

        # 創建 profile
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "http://localhost:8000/api/create_profile/",  # 確保這是 FastAPI 伺服器的網址
                json={
                    "f_user_id": user.user_uid,
                    "name": data.name,
                    "phone_number": data.phone_number,
                    "date_of_birth": data.date_of_birth,
                    "address": data.address
                }
            )
            result = response.json()

        return {
            "status": "success", 
            "msg": "Successful registration.",
            "data": result
        }
    
    except Exception as e:
        return {"status": "fail", "msg": "Fail to create user.", "data": []}


@app.post("/api/login_user/")
async def login_user(data: LoginUserSchema):
    """
    使用者登入
    """
    try:
        # 檢查資料完整性
        if not all([data.username, data.email, data.password]):
            return {"status": "fail", "msg": "Fail to login.", "data": []}

        # 查詢用戶，檢查 username 是否存在
        user = await UsersModel.filter(username=data.username).first()
        if not user:
            return {"status": "fail", "msg": "This user doesn't exist.", "data": []}

        # 驗證 password 和 email
        if user.password != data.password or user.email != data.email:  # 這裡是明文比對，未來應該改用加密驗證
            return {"status": "fail", "msg": "The email or password is wrong.", "data": []}

        # 創建 JWT Token
        access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data={"sub": user.user_uid}, expires_delta=access_token_expires)

        # 確認登入，回傳 token
        return {"status": "success", "msg": "Successful login.", "data": [{"token": access_token}]}
    
    except Exception as e:
        return {"status": "fail", "msg": "Fail to login.", "data": []}


@app.post("/api/create_profile/")
async def create_profile(data: CreateProfileSchema):
    """
    創建使用者基本資料
    """
    try:
        # 檢查資料完整性
        if not all([data.f_user_id, data.name, data.phone_number, data.date_of_birth, data.address]):
            return {"status": "fail", "msg": "Fail to create profile."}
        
        # 檢查使用者是否存在
        current_user = await UsersModel.filter(user_uid=data.f_user_id).first()
        if not current_user:
            return {"status": "fail", "msg": "Fail to create profile."}

        # 檢查該用戶是否已經有 profile
        existing_profile = await ProfilesModel.filter(f_user_uid=current_user).first()
        if existing_profile:
            return {"status": "fail", "msg": "Fail to create profile."}

        # 創建基本資料
        profile = await ProfilesModel.create(
            f_user_uid=current_user,
            name=data.name,
            phone_number=data.phone_number,
            date_of_birth=data.date_of_birth,
            address=data.address
        )

        return {"status": "success", "msg": "Successful create profile."}

    except Exception as e:
        return {"status": "fail", "msg": "Fail to create profile."}


@app.post("/api/get_list/")
async def get_list(current_user: UsersModel = Depends(get_current_user)):
    """
    獲取清單
    """
    try:
        user_lists = await ListsModel.filter(f_user_id=current_user)
        if not user_lists:
            return {"status": "success", "msg": "No have any list.", "data": []}

        # 回傳清單資料
        return {
            "status": "success",
            "msg": "Successful get list.",
            "data": [
                {
                    "list_uid": lst.list_uid,
                    "list_name": lst.list_name,
                    "description": lst.description,
                    "created_at": lst.created_at
                }
                for lst in user_lists
            ]
        }

    except Exception as e:
        return {"status": "fail", "msg": "Fail to get list.", "data": []}


@app.post("/api/create_list/")
async def create_list(data: CreateListSchema, current_user: UsersModel = Depends(get_current_user)):
    """
    新增清單
    """
    try:
        # 檢查資料完整性
        if not data.list_name:
            return {"status": "fail", "msg": "Fail to create list."}

        # 檢查清單名稱是否已存在
        existing_list = await ListsModel.filter(f_user_id=current_user, list_name=data.list_name).first()
        if existing_list:
            return {"status": "fail", "msg": "This list_name has already exist."}

        created_at = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        list_uid = await generate_unique_list_uid()
        
        # 創建清單
        new_list = await ListsModel.create(
            list_uid=list_uid,
            f_user_id=current_user,
            list_name=data.list_name,
            description=data.description,
            created_at=created_at,
        )

        return {"status": "success", "msg": "Successful create list."}

    except Exception as e:
        return {"status": "fail", "msg": "Fail to create list."}


@app.post("/api/get_product")
async def get_product(data: GetProductSchema, current_user: UsersModel = Depends(get_current_user)):
    """
    獲取產品
    """
    try:
        # 檢查資料完整性
        if not data.f_list_id:
            return {"status": "fail", "msg": "Fail to get product.", "data": []}

        # 查詢該清單是否存在
        user_lists = await ListsModel.filter(list_uid=data.f_list_id).first()
        if not user_lists:
            return {"status": "fail", "msg": "Fail to get product.", "data": []}

        # 查詢該清單底下的所有商品
        products = await ProductsModel.filter(f_list_id=data.f_list_id).all()
        if not products:
            return {"status": "success", "msg": "No have any product in this list.", "data": []}
        
        # 回傳商品資訊
        return {
            "status": "success",
            "msg": "Successful get product.",
            "data": [
                {
                    "id": product.id,
                    "product_name": product.product_name,
                    "product_barcode": product.product_barcode,
                    "product_number": product.product_number,
                    "product_image_url": product.product_image_url,
                    "expiry_date": product.expiry_date,
                    "description": product.description
                }
                for product in products
            ]
        }
    
    except Exception as e:
        return {"status": "fail", "msg": "Fail to get product.", "data": []}


@app.post("/api/create_product/")
async def create_product(data: CreateProductSchema, current_user: UsersModel = Depends(get_current_user)):
    """
    新增產品
    """
    try:
        # 確認產品資料完整性
        if not all([data.product_name, data.product_barcode, data.product_number, data.expiry_date]):
            return {"status": "fail", "msg": "Fail to create product."}

        # 確認清單是否存在且屬於當前用戶
        user_list = await ListsModel.filter(list_uid=data.f_list_id, f_user_id=current_user).first()
        if not user_list:
            return {"status": "fail", "msg": "Fail to create product."}

        # 確認產品是否已存在（依條碼和有效期判定）
        existing_product = await ProductsModel.filter(f_list_id=user_list, product_barcode=data.product_barcode, expiry_date=data.expiry_date).first()
        if existing_product:
            return {"status": "fail", "msg": "This product with the same barcode and expiry date already exists."}

        # 處理 Base64 編碼的圖片
        try:
            image_data = base64.b64decode(data.product_image_url)  # 解碼 Base64 圖片
        except Exception as e:
            return {"status": "fail", "msg": "Invalid Base64 image encoding."}

        # 建立資料夾結構：resource/{user_uid}/{list_name}/
        folder_path = Path("resource") / str(current_user.user_uid) / str(user_list.list_name)

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
            product_image_url=str(image_path),
            expiry_date=data.expiry_date,
            description=data.description
        )

        return {
            "status": "success",
            "msg": "Successful create product."
        }

    except Exception as e:
        return {"status": "fail", "msg": "Fail to create product.", "e": str(e)}

