from pydantic import BaseModel, Field
from typing import Optional

class CreateListSchema(BaseModel):
    """
    用戶登入時的表單
    """
    list_name: str = Field(..., max_length=255)
    description: str = Field(..., max_length=255)
