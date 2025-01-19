from pydantic import BaseModel, Field

class RegisterFormSchema(BaseModel):
    """
    用戶註冊時的表單
    """
    username: str = Field(..., max_length=30)
    email: str = Field(..., max_length=320)
    password1: str = Field(..., max_length=255)
    password2: str = Field(..., max_length=255)