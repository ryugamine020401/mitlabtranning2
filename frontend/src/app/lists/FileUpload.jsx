"use client";

import { useState } from "react";

export function FileUpload({
  label,
  onFileSelect,
  className = "",
  accept = "image/*",
  error,
}) {
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result;
        setPreview(base64String);
        onFileSelect?.(base64String); // 傳遞 Base64 給父元件
        
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
              src={preview || "/file.svg"}
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
