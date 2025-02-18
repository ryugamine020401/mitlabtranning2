import asyncio, httpx, json, os, sys

# 使用絕對路徑來確保 app 資料夾正確加入
sys.path.insert(0, '/app')

from utils import *
from schemas import *

# 讀取測試資料
with open("./tests/test_login.json", "r") as f:
    test_data = json.load(f)

async def login_test_case():
    """
    測試流程:
        1) create_user
            a) 成功註冊
            b) email 已註冊
            c) username 已註冊
        2) login_user
            a) 成功登入
            b) username 不存在
            c) 登入資訊錯誤
        3) delete_user
    """
    async with httpx.AsyncClient() as client:
        # 1) create_user
        create_user_url = f"{FRONTEND_URL}/api/UsersManager/create_user/"
        for user in test_data["user_data"]:
            user_data = {
                "username": user["username"],
                "email": user["email"],
                "password": user["password"],
                "name": user["name"],
                "phone_number": user["phone_number"],
                "date_of_birth": user["date_of_birth"],
                "address": user["address"],
            }
            resp = await client.post(create_user_url, json=user_data)
            assert resp.status_code == 200, "建立使用者應回200"
            resp_json = resp.json()
            assert resp_json.get("status") == user.get("status"), "建立使用者"
            assert resp_json.get("msg") == user.get("msg")
            print("=== create_user =>", resp_json, "===")

        # 2) login_user
        login_user_url = f"{FRONTEND_URL}/api/UsersManager/login_user/"
        token = None
        for login in test_data["login_data"]:
            login_data = {
                "username": login["username"],
                "email": login["email"],
                "password": login["password"]
            }
            resp = await client.post(login_user_url, json=login_data)
            assert resp.status_code == 200, "登入應回200"
            resp_json = resp.json()
            assert resp_json.get("status") == login["status"], "登入"
            assert resp_json.get("msg") == login["msg"]
            if resp_json["status"] == "success":
                token = resp_json["data"][0]["token"]
            print("=== login_user =>", resp_json, "===")

        # 3) delete_user
        if token:
            delete_user_url = f"{FRONTEND_URL}/api/UsersManager/delete_user/"
            headers = {"Authorization": f"Bearer {token}"}
            resp = await client.post(delete_user_url, headers=headers)
            assert resp.status_code == 200, "刪除成功應回200"
            print("=== delete_user =>", resp.status_code, resp.json(), "===")

        print("=== Success finish Login Test. ===")

if __name__ == "__main__":
    asyncio.run(login_test_case())

# async def login_test_case():
#     """
#     測試流程:
#         1) create_user
#             a) 成功註冊
#             b) email 已註冊
#             c) username 已註冊
#         2) login_user
#             a) 成功登入
#             b) username 不存在
#             c) 登入資訊錯誤
#         3) delete_user
#     """
#     async with httpx.AsyncClient() as client:
#         # 1a) create_user
#         create_user_url = f"{FRONTEND_URL}/api/UsersManager/create_user/"
#         user_data_a = {
#             "username": "test_user_1",
#             "email": "test_user_1@example.com",
#             "password": "testpassword",
#             "name": "Test User",
#             "phone_number": "1234567890",
#             "date_of_birth": "1990-01-01",
#             "address": "123 Test Street"
#         }
#         resp = await client.post(create_user_url, json=user_data_a)
#         assert resp.status_code == 200, "建立使用者成功應回200"
#         resp_json = resp.json()
#         assert resp_json.get("status") == "success", "建立使用者成功"
#         assert resp_json.get("msg") == "Successful registration."
#         print("=== create_user =>", resp_json, "===")

#         # 1b) create_user
#         user_data_b = {
#             "username": "test_user_2",
#             "email": "test_user_1@example.com",
#             "password": "testpassword",
#             "name": "Test User",
#             "phone_number": "1234567890",
#             "date_of_birth": "1990-01-01",
#             "address": "123 Test Street"
#         }
#         resp = await client.post(create_user_url, json=user_data_b)
#         assert resp.status_code == 200, "建立使用者失敗應回200"
#         resp_json = resp.json()
#         assert resp_json.get("status") == "fail", "建立使用者失敗"
#         assert resp_json.get("msg") == "This email has already been registered."
#         print("=== create_user =>", resp_json, "===")
        
#         # 1c) create_user
#         user_data_c = {
#             "username": "test_user_1",
#             "email": "test_user_2@example.com",
#             "password": "testpassword",
#             "name": "Test User",
#             "phone_number": "1234567890",
#             "date_of_birth": "1990-01-01",
#             "address": "123 Test Street"
#         }
#         resp = await client.post(create_user_url, json=user_data_c)
#         assert resp.status_code == 200, "建立使用者失敗應回200"
#         resp_json = resp.json()
#         assert resp_json.get("status") == "fail", "建立使用者失敗"
#         assert resp_json.get("msg") == "This username has already been registered."
#         print("=== create_user =>", resp_json, "===")
        
#         # 2a) login_user
#         login_data_url = f"{FRONTEND_URL}/api/UsersManager/login_user/"
#         login_data = {
#             "username": user_data_a["username"],
#             "email": user_data_a["email"],
#             "password": user_data_a["password"]
#         }
#         resp = await client.post(login_data_url, json=login_data)
#         assert resp.status_code == 200, "登入成功應回200"
#         resp_json = resp.json()
#         assert resp_json.get("status") == "success", "登入成功"
#         token = resp_json["data"][0]["token"]
#         print("=== login_user =>", resp_json, "===")
        
#         # 2b) login_user
#         login_data = {
#             "username": "123",
#             "email": user_data_a["email"],
#             "password": user_data_a["password"]
#         }
#         resp = await client.post(login_data_url, json=login_data)
#         assert resp.status_code == 200, "登入成功應回200"
#         resp_json = resp.json()
#         assert resp_json.get("status") == "fail", "登入失敗"
#         print("=== login_user =>", resp_json, "===")
        
#         # 2c) login_user
#         login_data = {
#             "username": user_data_a["username"],
#             "email": user_data_a["email"],
#             "password": "123"
#         }
#         resp = await client.post(login_data_url, json=login_data)
#         assert resp.status_code == 200, "登入成功應回200"
#         resp_json = resp.json()
#         assert resp_json.get("status") == "fail", "登入失敗"
#         print("=== login_user =>", resp_json, "===")

#         # 3) delete_user
#         delete_user_url = f"{FRONTEND_URL}/api/UsersManager/delete_user/"
#         headers = {"Authorization": f"Bearer {token}"}
#         resp = await client.post(delete_user_url, headers=headers)
#         assert resp.status_code == 200, "刪除成功應回200"
#         print("=== delete_user =>", resp.status_code, resp.json(), "===")

#         # final
#         print("=== Success finish Login Test. ===")

# if __name__ == "__main__":
#     asyncio.run(login_test_case())
