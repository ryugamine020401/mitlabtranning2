from typing import Union

from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
import config

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

register_tortoise(
    app,
    config = config.TORTOISE_ORM,
    generate_schemas = True,  # 自動生成資料表
    add_exception_handlers = True,
)