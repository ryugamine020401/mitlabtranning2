from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from tortoise.contrib.fastapi import register_tortoise
import config

from utils import *
from actors import users_manager_router, profiles_manager_router, lists_manager_router, products_manager_router, permissions_manager_router, bot_manager_router


app = FastAPI()
app.mount("/api/resource", StaticFiles(directory="resource"), name="resource")
app.include_router(users_manager_router, prefix="/api/UsersManager", tags=["Users Manager"])
app.include_router(profiles_manager_router, prefix="/api/ProfilesManager", tags=["Profiles Manager"])
app.include_router(lists_manager_router, prefix="/api/ListsManager", tags=["Lists Manager"])
app.include_router(products_manager_router, prefix="/api/ProductsManager", tags=["Products Manager"])
app.include_router(permissions_manager_router, prefix="/api/ListPermissionsManager", tags=["List Permissions Manager"])
app.include_router(bot_manager_router, prefix="/api/BotManager", tags=["Bot Manager"])


register_tortoise(
    app,
    config=config.TORTOISE_ORM,
    generate_schemas=True,
    add_exception_handlers=True,
)


@app.get("/api/")
async def read_root():
    return {"Hello": "World"}
