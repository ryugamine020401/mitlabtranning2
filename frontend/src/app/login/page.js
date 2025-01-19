"use client";

import { useState } from "react";

export default function Login() {
  const [formData, setFormData] = useState({
    username_or_email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 確保 username_or_email 填寫
    if (!formData.username_or_email) {
      setMessage("請填寫帳號或電子郵件！");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // 儲存 token 到 localStorage
        localStorage.setItem("access_token", data.access_token);
        setMessage("登入成功！");
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || "登入失敗！");
      }
    } catch (error) {
      setMessage("發生錯誤，請稍後再試！");
      console.log(error)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">登入帳號</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username_or_email"
              className="block text-sm font-medium text-gray-300"
            >
              帳號或電子郵件
            </label>
            <input
              type="text"
              id="username_or_email"
              name="username_or_email"
              value={formData.username_or_email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              密碼
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            登入
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-red-400">{message}</p>
        )}
      </div>
    </div>
  );
}
