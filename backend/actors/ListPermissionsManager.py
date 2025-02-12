from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
import httpx

from utils import *
from models import ListPermissionsModel, ListsModel
from schemas.ListPermissionsSchema import *

router = APIRouter()

class ListPermissionsManager:
    @staticmethod
    @router.post("/get_viewer_permission/")
    async def get_viewer_permission(data: GetiewerPermissionSchema, current_user: UsersModel = Depends(get_current_user)):
        """
        提供清單擁有者查看當前清單的所有清單共用者
        """
        try:
            shared_lists = await ListPermissionsModel.filter(f_owner_id=current_user, f_list_id=data.f_list_id).select_related("f_viewer_id").all()
            if not shared_lists:
                return {"status": "success", "msg": "Successful get share list, but no any share list.", "data": []}

            # 回傳共享清單資料
            return {
                "status": "success",
                "msg": "Successful get share list.",
                "data": [
                    {
                        "f_viewer_email": lst.f_viewer_id.email,
                        "f_viewer_id": lst.f_viewer_id.f_viewer_id,
                        "f_owner_email": current_user.email
                    }
                    for lst in shared_lists
                ]
            }

        except Exception as e:
            return {"status": "fail", "msg": "Fail to get share list.", "data": []}
        
    @staticmethod
    @router.post("/create_viewer_permission/")
    async def create_viewer_permission(data: CreateViewerPermissionSchema, current_user: UsersModel = Depends(get_current_user)):
        """
        提供清單擁有者能新增特定清單共用者
        """
        try:
            # 檢查使用者是否有清單存取權限
            list_exists = await ListsModel.filter(list_uid=data.f_list_id, f_user_id=current_user).first()
            if not list_exists:
                return {"status": "fail", "msg": "You do not own this list."}

            # 檢查 email 是否存在
            viewer_exists = await UsersModel.filter(email=data.email).first()
            if not viewer_exists:
                return {"status": "fail", "msg": "This email doesn't exists."}
            
            # 檢查被分享者是否已被分享
            exists = await ListPermissionsModel.filter(f_owner_id=current_user, f_viewer_id=viewer_exists, f_list_id=data.f_list_id).first()
            if exists:
                return {"status": "fail", "msg": "This viewer already has access to the list."}
            
            current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            # 新增共享權限
            await ListPermissionsModel.create(
                f_owner_id=current_user,
                f_viewer_id=viewer_exists,
                f_list_id=list_exists,
                granted_at=current_time
            )

            return {"status": "success", "msg": "Successful create viewer."}
        
        except Exception as e:
            return {"status": "fail", "msg": "Fail to create viewer."}

    @staticmethod
    @router.post("/delete_viewer_permission/")
    async def delete_viewer_permission(data: DeleteViewerPermissionSchema, current_user: UsersModel = Depends(get_current_user)):
        """
        提供清單擁有者能刪除特定清單共用者
        """
        try:
            # 檢查使用者是否有清單存取權限
            list_exists = await ListsModel.filter(list_uid=data.f_list_id, f_user_id=current_user).first()
            if not list_exists:
                return {"status": "fail", "msg": "You do not own this list."}

            # 檢查被分享者是否已被分享
            permission_exists = await ListPermissionsModel.filter(f_owner_id=current_user, f_viewer_id=data.f_viewer_id, f_list_id=data.f_list_id).first()
            if not permission_exists:
                return {"status": "fail", "msg": "This viewer has not access to the list."}
            
            deleted_count = await permission_exists.delete()

            return {"status": "success", "msg": "Successful delete viewer."}
        
        except Exception as e:
            return {"status": "fail", "msg": "Fail to delete viewer."}

    @staticmethod
    @router.post("/get_sharelist_permission/")
    async def get_sharelist_permission(current_user: UsersModel = Depends(get_current_user)):
        """
        提供清單共用者查看全部共享清單
        """
        try:
            shared_lists = await ListPermissionsModel.filter(f_viewer_id=current_user).select_related("f_owner_id", "f_list_id").all()
            if not shared_lists:
                return {"status": "success", "msg": "Successful get share list, but no any share list.", "data": []}
            
            return {
                "status": "success",
                "msg": "Successful get share list.",
                "data": [
                    {
                        "f_owner_email": lst.f_owner_id.email,
                        "f_list_id": lst.f_list_id.list_uid,
                        "list_name": lst.f_list_id.list_name,
                        "description": lst.f_list_id.description,
                        "created_at": lst.f_list_id.created_at
                    }
                    for lst in shared_lists
                ]
            }
        
        except Exception as e:
            return {"status": "fail", "msg": "Fail to get share list.", "data": []}
    