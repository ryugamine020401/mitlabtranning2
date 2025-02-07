"use client"

import { useState } from "react"
import { Input } from "./components/Input"
import { Button } from "./components/Button"
import { useDispatch, useSelector } from "react-redux"
import { setView, setAuth } from "../../store/authSlice"
import { Eye, EyeOff } from "lucide-react"

export function ForgotPasswordView() {
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isVerified, setIsVerified] = useState(false) // 初始為 false，通過驗證後變為 true

    const handleChange = (e) => {
      const { name, value } = e.target;
      
      setFormData((prev) => {
        const updatedFormData = {
          ...prev,
          [name]: value,
        };
    
        validateField(updatedFormData); // 傳入最新數據進行驗證
    
        return updatedFormData;
      });
    };
    
    const validateField = (updatedFormData) => {
      const newErrors = {};
      if (!updatedFormData.username.trim()) {
        newErrors.username = "username為必填";
      }
      if (!updatedFormData.email.trim()) {
        newErrors.email = "Email為必填";
      } else if (!/\S+@\S+\.\S+/.test(updatedFormData.email)) {
        newErrors.email = "Email格式不正確";
      }
    
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = (e) => {
      e.preventDefault()
      // 處理驗證密碼邏輯
      dispatch(setView("login"))
    }
    
    // 假設驗證成功
    const handleVerify = () => {
      // 處理驗證邏輯
      const isValid = validateField(formData);
      //setIsVerified(true) // 驗證成功後，解鎖按鈕
    }

    const handleResetPassword = (e) =>{
      if (!isVerified) return // 確保只有通過驗證後才能執行
      console.log("Reset Password Process Started...")
      // 執行重設密碼邏輯
    }
  
    return (
      <div className="w-full max-w-md space-y-6 bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <button onClick={() => dispatch(setView("login"))} className="text-gray-500 hover:text-gray-700">
            &larr;
          </button>
          <h1 className="text-2xl font-bold text-center flex-1">忘記密碼</h1>
        </div>
        <form className="space-y-4">
          <Input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Button type="button" className="w-full" disabled={Object.keys(errors).length > 0} onClick={handleVerify}>
            Verify
          </Button>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              label="Reset Password *"
              placeholder="Reset password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-[38px] text-gray-500 hover:text-gray-700"
              >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="relative">
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm password *"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-[38px] text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <Button type="button" className="w-full" disabled={!isVerified} onClick={handleResetPassword}>
            Reset Password
          </Button>
        </form>
      </div>
    )
  }