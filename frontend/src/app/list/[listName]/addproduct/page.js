"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter(); // 用於頁面跳轉
  const [listId, setListId] = useState(""); // 儲存動態路由參數

  const [productName, setProductName] = useState("");
  const [productBarcode, setProductBarcode] = useState("");
  const [productNumber, setProductNumber] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");

  // 從 URL 獲取 listId
  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const id = pathParts[2]; // 假設路徑為 /list/LIST2/addproduct，第3部分為 LIST2
    setListId(id);
  }, []);

  // 處理檔案變更
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  // 表單送出
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) {
      setMessage("未登入，請先登入！");
      return;
    }

    try {
      // 將圖片檔案轉為 Base64 字串
      let base64Image = "";
      if (imageFile) {
        const reader = new FileReader();
        base64Image = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const dataUrl = reader.result;
            const base64String = dataUrl.split(",")[1]; // 只取出 Base64 的內容
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      // 組合要傳給後端的 JSON payload
      const payload = {
        list_name: listId,
        product_name: productName,
        product_barcode: productBarcode,
        product_number: productNumber,
        expiry_date: expiryDate,
        description,
        product_image: base64Image,
      };

      // 發送 POST 請求
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/create_product/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // 根據回應做不同處理
      if (response.ok) {
        setMessage("商品新增成功！");
        // 新增完成後跳轉回清單頁面
        router.push(`/list/${listId}`);
      } else {
        if (response.status === 413) {
          setMessage("上傳檔案過大，請壓縮後再試！");
        } else {
          // 嘗試解析後端返回的錯誤訊息
          try {
            const errorData = await response.json();
            setMessage(errorData.detail || "新增商品失敗！");
          } catch {
            setMessage(`Error Code: ${response.status}`);
          }
        }
      }
    } catch (error) {
      setMessage("發生錯誤，請稍後再試！");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold mb-4">新增商品到 {listId}</h1>
        {message && (
          <p className="text-red-400">
            {typeof message === "string" ? message : JSON.stringify(message)}
          </p>
        )}
        <div className="mb-4">
          <label className="block mb-2">商品名稱</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">商品條碼</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={productBarcode}
            onChange={(e) => setProductBarcode(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">數量</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={productNumber}
            onChange={(e) => setProductNumber(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">有效日期</label>
          <input
            type="date"
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">描述</label>
          <textarea
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block mb-2">上傳圖片 (將轉為 Base64)</label>
          <input
            type="file"
            accept="image/*"
            className="w-full p-2 rounded bg-gray-700 text-white"
            onChange={handleFileChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          新增商品
        </button>
      </form>
    </div>
  );
}
