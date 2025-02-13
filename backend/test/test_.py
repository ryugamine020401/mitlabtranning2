
import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

import pytest
from test.math import add
from actors.UsersManager import get_next_id
from unittest.mock import AsyncMock


@pytest.mark.parametrize("table, expect", [
    ([], "1"),
    ([1, 2, 3, 4], "5"),
    ([1, 3, 4, 7], "8"),
    ([1, 8, 4, 2], "9"),
])
async def test_get_next_id(table, expect):
    """ 測試 `get_next_id()` 在不同情境下的行為 """
    
    table_mock = AsyncMock()


    query_set_mock = AsyncMock()
    table_mock.all.return_value = query_set_mock

    query_set_mock.values_list.return_value = table

    next_id = await get_next_id(table_mock)

   
    assert next_id == expect
