from fastapi import APIRouter, Depends
from datetime import datetime
import random, string, shutil

from utils import *
from models import UsersModel, ListsModel
from schemas.ListsSchema import *

router = APIRouter()

async def generate_unique_list_uid() -> str:
    """
    生成一個唯一的 6 位亂數 list_uid，保證不重複
    """
    while True:
        list_uid = ''.join(random.choices(string.digits, k=6))  # 生成 6 位數字亂數
        existing_list = await ListsModel.filter(list_uid=list_uid).first()
        if not existing_list:
            return list_uid


class ListsManager:
    @staticmethod
    @router.post("/get_list/")
    async def get_list(current_user: UsersModel = Depends(get_current_user)):
        """
        獲取清單
        """
        try:
            user_lists = await ListsModel.filter(f_user_id=current_user)
            if not user_lists:
                return {"status": "success", "msg": "No have any list.", "data": []}

            # 回傳清單資料
            return {
                "status": "success",
                "msg": "Successful get list.",
                "data": [
                    {
                        "list_uid": lst.list_uid,
                        "list_name": lst.list_name,
                        "description": lst.description,
                        "created_at": lst.created_at
                    }
                    for lst in user_lists
                ]
            }

        except Exception as e:
            return {"status": "fail", "msg": "Fail to get list.", "data": []}

    @staticmethod
    @router.post("/create_list/")
    async def create_list(data: CreateListSchema, current_user: UsersModel = Depends(get_current_user)):
        """
        新增清單
        """
        try:
            # 檢查清單名稱是否已存在
            existing_list = await ListsModel.filter(f_user_id=current_user, list_name=data.list_name).first()
            if existing_list:
                return {"status": "fail", "msg": "This list_name has already exist."}

            created_at = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            list_uid = await generate_unique_list_uid()
            
            # 創建清單
            new_list = await ListsModel.create(
                list_uid=list_uid,
                f_user_id=current_user,
                list_name=data.list_name,
                description=data.description,
                created_at=created_at,
            )

            return {"status": "success", "msg": "Successful create list."}

        except Exception as e:
            return {"status": "fail", "msg": "Fail to create list."}

    @staticmethod
    @router.post("/delete_list/")
    async def delete_list(data: DeleteListSchema, current_user: UsersModel = Depends(get_current_user)):
        """
        提供已有帳號的使用者能刪除清單
        """
        try:
            # 查找清單是否存在
            user_list = await ListsModel.filter(list_uid=data.list_uid, f_user_id=current_user).first()
            if not user_list:
                return {"status": "fail", "msg": "Fail to delete list."}
            
            # 刪除與該清單相關的產品圖片
            folder_path = Path("resource") / str(current_user.user_uid) / user_list.list_name
            if folder_path.exists():
                shutil.rmtree(folder_path)  # 移除整個資料夾及其內容

            # 刪除清單
            await user_list.delete()
            return {"status": "success", "msg": "Successful delete list."}

        except Exception as e:
            return {"status": "fail", "msg": "Fail to delete list."}
        
    @staticmethod
    @router.post("/update_list/")
    async def update_list(data: UpdateListSchema, current_user: UsersModel = Depends(get_current_user)):
        """
        提供已有帳號的使用者能更新單一清單內容
        """
        try:
            # 查找清單是否存在
            user_list = await ListsModel.filter(list_uid=data.list_uid, f_user_id=current_user).first()
            if not user_list:
                return {"status": "fail", "msg": "Fail to update list."}

            update_data = {}
            # 若 list_name 與 list_uid 目前的 list_name 不同，則需要檢查該用戶是否已有相同 list_name
            if data.list_name and data.list_name != user_list.list_name:
                existing_list = await ListsModel.filter(list_name=data.list_name, f_user_id=current_user).first()
                if existing_list:
                    return {"status": "fail", "msg": "This list_name already exists."}
                update_data["list_name"] = data.list_name  # 允許更新 list_name

            # 更新 description
            if data.description is not None:
                update_data["description"] = data.description

            await ListsModel.filter(list_uid=data.list_uid, f_user_id=current_user).update(**update_data)

            return {"status": "success", "msg": "Successful update list."}

        except Exception as e:
            return {"status": "fail", "msg": "Fail to update list."}
        
