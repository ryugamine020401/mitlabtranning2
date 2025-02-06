from pydantic import BaseModel, Field
from typing import Optional

# 新增清單請求模型
class CreateListSchema(BaseModel):
    list_name: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=255)

# 刪除清單請求模型
class DeleteListSchema(BaseModel):
    list_uid: str = Field(..., max_length=36)

# 更新清單請求模型
class UpdateListSchema(BaseModel):
    list_uid: str = Field(..., max_length=36)
    list_name: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=255)
