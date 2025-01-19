from pydantic import BaseModel, Field
from typing import Optional


class LoginFormSchema(BaseModel):
    """
    用戶登入時的表單
    """
    username_or_email: Optional[str] = Field(None, max_length=320)
    password: str = Field(..., max_length=255)
