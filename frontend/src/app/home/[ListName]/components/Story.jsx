"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { BotBox } from "../../../../../services/BotManager/BotBox";

export function Story({ product, onClose }) {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [successMessage, setSuccessMessage] = useState(""); // 儲存成功訊息
  const [errorMessage, setErrorMessage] = useState(""); // 儲存錯誤訊息
  const hasFetched = useRef(false); // 記錄 API 是否已被調用

  useEffect(() => {
    if (hasFetched.current) return; // 若已調用過 API，則直接返回
    hasFetched.current = true; // 標記 API 已調用

    setErrorMessage("");
    setSuccessMessage("");

    BotBox(
      "/get_story/",
      {
        product_name: product.product_name,
        expiry_date: product.expire_date,
      },
      true
    )
      .then((response) => {
        if (response.data) {
          setData(response.data);
        } else {
          setData(null);
          setErrorMessage(response.msg);
        }
      })
      .catch((error) => {
        setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
      });
  }, []);

  if (!data) {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-white border-2 border-blue-300 p-4 flex flex-col justify-center items-center">
        <button
          className="absolute top-4 right-4 text-gray-700"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <p className="text-lg text-gray-600">{errorMessage || "載入中..."}</p>
      </div>
    );
  }

  const handleNext = () => {
    if (page < data.story.length - 1) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-white border-2 border-blue-300 p-4 flex flex-col justify-center items-center">
      {/* 關閉按鈕 */}
      <button
        className="absolute top-4 right-4 text-gray-700"
        onClick={onClose}
      >
        <X size={24} />
      </button>

      {/* 左箭頭 (上一頁) */}
      <button
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
          page === 0 ? "opacity-50 cursor-not-allowed" : "hover:text-gray-700"
        }`}
        onClick={handlePrev}
        disabled={page === 0}
      >
        <ChevronLeft size={32} />
      </button>

      {/* 主要內容區域 */}
      <div className="text-center space-y-4 max-w-lg">
        <h2 className="text-2xl font-bold">{data.title}</h2>
        <p className="text-lg text-gray-600">{data.story[page]}</p>
      </div>

      {/* 右箭頭 (下一頁) */}
      <button
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
          page === data.length - 1
            ? "opacity-50 cursor-not-allowed"
            : "hover:text-gray-700"
        }`}
        onClick={handleNext}
        disabled={page === data.length - 1}
      >
        <ChevronRight size={32} />
      </button>

      {/* 頁數指示器 */}
      <div className="absolute bottom-4 flex space-x-2">
        {data.story.map((_, index) => (
          <div
            key={index}
            className={`h-3 w-3 rounded-full ${
              page === index ? "bg-gray-800" : "bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* 顯示總頁數與當前頁數 */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-700">
        <span>
          Page {page + 1} of {data.story.length}
        </span>
      </div>
    </div>
  );
}
