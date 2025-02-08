from fastapi import APIRouter

from utils import *
from models import UsersModel, ProfilesModel
from schemas.ProfilesSchema import *

router = APIRouter()

class ProfilesManager:
    @staticmethod
    @router.post("/create_profile/")
    async def create_profile(data: CreateProfileSchema):
        """
        創建使用者基本資料
        """
        try:
            # 檢查資料完整性
            if not all([data.f_user_id, data.name, data.phone_number, data.date_of_birth, data.address]):
                return {"status": "fail", "msg": "Fail to create profile."}
            
            # 檢查使用者是否存在
            current_user = await UsersModel.filter(user_uid=data.f_user_id).first()
            if not current_user:
                return {"status": "fail", "msg": "Fail to create profile."}

            # 檢查該用戶是否已經有 profile
            existing_profile = await ProfilesModel.filter(f_user_uid=current_user).first()
            if existing_profile:
                return {"status": "fail", "msg": "Fail to create profile."}

            # 創建基本資料
            profile = await ProfilesModel.create(
                f_user_uid=current_user,
                name=data.name,
                phone_number=data.phone_number,
                date_of_birth=data.date_of_birth,
                address=data.address
            )

            return {"status": "success", "msg": "Successful create profile."}

        except Exception as e:
            return {"status": "fail", "msg": "Fail to create profile."}
