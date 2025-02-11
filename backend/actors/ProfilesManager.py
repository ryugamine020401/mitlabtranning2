from fastapi import APIRouter, Depends

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

    @staticmethod
    @router.post("/get_profile/")
    async def get_profile(current_user: UsersModel = Depends(get_current_user)):
        """
        獲取使用者基本資料
        """
        try:
            user_profile = await ProfilesModel.filter(f_user_uid=current_user).first()
            if not user_profile:
                return {"status": "fail", "msg": "Fail to get profile.", "data": []}

            # 回傳基本資料
            return {
                "status": "success",
                "msg": "Successful get profile.",
                "data": [{
                    "name": user_profile.name,
                    "phone_number": user_profile.phone_number,
                    "date_of_birth": user_profile.date_of_birth,
                    "address": user_profile.address,
                    "profile_picture_url": user_profile.profile_picture_url,
                    "bio": user_profile.bio
                }]
            }
        
        except Exception as e:
            return {"status": "fail", "msg": "Fail to get profile.", "data": []}

    @staticmethod
    @router.post("/update_profile/")
    async def update_profile(data: UpdateProfileSchema, current_user: UsersModel = Depends(get_current_user)):
        """
        更新使用者基本資料
        """
        try:
            user_profile = await ProfilesModel.filter(f_user_uid=current_user).first()
            if not user_profile:
                return {"status": "fail", "msg": "Fail to update profile."}

            # 更新有變動的資料
            update_data = data.dict(exclude_unset=True)  # 排除沒有提供的欄位

            # 處理圖片並儲存
            try:
                if update_data["profile_picture_url"] != user_profile.profile_picture_url:
                    # 刪除舊的圖片檔案
                    old_image_path = Path("resource") / str(current_user.user_uid) / "profile" / user_profile.profile_picture_url
                    if old_image_path.exists():
                        old_image_path.unlink()  # 刪除舊圖片檔案

                    # 儲存新的圖片並更新路徑
                    image_path = await handle_image_and_save(update_data["profile_picture_url"], str(current_user.user_uid), "profile")
                    update_data["profile_picture_url"] = image_path  # 更新為新的圖片路徑
            except ValueError as e:
                return {"status": "fail", "msg": "Fail to update profile."}

            # 更新資料
            if update_data:
                await ProfilesModel.filter(f_user_uid=current_user).update(**update_data)

            return {"status": "success", "msg": "Successful update profile."}
        
        except Exception as e:
            return {"status": "fail", "msg": "Fail to update profile."}
