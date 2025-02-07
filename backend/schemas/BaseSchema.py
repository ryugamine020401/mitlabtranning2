from pydantic import BaseModel

# 基礎模型，設定禁止額外欄位
class BaseSchema(BaseModel):
    class Config:
        extra = "forbid"