from pydantic import BaseModel, Field

# 使用者註冊請求模型
class CreatesUserSchema(BaseModel):
    username: str = Field(..., max_length=30)
    email: str = Field(..., max_length=320)
    password: str = Field(..., max_length=255)

# 使用者登入請求模型
class LoginUserSchema(BaseModel):
    username: str = Field(..., max_length=30)
    email: str = Field(..., max_length=320)
    password: str = Field(..., max_length=255)

# 忘記密碼請求模型
class ForgetPasswordUserSchema(BaseModel):
    username: str = Field(..., max_length=30)
    email: str = Field(..., max_length=320)

# 重設密碼請求模型
class ResetPasswordUserSchema(BaseModel):
    token: str = Field(...)
    username: str = Field(..., max_length=30)
    email: str = Field(..., max_length=320)
    password: str = Field(..., max_length=255)

# 更新密碼請求模型
class UpdatePasswordUserSchema(BaseModel):
    token: str = Field(...)
    username: str = Field(..., max_length=30)
    email: str = Field(..., max_length=320)
    old_password: str = Field(..., max_length=255)
    new_password: str = Field(..., max_length=255)

# 更新 Email 請求模型
class UpdateEmailUserSchema(BaseModel):
    token: str = Field(...)
    email: str = Field(..., max_length=320)

# 使用者登出請求模型
class LogoutUserSchema(BaseModel):
    token: str = Field(...)

# 獲取使用者 ID 請求模型
class GetIDUserSchema(BaseModel):
    email: str = Field(..., max_length=320)
