from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from tortoise.contrib.fastapi import register_tortoise
import config

from utils import *
from actors import users_manager_router, profiles_manager_router, lists_manager_router, products_manager_router, permissions_manager_router, gpt_manager_router


app = FastAPI()
app.mount("/api/resource", StaticFiles(directory="resource"), name="resource")
app.include_router(users_manager_router, prefix="/api/UsersManager", tags=["Users Manager"])
app.include_router(profiles_manager_router, prefix="/api/ProfilesManager", tags=["Profiles Manager"])
app.include_router(lists_manager_router, prefix="/api/ListsManager", tags=["Lists Manager"])
app.include_router(products_manager_router, prefix="/api/ProductsManager", tags=["Products Manager"])
app.include_router(permissions_manager_router, prefix="/api/ListPermissionsManager", tags=["List Permissions Manager"])
app.include_router(gpt_manager_router, prefix="/api/GPTManager", tags=["GPT Manager"])


register_tortoise(
    app,
    config=config.TORTOISE_ORM,
    generate_schemas=True,
    add_exception_handlers=True,
)


@app.get("/api/")
async def read_root():
    return {"Hello": "World"}

# # 定義請求的 JSON 結構
# class GetStory(BaseModel):
#     product_name: str
#     expiry_date: str

# # 定義回傳 JSON 結構
# class ReturnStory(BaseModel):
#     title: str
#     paragraph: list[str]

# @app.post("/api/get_story/")
# async def get_story(data: GetStory):
#     try:
#         print("start...")
#         client = genai.Client(api_key=API_KEY)
#         response = client.models.generate_content(
#             model="gemini-2.0-flash",             
#             contents=generate_prompt(data.product_name, data.expiry_date),
#             config={
#                 'response_mime_type': 'application/json',
#                 'response_schema': list[ReturnStory],
#             }
#         )
#         print(f"Response: {response.text}")
#         my_story: list[ReturnStory] = response.parsed
#         return {
#             "status": "success", 
#             "msg": "Successful create a story.", 
#             "data": [
#                 {
#                     "title": story.title, 
#                     "story": story.paragraph
#                 } 
#                 for story in my_story
#             ]
#         }
    
#     except Exception as e:
#         return {"status": "fail", "msg": "Fail to create a story.", "data": []}