import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/BotManager`;

export const BotBox = (endpoint, data, needAuth = false) => {
  // 取得 token（若需要）
  const token = needAuth ? localStorage.getItem("token") : null;
  console.log("data: ", data)
  
  return axios.post(
      `${API_URL}${endpoint}`, // 組合 API URL
      data,
      {
        headers: {
          ...(needAuth && token ? { Authorization: `Bearer ${token}` } : {}), // 加入 token
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      if (response.data.status === "fail") {
        throw new Error(response.data.msg);
      }
      return response.data; // 成功時回傳資料
    })
    .catch((error) => {
      console.error("API 請求錯誤:",error.response?.data?.msg || error.message);
      throw error;
    });
};

