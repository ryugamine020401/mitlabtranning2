from .BaseSchema import BaseSchema
from pydantic import Field, BaseModel

# 定義請求的 JSON 結構
class GetStory(BaseSchema):
    product_name: str = Field(..., max_length=100)
    expiry_date: str = Field(..., max_length=10)

# 定義回傳 JSON 結構
class ReturnStory(BaseModel):
    title: str = Field(..., max_length=100)
    story: list[str] = Field(..., max_length=300)
