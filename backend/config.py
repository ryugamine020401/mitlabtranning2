"""
MySQL的Config
"""
import os
from dotenv import load_dotenv

# 加載 .env 檔案
load_dotenv()

DB_USERNAME=os.getenv('DB_USERNAME')
DB_PWD=os.getenv('DB_PWD')
DB_IP=os.getenv('DB_IP')
DB_PORT=os.getenv('DB_PORT')
DB_NAME=os.getenv('DB_NAME')

TORTOISE_ORM = {
    "connections": {
        "default": f"postgres://{DB_USERNAME}:{DB_PWD}@{DB_IP}:{DB_PORT}/{DB_NAME}",
    },
    "apps": {
        "models": {
            "models": [
                "models.UsersModel",
                "models.ProfilesModel",
                "models.ProductsModel",
                "models.ListsModel",
                "models.ListPermissionsModel",
                "aerich.models"
            ],
            "default_connection": "default",
        }
    }
}
