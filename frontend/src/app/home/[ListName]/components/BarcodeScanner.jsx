"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export function BarcodeScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const [barcode, setBarcode] = useState(null);
  const codeReaderRef = useRef(null);
  const controlsRef = useRef(null);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      if (!videoRef.current) return;
      console.log("useEffect 執行一次");
      effectRan.current = true; // 設定為已執行

      const reader = new BrowserMultiFormatReader();
      codeReaderRef.current = reader;

      reader
        .decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err, controls) => {
            controlsRef.current = controls; // 儲存 controls，方便停止掃描

            if (result) {
              const scannedCode = result.getText();
              console.log(`掃描成功: ${scannedCode}`);
              setBarcode(scannedCode);
              onScan(scannedCode);
              stopScanning();
            }
          }
        )

        .catch((err) => console.error("相機初始化失敗:", err));
    }

    return () => {
      stopScanning(); // 組件卸載時關閉相機
    };
  }, []); // 監聽 videoRef.current

  const stopScanning = () => {
    console.log("videoRef.current:", videoRef.current);

    console.log("停止掃描");
    if (controlsRef.current) {
      controlsRef.current.stop();
      console.log("controls 停止成功");
      onClose();
    } else {
      console.warn("controlsRef.current 為 null，無法停止掃描");
    }

    // 確保所有相機流已關閉
    if (videoRef.current && videoRef.current.srcObject) {
      let stream = videoRef.current.srcObject;
      let tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      console.log("手動關閉相機畫面");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 bg-white p-4 border rounded-md shadow-lg">
      {barcode ? (
        <h2 className="text-lg font-bold">掃描結果: {barcode}</h2>
      ) : (
        <video ref={videoRef} className="border border-gray-400 w-64 h-32" />
      )}

      <button
        onClick={stopScanning}
        className="bg-red-500 text-white px-4 py-2 rounded-md"
      >
        停止掃描
      </button>
    </div>
  );
}
