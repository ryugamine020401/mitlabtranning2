"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setView } from "../../store/authSlice";
import { LoginView } from "./LoginView";
import { ForgotPasswordView } from "./ForgotPasswordView";
import { SignupView } from "./SignupView";

export default function AuthContainer() {
  const dispatch = useDispatch();
  const currentView = useSelector((state) => state.auth.currentView);
  const [hydrated, setHydrated] = useState(false); // 用來避免畫面閃爍

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedView = localStorage.getItem("authView") || "login";
      dispatch(setView(storedView));
      setHydrated(true); // Hydration 完成
    }
  }, [dispatch]);

  if (!hydrated) return null; // **避免 Hydration 錯誤，等到 useEffect 執行後才渲染**

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {currentView === "login" && <LoginView />}
      {currentView === "forgot-password" && <ForgotPasswordView />}
      {currentView === "signup" && <SignupView />}
    </div>
  );
}
