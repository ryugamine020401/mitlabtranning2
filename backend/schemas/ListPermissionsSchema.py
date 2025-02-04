from pydantic import BaseModel, Field
from typing import Optional

# 新增清單共用者請求模型
class CreateViewerPermissionSchema(BaseModel):
    viewer_id: str = Field(..., max_length=36)
    list_id: str = Field(..., max_length=36)

# 刪除清單共用者請求模型
class DeleteViewerPermissionSchema(BaseModel):
    viewer_id: str = Field(..., max_length=36)
    list_id: str = Field(..., max_length=36)
