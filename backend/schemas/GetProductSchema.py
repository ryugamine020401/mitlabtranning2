from pydantic import BaseModel

class GetProductSchema(BaseModel):
    list_name: str