"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ListPage() {
  // 透過 App Router 提供的 hooks
  const router = useRouter();
  const params = useParams(); // 取得動態參數物件

  // 參數名稱要跟資料夾 [list_name] 保持一致
  const listName = params.listName; // 如果資料夾是 [list_name]，就要拿 params.list_name

  const [productUrls, setProductUrls] = useState([]);

  useEffect(() => {
    // 測試一下看看是否真的取得參數
    console.log("params:", params);
    console.log("listName:", listName);

    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No token found, please login first.");
      return;
    }

    // 發送請求
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${apiUrl}/get_product/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ list_name: listName }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch product data");
        }
        return res.json();
      })
      .then((data) => {
        setProductUrls(data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, [listName]); // 只要 listName 改變就重新抓資料

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">清單 {listName}</h1>
      <p className="mb-6">歡迎來到 {listName} 清單頁面！</p>

      <div className="my-4">
        <h2 className="text-xl mb-2">商品圖片清單：</h2>
        {productUrls.length === 0 ? (
          <p>尚無商品或無法取得資料</p>
        ) : (
          productUrls.map((url, index) => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const fullUrl = `${apiUrl}/${url}`;
            return (
              <div key={index} className="mb-2">
                <p>{fullUrl}</p>
                <img
                  src={fullUrl}
                  alt={`Product ${index}`}
                  style={{ maxWidth: "200px" }}
                />
              </div>
            );
          })
        )}
      </div>

      <button
        className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => router.push(`/list/${listName}/addproduct`)}
      >
        跳轉到新增商品頁面
      </button>
    </div>
  );
}
