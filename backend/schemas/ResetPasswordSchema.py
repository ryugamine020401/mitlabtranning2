from pydantic import BaseModel, Field
from typing import Optional


class LoginFormSchema(BaseModel):
    """
    用戶登入時的表單
    """
    old_password: Optional[str] = Field(None, max_length=30)
    email: Optional[str] = Field(None, max_length=320)
    password: str = Field(..., max_length=255)
