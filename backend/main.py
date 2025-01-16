from typing import Union
from datetime import datetime

from fastapi import FastAPI, HTTPException
from tortoise.contrib.fastapi import register_tortoise
import config
import random
import string

from models import UsersModel
from schemas.RegisterSchema import RegisterFormSchema

async def get_next_id(table) -> int:
    """
    查詢資料庫中最大的 id，並返回下一個 id
    """
    last_user = await table.all().order_by('-id').first()  # 查詢最大的 id
    if last_user:
        return int(last_user.id) + 1
    return 1  # 如果沒有用戶，從 1 開始


async def generate_unique_user_uid() -> str:
    """
    生成一個唯一的 6 位亂數 user_uid，保證不重複
    """
    while True:
        user_uid = ''.join(random.choices(string.digits, k=6))  # 生成 6 位數字亂數
        existing_user = await UsersModel.filter(user_uid=user_uid).first()
        if not existing_user:
            return user_uid

app = FastAPI()


@app.get("/api/")
async def read_root():
    return {"Hello": "World"}


@app.get("/api/items/{item_id}")
async def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


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


register_tortoise(
    app,
    config = config.TORTOISE_ORM,
    generate_schemas = True,  # 自動生成資料表
    add_exception_handlers = True,
)