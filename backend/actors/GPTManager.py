from utils import *
from schemas.GPTSchema import *

router = APIRouter()

class GPTManager:
    @staticmethod
    @router.post("/get_story/")
    async def get_story(data: GetStory):
        """
        創建有趣故事
        """
        try:
                print("start...")
                client = genai.Client(api_key=API_KEY)
                response = client.models.generate_content(
                    model="gemini-2.0-flash",             
                    contents=generate_prompt(data.product_name, data.expiry_date),
                    config={
                        'response_mime_type': 'application/json',
                        'response_schema': list[ReturnStory],
                    }
                )
                print(f"Response: {response.text}")
                my_story: list[ReturnStory] = response.parsed
                return {
                    "status": "success", 
                    "msg": "Successful create a story.", 
                    "data": [
                        {
                            "title": story.title, 
                            "story": story.paragraph
                        } 
                        for story in my_story
                    ]
                }
            
        except Exception as e:
            return {"status": "fail", "msg": "Fail to create a story.", "data": [], "e": str(e)}
