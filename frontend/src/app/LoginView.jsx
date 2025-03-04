"use client";

import { useState } from "react";
import { Input } from "./components/Input";
import { Button } from "./components/Button";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { setView } from "../../store/authSlice";
import { UserBox } from "../../services/UserManager/UserBox";

async function hashPassword(password) {
  // console.log("Is running in browser:", typeof window !== "undefined");
  // console.log("crypto:", crypto);
  // console.log("crypto.subtle:", crypto.subtle);
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export function LoginView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // 儲存錯誤訊息

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFeild = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "username為必填";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email為必填";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email格式不正確";
    }
    if (!formData.username.trim()) {
      newErrors.username = "username為必填";
    }
    if (!formData.password) {
      newErrors.password = "password為必填";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    //const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/UsersManager`;
    //console.log(API_URL)
    e.preventDefault();
    if (validateFeild()) {
      const hashedPassword = await hashPassword(formData.password);
      //console.log(hashedPassword)
      UserBox(
        "/login_user/",
        {
          username: formData.username,
          email: formData.email,
          password:hashedPassword,
        },
        false
      )
        .then((response) => {
          console.log("Login success");
          localStorage.setItem("token", response.data[0].token);
          router.push("/home");
        })
        .catch((error) => {
          setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
          console.log("Login failed:", error.message);
        });
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold text-center">
        Product Expiration Date List
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="username"
          label="Username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <button
              onClick={() => dispatch(setView("forgot-password"))}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        {/* 錯誤訊息顯示 */}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      </form>
      <div className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <button
          onClick={() => dispatch(setView("signup"))}
          className="text-blue-500 hover:text-blue-600"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
