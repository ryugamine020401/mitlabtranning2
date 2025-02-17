import asyncio, httpx, json, os, sys

# 使用絕對路徑來確保 app 資料夾正確加入
sys.path.insert(0, '/app')

from utils import *
from schemas import *

# 讀取測試資料
with open("./tests/test_update_profile.json", "r") as f:
    test_data = json.load(f)

async def update_profile_test_case():
    """
    測試流程:
        1) create_user
        2) login_user
        3) get_profile
        4) update_profile
        5) delete_user
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

        # 3) get_profile
        if token:
            get_profile_url = f"{FRONTEND_URL}/api/ProfilesManager/get_profile/"
            headers = {"Authorization": f"Bearer {token}"}
            resp = await client.post(get_profile_url, headers=headers)
            assert resp.status_code == 200, "登入應回200"
            resp_json = resp.json()
            assert resp_json.get("status") == "success", "獲取基本資料"
            print("=== get_profile =>", resp_json, "===")

        # 4) update_profile
        if token:
            update_profile_url = f"{FRONTEND_URL}/api/ProfilesManager/update_profile/"
            headers = {"Authorization": f"Bearer {token}"}
            for update_profile in test_data["update_profile_data"]:
                profile_data = {
                    "name": update_profile["name"],
                    "phone_number": update_profile["phone_number"],
                    "date_of_birth": update_profile["date_of_birth"],
                    "address": update_profile["address"],
                    "profile_picture_url": update_profile["profile_picture_url"],
                    "bio": update_profile["bio"]
                }
                resp = await client.post(update_profile_url, headers=headers, json=profile_data)
                assert resp.status_code == 200, "登入應回200"
                resp_json = resp.json()
                assert resp_json.get("status") == update_profile["status"], "更新基本資料"
                assert resp_json.get("msg") == update_profile["msg"]
                print("=== update_profile =>", resp_json, "===")

        # 5) delete_user
        if token:
            delete_user_url = f"{FRONTEND_URL}/api/UsersManager/delete_user/"
            headers = {"Authorization": f"Bearer {token}"}
            resp = await client.post(delete_user_url, headers=headers)
            assert resp.status_code == 200, "刪除成功應回200"
            print("=== delete_user =>", resp.status_code, resp.json(), "===")

        print("=== Success finish Update Profile Test. ===")

if __name__ == "__main__":
    asyncio.run(update_profile_test_case())
