
import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

import pytest
from actors.UsersManager import get_next_id
from unittest.mock import AsyncMock, MagicMock


# 自訂的 FakeQuerySet 如上
class FakeQuerySet:
    def __init__(self, data):
        self.data = data

    async def values_list(self, *fields, flat=False):
        if not fields:
            raise ValueError("至少要提供一個欄位名稱")

        if flat:
            return [item[fields[0]] for item in self.data]  # 只回傳指定欄位的列表
        return [tuple(item[field] for field in fields) for item in self.data]  # 回傳多欄位的 tuple 列表


    def __await__(self):
        async def dummy():
            return self
        return dummy().__await__()

@pytest.mark.asyncio
@pytest.mark.parametrize("table_data, expect", [
    ([], "1"),
    ([{"id": 1, "username":"user_1"}, {"id": 2}, {"id": 3}, {"id": 4}], "5"),
    ([{"id": 1}, {"id": 3}, {"id": 4}, {"id": 7}], "8"),
    ([{"id": 1}, {"id": 8}, {"id": 4}, {"id": 2}], "9"),
])
async def test_get_next_id(table_data, expect):
    """ 測試 get_next_id() 在不同情境下的行為 """

    # 用 MagicMock 模擬 table，讓 all() 返回一個 FakeQuerySet 物件
    table_mock = MagicMock()
    table_mock.all.return_value = FakeQuerySet(table_data)

    # 呼叫原本的 get_next_id 函式（保留生產程式碼中的鏈式 await）
    next_id = await get_next_id(table_mock)

    # 驗證結果
    assert next_id == expect