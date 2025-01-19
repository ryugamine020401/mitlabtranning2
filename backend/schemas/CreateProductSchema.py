from pydantic import BaseModel, Field

class CreateProductSchema(BaseModel):
    """
    新增商品的請求資料模型
    """
    list_name: str = Field(..., max_length=255)
    product_name: str = Field(..., max_length=100)
    product_barcode: str = Field(..., max_length=13)
    product_number: int = Field(1)
    product_image: str = Field(...)
    expiry_date: str = Field(...)
    description: str = Field(None, max_length=255)