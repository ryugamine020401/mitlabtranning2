from utils import *
from schemas.ProductsSchema import *

router = APIRouter()

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

            # 處理圖片並儲存
            try:
                image_path = await handle_image_and_save(data.product_image_url, current_user.user_uid, user_list.list_uid)
            except ValueError as e:
                return {"status": "fail", "msg": "Fail to create product."}

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

    @staticmethod
    @router.post("/delete_product/")
    async def delete_product(data: DeleteProductSchema, current_user: UsersModel = Depends(get_current_user)):
        """
        提供已有帳號的使用者能在清單中刪除產品
        """
        try:
            # 查找清單是否存在，並且檢查是否屬於當前用戶
            user_list = await ListsModel.filter(list_uid=data.f_list_id, f_user_id=current_user).first()
            if not user_list:
                return {"status": "fail", "msg": "Fail to delete product."}
            
            # 查找產品是否存在於指定的清單中
            product = await ProductsModel.filter(id=data.id, f_list_id=data.f_list_id).first()
            if not product:
                return {"status": "fail", "msg": "Fail to delete product."}
            
            # 刪除產品的圖片檔案
            old_image_path = Path("/app") / product.product_image_url
            if old_image_path.exists():
                old_image_path.unlink()

            # 刪除產品
            await product.delete()
            
            return {"status": "success", "msg": "Successful delete product."}

        except Exception as e:
            return {"status": "fail", "msg": "Fail to delete product."}
        
    @router.post("/update_product/")
    async def update_product(data: UpdateProductSchema, current_user: UsersModel = Depends(get_current_user)):
        """
        提供已有帳號的使用者能在清單中更新產品資訊
        """
        try:
            # 查找清單是否存在，並且檢查是否屬於當前用戶
            user_list = await ListsModel.filter(list_uid=data.f_list_id, f_user_id=current_user).first()
            if not user_list:
                return {"status": "fail", "msg": "Fail to update product."}
            
            # 查找產品是否存在於指定的清單中
            product = await ProductsModel.filter(id=data.id, f_list_id=data.f_list_id).first()
            if not product:
                return {"status": "fail", "msg": "Fail to update product."}
            
            # 檢查產品條碼是否有更改，並確保新的條碼不重複
            if data.product_barcode != product.product_barcode:
                existing_product = await ProductsModel.filter(product_barcode=data.product_barcode, f_list_id=data.f_list_id).first()
                if existing_product:
                    return {"status": "fail", "msg": "This product barcode already exists in the list."}
            
            # 更新資料
            update_data = {
                "product_name": data.product_name,
                "product_barcode": data.product_barcode,
                "product_number": data.product_number,
                "expiry_date": data.expiry_date,
                "description": data.description
            }
            
            # 處理圖片並儲存
            try:
                # 刪除舊的圖片檔案
                old_image_path = Path("/app") / product.product_image_url
                if old_image_path.exists():
                    old_image_path.unlink()
                
                # 儲存新的圖片並更新路徑
                image_path = await handle_image_and_save(data.product_image_url, current_user.user_uid, user_list.list_uid)
                update_data["product_image_url"] = image_path  # 更新為新的圖片路徑
                
            except Exception as e:
                return {"status": "fail", "msg": "Fail to update product."}
            
            # 更新產品資料庫
            await ProductsModel.filter(id=data.id, f_list_id=data.f_list_id).update(**update_data)
            
            return {"status": "success", "msg": "Successful update product."}
        
        except Exception as e:
            return {"status": "fail", "msg": "Fail to update product."}
        
    @staticmethod
    @router.post("/dc_get_product/")
    async def get_product(data: CheckProductExpiryDateSchema):
        """
        獲取有效期限低於一個月的產品
        """
        responese_dict = {username:{"Expired":[], "ExpiredSoon":[]} for username in data.username}
       
        
        for username in data.username:
            
            print(f"username : {username}")
            userinstance = await UsersModel.get_or_none(username=username)
            products = await ProductsModel.filter(f_user_id=userinstance)
            for product in products:
                print(f"user {username} has {product.product_name} it expiry_date is {product.expiry_date}")
                expiry_date = datetime.strptime(product.expiry_date, "%Y-%m-%d")
                now = datetime.now()
                three_months_before_expiry = expiry_date - timedelta(days=90)
                print(three_months_before_expiry)
                if now > expiry_date:
                    print("❌ 已過期！")
                    responese_dict[username]['Expired'].append(product.product_name)
                elif now >= three_months_before_expiry:
                    print("⚠️ 快過期了！")
                    responese_dict[username]['ExpiredSoon'].append(product.product_name)
                else:
                    print("✅ 還有足夠的時間！")
        print(responese_dict)
        return {"status": "success", "msg": "success to get product.", "data": responese_dict}
