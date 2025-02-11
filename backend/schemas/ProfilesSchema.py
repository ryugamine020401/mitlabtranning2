from .BaseSchema import BaseSchema
from pydantic import Field
from typing import Optional

# 創建使用者基本資料請求模型
class CreateProfileSchema(BaseSchema):
    f_user_id: str = Field(..., max_length=36)
    name: str = Field(..., max_length=50)
    phone_number: str = Field(..., max_length=15)
    date_of_birth: str = Field(..., max_length=10)
    address: str = Field(..., max_length=255)

# 更新使用者基本資料請求模型
class UpdateProfileSchema(BaseSchema):
    name: str = Field(..., max_length=50)
    phone_number: str = Field(..., max_length=15)
    date_of_birth: str = Field(..., max_length=10)
    address: str = Field(..., max_length=255)
    profile_picture_url: Optional[str] = Field(..., ) # max_length=2850000
    bio: Optional[str] = Field(..., max_length=500)
