# 使用官方指定版本的 Python 基底映像檔
FROM python:3.10.12-slim

# 設定工作目錄
WORKDIR /app

# 複製 requirements.txt 到 /app/
COPY requirements.txt .

# 安裝依賴
RUN pip install --no-cache-dir -r requirements.txt

# 暴露埠號
EXPOSE 8000

# 預設執行命令，運行主機掛載的程式碼
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
