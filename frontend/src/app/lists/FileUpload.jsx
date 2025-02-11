"use client";

import { useState, useEffect } from "react";

export function FileUpload({
  label,
  onFileSelect,
  className = "",
  accept = "image/*",
  error,
  initialImage, // 新增此 prop，允許外部傳入預設圖片 URL
}) {
  const [preview, setPreview] = useState(initialImage || ""); // 預設顯示傳入的圖片 URL
  const [uploading, setUploading] = useState(false);

  // 當 `initialImage` 更新時，確保 `preview` 也同步更新
  useEffect(() => {
    setPreview(initialImage);
  }, [initialImage]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result;
        setPreview(base64String); // 更新預覽
        onFileSelect?.(base64String); // 回傳 Base64 給父元件
      };

      reader.readAsDataURL(file); // 讀取檔案並轉為 Base64
    } catch (error) {
      console.error("Error handling file:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="file"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          onChange={handleFileUpload}
          accept={accept}
          disabled={uploading}
        />
        {preview && (
          <div className="mt-2">
            <img
              src={preview}
              alt="Preview"
              className="w-20 h-20 rounded-full object-cover mx-auto"
            />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
