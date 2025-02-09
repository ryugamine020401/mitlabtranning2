import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const CreateUser = async (data) => {
  return axios.post(`${API_URL}/UsersManager/create_user`, data)
  .then((response) => {
    if (response.data.status === "fail") {
      //console.error("註冊失敗:", response.data.msg)
      throw new Error(response.data.msg)
    }
    
    //console.log("註冊成功!", response.data)
    return response.data; // 成功時回傳資料
  })
  .catch((error) => {
    console.error("API 請求錯誤:", error.response?.data?.msg || error.message);
    throw error; 
  });
  
};