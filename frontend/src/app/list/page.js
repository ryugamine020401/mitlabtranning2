"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 用於路由跳轉

export default function CreateListPage() {
  const [formData, setFormData] = useState({
    listName: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [userLists, setUserLists] = useState([]); // 儲存使用者的清單
  const router = useRouter(); // 路由對象

  // 處理表單輸入變更
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 從後端獲取清單
  const fetchUserLists = async () => {
    const token = localStorage.getItem("access_token"); // 從 localStorage 獲取 Token
    if (!token) {
      setMessage("未登入，請先登入！");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/get_lists/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // 將 Token 放入 Authorization 標頭
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserLists(data); // 設定使用者的清單
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || "無法獲取清單！");
      }
    } catch (error) {
      console.log(error)
      setMessage("發生錯誤，請稍後再試！");
    }
  };

  // 提交表單，創建清單
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token"); // 從 localStorage 獲取 Token
    if (!token) {
      setMessage("未登入，請先登入！");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/create_list/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 將 Token 放入 Authorization 標頭
        },
        body: JSON.stringify({
          list_name: formData.listName,
          description: formData.description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`清單創建成功！UID: ${data.list_uid}`);
        setFormData({ listName: "", description: "" }); // 清空表單
        fetchUserLists(); // 創建清單後重新獲取清單
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || "清單創建失敗！");
      }
    } catch (error) {
      console.log(error)
      setMessage("發生錯誤，請稍後再試！");
    }
  };

  // 初始化時獲取使用者的清單
  useEffect(() => {
    fetchUserLists();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">創建清單</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="listName" className="block text-sm font-medium text-gray-300">
              清單名稱
            </label>
            <input
              type="text"
              id="listName"
              name="listName"
              value={formData.listName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              maxLength={255}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              描述
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              maxLength={255}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            創建清單
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-red-400">{message}</p>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold text-white">我的清單</h2>
          <ul className="mt-4 space-y-2">
            {userLists.map((list, index) => (
              <li
                key={index}
                className="p-4 bg-gray-700 rounded shadow text-white cursor-pointer hover:bg-gray-600"
                onClick={() => router.push(`/list/${encodeURIComponent(list.list_name)}`)} // 動態跳轉
              >
                <p className="font-bold">{list.list_name}</p>
                <p className="text-sm">{list.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
