from utils import *
from schemas.UsersSchema import *

router = APIRouter()

async def get_next_id(table) -> str:
    """
    查詢資料庫中最大的 id，並返回下一個 id
    """
    qs = await table.all()  # 先 await table.all() 取得查詢集
    print(f"qs : {qs}")
    # max_id_list = await qs.values_list("id", flat=True)  # 再從查詢集取得所有 id

    # if not max_id_list:  # 如果沒有數據，直接從 1 開始
    #     return "1"

    max_id = await table.all().values_list("id", flat=True)  # 取得所有 id
    print(table.all())
    max_id = max(map(int, max_id), default=0)  # 找出最大 id，確保是整數
    return str(max_id + 1)  # 返回下一個 ID

async def generate_unique_user_uid() -> str:
    """
    生成一個唯一的 6 位亂數 user_uid，保證不重複
    """
    while True:
        user_uid = ''.join(random.choices(string.digits, k=6))  # 生成 6 位數字亂數
        existing_user = await UsersModel.filter(user_uid=user_uid).first()
        if not existing_user:
            return user_uid

async def generate_unique_verify_num() -> str:
    """
    生成唯一的 6 位數驗證碼，並確保不重複
    """
    while True:
        verify_num = ''.join(random.choices(string.digits, k=6))  # 生成 6 位數字亂數
        existing_user = await UsersModel.filter(verify_num=verify_num).first()
        if not existing_user:
            return verify_num

async def send_reset_email(email: str, verify_num: str):
    """
    透過 SMTP 發送重設密碼的驗證碼
    """
    
    msg = MIMEText(f"您的密碼重設驗證碼為: {verify_num}")
    msg["Subject"] = "密碼重設驗證碼"
    msg["From"] = SENDER_EMAIL
    msg["To"] = email
    
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, [email], msg.as_string())
        server.quit()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send email")

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    創建 JWT Token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


class UsersManager:
    @staticmethod
    @router.post("/create_user/")
    async def create_user(data: CreatesUserSchema):
        """
        使用者註冊
        """
        try:
            # 檢查 email 是否已註冊
            existing_email = await UsersModel.filter(email=data.email).first()
            if existing_email:
                return {"status": "fail", "msg": "This email has already been registered.", "data": []}

            # 檢查 username 是否已存在
            existing_user = await UsersModel.filter(username=data.username).first()
            if existing_user:
                return {"status": "fail", "msg": "This username has already been registered.", "data": []}

            next_id = await get_next_id(UsersModel)
            user_uid = await generate_unique_user_uid()
            current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

            # 建立新用戶，密碼需加密
            user = await UsersModel.create(
                id=next_id,
                user_uid=user_uid,
                username=data.username,
                email=data.email,
                password=data.password,
                verify_num=str(-1),
                created_at=current_time,
                updated_at=current_time
            )

            # 創建 profile
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{FRONTEND_URL}/api/ProfilesManager/create_profile/",  # FastAPI 伺服器網址
                    json={
                        "f_user_id": user.user_uid,
                        "name": data.name,
                        "phone_number": data.phone_number,
                        "date_of_birth": data.date_of_birth,
                        "address": data.address
                    }
                )
                result = response.json()

            return {
                "status": "success", 
                "msg": "Successful registration.",
                "data": result
            }
        
        except Exception as e:
            return {"status": "fail", "msg": "Fail to create user.", "data": []}

    @staticmethod
    @router.post("/login_user/")
    async def login_user(data: LoginUserSchema):
        """
        使用者登入
        """
        try:
            # 查詢用戶，檢查 username 是否存在
            user = await UsersModel.filter(username=data.username).first()
            if not user:
                return {"status": "fail", "msg": "This user doesn't exist.", "data": []}

            # 驗證 password 和 email
            if user.password != data.password or user.email != data.email:  # 這裡是明文比對，未來應該改用加密驗證
                return {"status": "fail", "msg": "The email or password is wrong.", "data": []}

            # 創建 JWT Token
            access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(data={"sub": user.user_uid}, expires_delta=access_token_expires)

            # 確認登入，回傳 token
            return {"status": "success", "msg": "Successful login.", "data": [{"token": access_token}]}
        
        except Exception as e:
            return {"status": "fail", "msg": "Fail to login.", "data": []}
    
    @staticmethod
    @router.post("/forgetPW_user/")
    async def forgetPW_user(data: ForgetPasswordUserSchema):
        """
        使用者忘記密碼，發送驗證碼至郵箱
        """
        try:
            # 查詢用戶
            user = await UsersModel.filter(username=data.username, email=data.email).first()
            if not user:
                return {"status": "fail", "msg": "Incorrect information or account does not exist."}
            
            # 生成唯一驗證碼並儲存
            verify_num = await generate_unique_verify_num()
            user.verify_num = verify_num
            await user.save()
            
            # 發送郵件
            await send_reset_email(data.email, verify_num)
            
            return {"status": "success", "msg": "Reset password link sent to your email."}
        
        except Exception as e:
            return {"status": "fail", "msg": "Fail to sent verify number to your email."}

    @staticmethod
    @router.post("/resetPW_user/")
    async def resetPW_user(data: ResetPasswordUserSchema):
        """
        使用者重設密碼
        """
        try:
            # 查詢用戶
            user = await UsersModel.filter(username=data.username, email=data.email).first()
            if not user:
                return {"status": "fail", "msg": "Fail to reset password."}

            # 驗證 verify_num
            if user.verify_num == "-1" or user.verify_num != data.verify_num:
                return {"status": "fail", "msg": "Fail to reset password."}

            # 重設密碼
            user.password = data.password
            user.verify_num = "-1"
            await user.save()

            return {"status": "success", "msg": "Successful reset password."}

        except Exception as e:
            return {"status": "fail", "msg": "Fail to reset password."}

    @staticmethod
    @router.post("/updatePW_user/")
    async def updatePW_user(data: UpdatePasswordUserSchema, current_user: UsersModel = Depends(get_current_user)):
        """
        使用者更新密碼
        """
        try:
            # 確保舊密碼和新密碼不同
            if data.old_password == data.new_password:
                return {"status": "fail", "msg": "Fail to update password."}

            # 驗證舊密碼是否正確
            if current_user.password != data.old_password:
                return {"status": "fail", "msg": "Old password is wrong."}

            # 更新密碼
            await UsersModel.filter(user_uid=current_user.user_uid, email=current_user.email).update(password=data.new_password)

            return {"status": "success", "msg": "Successful update password."}

        except Exception as e:
            return {"status": "fail", "msg": "Fail to update password."}
        
    @staticmethod
    @router.post("/delete_user/")
    async def delete_user(current_user: UsersModel = Depends(get_current_user)):
        """
        使用者刪除帳號
        """
        await current_user.delete()

        # 刪除與該清單相關的產品圖片
        folder_path = Path("/app/resource") / str(current_user.user_uid)
        if folder_path.exists():
            shutil.rmtree(folder_path)  # 移除整個資料夾及其內容

        return {"status": "success", "msg": "Successful delete user."}
    
    @staticmethod
    @router.post("/dc_register_user/")
    async def test_dc(data: RegisterDCUserSchema):
        """
        測試
        """
        print(data.username)
        # return {"status": "success", "msg": "User found.", "username": data.username}
        user = await UsersModel.filter(username=data.username)
        if user:
            return {"status": "success", "msg": "User found.", "username": data.username}
        else:
            raise HTTPException(status_code=404, detail="User not found")

        

