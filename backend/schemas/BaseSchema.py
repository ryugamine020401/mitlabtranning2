from pydantic import BaseModel, ConfigDict

# 基礎模型，設定禁止額外欄位
class BaseSchema(BaseModel):
     model_config = ConfigDict(extra="forbid")