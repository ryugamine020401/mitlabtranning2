"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function BarcodeScanner() {
  const videoRef = useRef(null);
  const [barcode, setBarcode] = useState(null);
  const codeReaderRef = useRef(null);
  const videoStreamRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    codeReaderRef.current = reader;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, err, controls) => {
        controlsRef.current = controls; // 儲存 controls，方便停止掃描
        
        if (result) {
          
          const scannedCode = result.getText();
          console.log(`掃描成功: ${scannedCode}`);
          setBarcode(scannedCode);
          //onScan(scannedCode); // 傳遞掃描結果到輸入框
          stopScanning(); // 掃描成功後立即關閉鏡頭
        } else if (err) {
          //console.log("⚠️ 掃描失敗，請調整角度或光線");
        }
      })
      .then((stream) => {
        videoStreamRef.current = stream;
      })
      .catch((err) => console.error("相機初始化失敗:", err));

    return () => {
      stopScanning(); // 組件卸載時關閉相機
    };
  }, []);

  const stopScanning = () => {
    console.log("停止掃描");
    if (controlsRef.current) {
      controlsRef.current.stop(); // 正確停止掃描
      console.log("controls 停止成功");
    }

    /* if (videoRef.current && videoRef.current.srcObject) {
      let stream = videoRef.current.srcObject;
      let tracks = stream.getTracks();
      tracks.forEach((track) => track.stop()); // 關閉相機
      videoRef.current.srcObject = null; // 清除相機畫面
      console.log("關閉相機畫面");
    } */
    //onClose(); // 讓父組件關閉掃描框
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
