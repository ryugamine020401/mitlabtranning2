from pydantic import BaseModel, Field
from typing import Optional

# 創建使用者基本資料請求模型
class CreateProfileSchema(BaseModel):
    f_user_id: Optional[str] = Field(..., max_length=36)
    name: Optional[str] = Field(..., max_length=50)
    phone_number: Optional[str] = Field(..., max_length=15)
    date_of_birth: Optional[str] = Field(..., max_length=10)
    address: Optional[str] = Field(..., max_length=255)

# 更新使用者基本資料請求模型
class UpdateProfileSchema(BaseModel):
    name: Optional[str] = Field(..., max_length=50)
    phone_number: Optional[str] = Field(..., max_length=15)
    date_of_birth: Optional[str] = Field(..., max_length=10)
    address: Optional[str] = Field(..., max_length=255)
    profile_picture_url: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=500)
