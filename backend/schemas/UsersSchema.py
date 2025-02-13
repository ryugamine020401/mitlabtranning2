from .BaseSchema import BaseSchema
from pydantic import Field

# 使用者註冊請求模型
class CreatesUserSchema(BaseSchema):
    username: str = Field(..., max_length=30)
    email: str = Field(..., max_length=320)
    password: str = Field(..., max_length=255)
    name: str = Field(..., max_length=50)
    phone_number: str = Field(..., max_length=15)
    date_of_birth: str = Field(..., max_length=10)
    address: str = Field(..., max_length=255)

# 使用者登入請求模型
class LoginUserSchema(BaseSchema):
    username: str = Field(..., max_length=30)
    email: str = Field(..., max_length=320)
    password: str = Field(..., max_length=255)

# 忘記密碼請求模型
class ForgetPasswordUserSchema(BaseSchema):
    username: str = Field(..., max_length=30)
    email: str = Field(..., max_length=320)

# 重設密碼請求模型
class ResetPasswordUserSchema(BaseSchema):
    username: str = Field(..., max_length=30)
    email: str = Field(..., max_length=320)
    password: str = Field(..., max_length=255)
    verify_num: str = Field(..., max_length=36)

# 更新密碼請求模型
class UpdatePasswordUserSchema(BaseSchema):
    username: str = Field(..., max_length=30)
    email: str = Field(..., max_length=320)
    old_password: str = Field(..., max_length=255)
    new_password: str = Field(..., max_length=255)

# 更新 Email 請求模型
class UpdateEmailUserSchema(BaseSchema):
    email: str = Field(..., max_length=320)
