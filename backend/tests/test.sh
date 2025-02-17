#!/bin/bash

# === 執行 ./tests/test.sh 來測試 ===

# 設置 Python 的搜尋路徑（這樣就能正確引用 /app 資料夾中的模組）
export PYTHONPATH=/app:$PYTHONPATH

# 執行 Python 測試腳本
python ./tests/test_login.py
python ./tests/test_update_profile.py