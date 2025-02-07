from pydantic import BaseModel, Field
from typing import Optional

# 新增清單共用者請求模型
class CreateViewerPermissionSchema(BaseModel):
    f_viewer_id: str = Field(..., max_length=36)
    f_list_id: str = Field(..., max_length=36)

# 刪除清單共用者請求模型
class DeleteViewerPermissionSchema(BaseModel):
    f_viewer_id: str = Field(..., max_length=36)
    f_list_id: str = Field(..., max_length=36)
