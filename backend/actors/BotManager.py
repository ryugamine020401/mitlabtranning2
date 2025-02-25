from utils import *
from schemas.BotSchema import *

router = APIRouter()

class BotManager:
    @staticmethod
    @router.post("/get_story/")
    async def get_story(data: GetStory, current_user: UsersModel = Depends(get_current_user)):
        """
        創建有趣故事
        """
        try:
            client = genai.Client(api_key=API_KEY)
            response = client.models.generate_content(
                model="gemini-2.0-flash",             
                contents=generate_prompt(data.product_name, data.expiry_date),
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': list[ReturnStory],
                }
            )
            my_story: list[ReturnStory] = response.parsed

            return {
                "status": "success", 
                "msg": "Successful create a story.", 
                "data": {
                    "title": my_story[0].title,  
                    "story": my_story[0].story  
                }
            }
            
        except Exception as e:
            return {"status": "fail", "msg": "Fail to create a story.", "data": []}
