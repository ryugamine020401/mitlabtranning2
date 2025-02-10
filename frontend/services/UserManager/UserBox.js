import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/UsersManager`;

export const UserBox = (endpoint, data, needAuth = false) => {
  // 取得 token（若需要）
  const token = needAuth ? localStorage.getItem("token") : null;

  return axios.post(
    `${API_URL}${endpoint}`, // 組合 API URL
    data,
    {
      headers: {
        ...(needAuth && token ? { Authorization: `Bearer ${token}` } : {}), // 若需要，則加入 Authorization header
        "Content-Type": "application/json",
      }
    }
  )
  
  .then((response) => {
    const firstData = response.data.data?.[0]; // 取得 data 陣列內的第一個物件
    if (response.data.status === "fail") {
      //console.log(firstData.msg)
      throw new Error(response.data.msg);
    }
    //console.log(firstData.msg)
    return response.data; // 成功時回傳資料
  })
  .catch((error) => {
    console.error("API 請求錯誤:", error.response?.data?.msg || error.message);
    throw error;
  });
};
