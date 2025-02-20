
import sys
import os
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-secret-key")  # 如果未設置，使用預設密鑰
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", 15))


import pytest
from unittest.mock import AsyncMock, MagicMock, patch


from actors.UsersManager import get_next_id
from actors.UsersManager import generate_unique_user_uid
from actors.UsersManager import generate_unique_verify_num
from actors.UsersManager import create_access_token
from actors import UsersManager

from models.UsersModel import UsersModel
# 自訂的 FakeQuerySet 
class FakeQuerySet:
    def __init__(self, data):
        self.data = data

    async def values_list(self, *fields, flat=False):
        if not fields:
            raise ValueError("至少要提供一個欄位名稱")

        if flat:
            return [item[fields[0]] for item in self.data]  # 只回傳指定欄位的列表
        return [tuple(item[field] for field in fields) for item in self.data]  # 回傳多欄位的 tuple 列表

    def __await__(self):
        async def dummy():
            return self
        return dummy().__await__()




@pytest.mark.finished
@pytest.mark.parametrize("table_data, expect", [
    ([], "1"),
    ([{ "username":"user_1", "id": 1}, {"id": 2}, {"id": 3}, {"id": 4}], "5"),
    ([{"id": 1}, {"id": 3}, {"id": 4}, {"id": 7}], "8"),
    ([{"id": 1}, {"id": 8}, {"id": 4}, {"id": 2}], "9"),
])
async def test_get_next_id(table_data, expect):
    """ 測試 get_next_id() 在不同情境下的行為 """

    # 用 MagicMock 模擬 table，讓 all() 返回一個 FakeQuerySet 物件
    table_mock = MagicMock()
    table_mock.all.return_value = FakeQuerySet(table_data)

    # 呼叫原本的 get_next_id 函式（保留生產程式碼中的鏈式 await）
    next_id = await get_next_id(table_mock)

    # 驗證結果
    assert next_id == expect


@pytest.mark.asyncio
async def test_generate_unique_user_uid_no_collision():
    """
    測試當沒有重複 user_uid 時，應該直接返回生成的 ID
    """

    # Mock `UsersModel.filter().first()` 回傳 None，表示沒有重複
    async_mock = AsyncMock()
    async_mock.first.return_value = None

    with patch.object(UsersModel, "filter", return_value=async_mock):
        user_uid = await generate_unique_user_uid()

        # 檢查 user_uid 是否為 6 位數字
        assert len(user_uid) == 6

# 測試 Token 是否能成功創建
def test_create_access_token():
    data = {"sub": "test_user"}
    token = create_access_token(data)
    assert isinstance(token, str)  # 確保 token 是字串格式

# 測試 Token 是否包含正確的 payload
def test_create_access_token_payload():
    data = {"sub": "test_user"}
    token = create_access_token(data)
    decoded_data = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    print(decoded_data)
    assert decoded_data["sub"] == "test_user"

# 測試 Token 是否正確處理 expires_delta
def test_create_access_token_expiry():
    data = {"sub": "test_user"}
    expires_delta = timedelta(minutes=5)
    token = create_access_token(data, expires_delta)

    decoded_data = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    
    exp_timestamp = decoded_data["exp"]
    exp_datetime = datetime.utcfromtimestamp(exp_timestamp)
    
    expected_exp = datetime.utcnow() + expires_delta
    assert abs((exp_datetime - expected_exp).total_seconds()) < 2  # 確保誤差在2秒內

# 測試 Token 是否可解析
def test_create_access_token_decodable():
    print("Current working directory:", os.getcwd())
    data = {"sub": "test_user"}
    token = create_access_token(data)

    try:
        decoded_data = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        assert "sub" in decoded_data
    except jwt.ExpiredSignatureError:
        pytest.fail("Token 已過期")

from fastapi.testclient import TestClient
from main import app

app.include_router(UsersManager.router)

# @pytest.fixture
# def client():
#     with TestClient(app) as c:
#         yield c

# @pytest.mark.asyncio
# async def test_create_user(client):
#     """
#     測試建立使用者 API
#     """
#     mock_user = None  # 模擬沒有該使用者存在
#     with patch.object(UsersModel, "filter", return_value=AsyncMock(first=AsyncMock(return_value=mock_user))):
#         with patch.object(UsersModel, "create", new_callable=AsyncMock) as mock_create:
#             mock_create.return_value = AsyncMock(id=1, user_uid="user123")

#             response = await client.post("/create_user/", json={
#                 "username": "testuser",
#                 "email": "test@example.com",
#                 "password": "securepassword"
#             })

#             assert response.status_code == 200
#             assert response.json()["status"] == "success"