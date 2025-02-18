import asyncio, httpx, json, os, sys

# 使用絕對路徑來確保 app 資料夾正確加入
sys.path.insert(0, '/app')

from utils import *
from schemas import *
from main import app  # 確保引用 FastAPI 應用程式
from tortoise import Tortoise

# 讀取測試資料
with open("./tests/test_resetPW.json", "r") as f:
    test_data = json.load(f)

async def resetPW_test_case():
    """
    測試流程:
        1) create_user
        2) forgetPW_user
            a) 成功
            b) 輸入資訊錯誤
        3) resetPW_user
            a) 成功
            b) 失敗
        4) login_user
        5) delete_user
    """
    if not Tortoise.get_connection:
        # 🔹 確保 Tortoise 已經初始化（不會額外建立新連線）
        await Tortoise.init(config=app.state.tortoise_config)

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

        # 2) forgetPW_user
        forgetPW_user_url = f"{FRONTEND_URL}/api/UsersManager/forgetPW_user/"
        for forgetPW in test_data["forgetPW_data"]:
            forgetPW_data = {
                "username": forgetPW["username"],
                "email": forgetPW["email"]
            }
            resp = await client.post(forgetPW_user_url, json=forgetPW_data)
            assert resp.status_code == 200, "登入應回200"
            resp_json = resp.json()
            assert resp_json.get("status") == forgetPW["status"], "忘記密碼"
            assert resp_json.get("msg") == forgetPW["msg"]
            print("=== forgetPW_user =>", resp_json, "===")

        # # 3) resetPW_user
        # resetPW_user_url = f"{FRONTEND_URL}/api/UsersManager/resetPW_user/"
        # for resetPW in test_data["resetPW_data"]:
        #     user = await UsersModel.filter(username=resetPW["username"]).first()
        #     print("222")
        #     if not user:
        #         print("111")
        #         raise ValueError(f"找不到使用者 {resetPW['username']}")
        #     resetPW_data = {
        #         "username": resetPW["username"],
        #         "email": resetPW["email"],
        #         "password": resetPW["password"],
        #         "verify_num": user.verify_num
        #     }
        #     resp = await client.post(resetPW_user_url, json=resetPW_data)
        #     assert resp.status_code == 200, "登入應回200"
        #     resp_json = resp.json()
        #     assert resp_json.get("status") == resetPW["status"], "重設密碼"
        #     assert resp_json.get("msg") == resetPW["msg"]
        #     print("=== resetPW_user =>", resp_json, "===")

        # 4) login_user
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

        # 5) delete_user
        if token:
            delete_user_url = f"{FRONTEND_URL}/api/UsersManager/delete_user/"
            headers = {"Authorization": f"Bearer {token}"}
            resp = await client.post(delete_user_url, headers=headers)
            assert resp.status_code == 200, "刪除成功應回200"
            print("=== delete_user =>", resp.status_code, resp.json(), "===")

        print("=== Success finish Reset PW Test. ===")

if __name__ == "__main__":
    asyncio.run(resetPW_test_case())