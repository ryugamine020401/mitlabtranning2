# 使用 Node.js 基底映像
FROM node:18

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製所有項目檔案
COPY . .

# 暴露開發伺服器的預設端口
EXPOSE 3000

# 啟動 Next.js 開發模式
CMD ["npx", "next", "dev"]
