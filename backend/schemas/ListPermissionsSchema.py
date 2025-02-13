from .BaseSchema import BaseSchema
from pydantic import Field
from typing import Optional

# 獲取清單共用者請求模型
class GetiewerPermissionSchema(BaseSchema):
    f_list_id: str = Field(..., max_length=36)

# 新增清單共用者請求模型
class CreateViewerPermissionSchema(BaseSchema):
    email: str = Field(..., max_length=320)
    f_list_id: str = Field(..., max_length=36)

# 刪除清單共用者請求模型
class DeleteViewerPermissionSchema(BaseSchema):
    f_viewer_id: str = Field(..., max_length=36)
    f_list_id: str = Field(..., max_length=36)
