from fastapi import HTTPException, Header
from jose import jwt, JWTError
from models import UsersModel
from dotenv import load_dotenv
import os

# 載入 .env 檔案
load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")

# 從 .env 獲取 JWT 配置
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-secret-key")  # 如果未設置，使用預設密鑰
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 15))

# 從 .env 獲取 SMTP 配置
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

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
