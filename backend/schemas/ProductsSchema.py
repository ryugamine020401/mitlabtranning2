from pydantic import BaseModel, Field
from typing import Optional

# 獲取產品請求模型
class GetProductSchema(BaseModel):
    f_list_id: str = Field(..., max_length=36)

# 新增產品請求模型
class CreateProductSchema(BaseModel):
    f_list_id: str = Field(..., max_length=36)
    product_name: str = Field(..., max_length=100)
    product_barcode: str = Field(..., max_length=13)
    product_image_url: str = Field(..., max_length=255)
    product_number: str = Field(..., max_length=13)
    expiry_date: str = Field(..., max_length=10)
    description: Optional[str] = Field(None, max_length=255)

# 刪除產品請求模型
class DeleteProductSchema(BaseModel):
    f_list_id: str = Field(..., max_length=36)
    product_id: str = Field(..., max_length=36)

# 更新產品請求模型
class UpdateProductSchema(BaseModel):
    f_list_id: str = Field(..., max_length=36)
    product_id: str = Field(..., max_length=36)
    product_name: str = Field(..., max_length=100)
    product_barcode: str = Field(..., max_length=13)
    product_image_url: str = Field(..., max_length=255)
    product_number: str = Field(..., max_length=13)
    expiry_date: str = Field(..., max_length=10)
    description: Optional[str] = Field(None, max_length=255)
