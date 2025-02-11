from fastapi import HTTPException, Header
from jose import jwt, JWTError
from models import UsersModel
from dotenv import load_dotenv
from pathlib import Path
from uuid import uuid4
import os, base64

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

def correct_base64_padding(base64_str: str) -> str:
    """
    根據字串長度來補充適當的填充字符
    """
    return base64_str + "=" * (4 - len(base64_str) % 4) if len(base64_str) % 4 != 0 else base64_str

async def handle_image_and_save(image_url: str, user_uid: str, list_uid: str) -> str:
    """
    處理 Base64 編碼的圖片並儲存到對應的資料夾中，返回圖片的存儲路徑
    """
    try:
        # 處理 Base64 編碼的圖片
        image_url = correct_base64_padding(image_url)
        image_data = base64.b64decode(image_url)  # 解碼 Base64 圖片
        # print(f"image_data: {image_data}")
    except Exception as e:
        raise ValueError(f"Invalid Base64 image encoding: {str(e)}")

    # 建立資料夾結構：resource/{user_uid}/{list_uid}/
    folder_path = Path("resource") / user_uid / list_uid

    # 檢查資料夾是否存在，如果不存在則建立
    if not folder_path.exists():
        folder_path.mkdir(parents=True, exist_ok=True)

    # 儲存圖片
    unique_filename = f"{uuid4().hex}.jpg"  # 假設圖片儲存為 JPG 格式
    image_path = folder_path / unique_filename
    # print(f"image_path: {image_path}")

    with open(image_path, "wb") as buffer:
        buffer.write(image_data)

    return str(image_path)
