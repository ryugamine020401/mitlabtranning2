# 使用官方指定版本的 Python 基底映像檔
FROM python:3.10.12-slim

# 設定工作目錄
WORKDIR /app

# 複製 requirements.txt 到映像檔
COPY . /app/

# 安裝依賴
RUN pip install --no-cache-dir -r requirements.txt

# 預設暴露的埠號，可透過執行時環境變數覆蓋
EXPOSE 8000

# 預設執行命令（根據主機掛載的檔案運行）
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
