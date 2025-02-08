from fastapi import APIRouter, Depends
from datetime import datetime
import random, string

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
            # 檢查資料完整性
            if not data.list_name:
                return {"status": "fail", "msg": "Fail to create list."}

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
            return {"status": "fail", "msg": "Fail to create list.", "e": str(e)}
