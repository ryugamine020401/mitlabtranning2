from fastapi import APIRouter, Depends
from pathlib import Path
from uuid import uuid4
import base64

from utils import *
from models import UsersModel, ListsModel, ProductsModel
from schemas.ProductsSchema import *

router = APIRouter()

def correct_base64_padding(base64_str: str) -> str:
    # 根據字串長度來補充適當的填充字符
    return base64_str + "=" * (4 - len(base64_str) % 4) if len(base64_str) % 4 != 0 else base64_str

class ProductsManager:
    @staticmethod
    @router.post("/get_product/")
    async def get_product(data: GetProductSchema, current_user: UsersModel = Depends(get_current_user)):
        """
        獲取產品
        """
        try:
            # 查詢該清單是否存在
            user_lists = await ListsModel.filter(list_uid=data.f_list_id).first()
            if not user_lists:
                return {"status": "fail", "msg": "Fail to get product.", "data": []}

            # 查詢該清單底下的所有商品
            products = await ProductsModel.filter(f_list_id=data.f_list_id).all()
            if not products:
                return {"status": "success", "msg": "No have any product in this list.", "data": []}
            
            # 回傳商品資訊
            return {
                "status": "success",
                "msg": "Successful get product.",
                "data": [
                    {
                        "id": product.id,
                        "product_name": product.product_name,
                        "product_barcode": product.product_barcode,
                        "product_number": product.product_number,
                        "product_image_url": product.product_image_url,
                        "expiry_date": product.expiry_date,
                        "description": product.description
                    }
                    for product in products
                ]
            }
        
        except Exception as e:
            return {"status": "fail", "msg": "Fail to get product.", "data": []}

    @staticmethod
    @router.post("/create_product/")
    async def create_product(data: CreateProductSchema, current_user: UsersModel = Depends(get_current_user)):
        """
        新增產品
        """
        try:
            # 確認清單是否存在且屬於當前用戶
            user_list = await ListsModel.filter(list_uid=data.f_list_id, f_user_id=current_user).first()
            if not user_list:
                return {"status": "fail", "msg": "Fail to create product."}

            # 確認產品是否已存在（依條碼和有效期判定）
            existing_product = await ProductsModel.filter(f_list_id=user_list, product_barcode=data.product_barcode, expiry_date=data.expiry_date).first()
            if existing_product:
                return {"status": "fail", "msg": "This product with the same barcode and expiry date already exists."}

            # 處理 Base64 編碼的圖片
            try:
                data.product_image_url = correct_base64_padding(data.product_image_url)
                image_data = base64.b64decode(data.product_image_url)  # 解碼 Base64 圖片
            except Exception as e:
                return {"status": "fail", "msg": "Invalid Base64 image encoding.", "e": str(e)}

            # 建立資料夾結構：resource/{user_uid}/{list_name}/
            folder_path = Path("resource") / str(current_user.user_uid) / str(user_list.list_name)

            # 檢查資料夾是否存在，如果不存在則建立
            if not folder_path.exists():
                folder_path.mkdir(parents=True, exist_ok=True)

            # 儲存圖片
            unique_filename = f"{uuid4().hex}.jpg"  # 假設圖片儲存為 JPG 格式
            image_path = folder_path / unique_filename

            with open(image_path, "wb") as buffer:
                buffer.write(image_data)

            # 創建商品
            new_product = await ProductsModel.create(
                f_user_id=current_user,
                f_list_id=user_list,
                product_name=data.product_name,
                product_barcode=data.product_barcode,
                product_number=data.product_number,
                product_image_url=str(image_path),
                expiry_date=data.expiry_date,
                description=data.description
            )

            return {"status": "success", "msg": "Successful create product."}

        except Exception as e:
            return {"status": "fail", "msg": "Fail to create product."}
