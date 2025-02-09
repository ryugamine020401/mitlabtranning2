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
      verificationCode: "",
    })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isVerified, setIsVerified] = useState(false) // 初始為 false，通過驗證後變為 true

    const handleChange = (e) => {
      const { name, value } = e.target;
      
      //讓驗證碼不能輸超過6碼
      if (name === "verificationCode" && value.length > 6) {
        return
      }
      
      setFormData((prev) => {
        const updatedFormData = {
          ...prev,
          [name]: value,
        };
    
        return updatedFormData;
      });
    };
    
    const validateField = () => {
      const newErrors = {};
      if (!formData.username.trim()) {
        newErrors.username = "username為必填";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email為必填";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email格式不正確";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const validateField2 = () => {
        const newErrors = {};
        if (!formData.verificationCode) {
          newErrors.verificationCode = "請輸入驗證碼"
        } else if (formData.verificationCode.length < 6) {
          newErrors.verificationCode = "驗證碼必須為6碼"
        }
        if (!formData.password) {
        newErrors.password = "password為必填"
        } 
        if (!formData.confirmPassword) {
        newErrors.confirmPassword = "請確認密碼"
        } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "密碼不一致"
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
      //const isValid = validateField(formData);
      if (validateField()){
        setIsVerified(true) // 驗證成功後，解鎖按鈕
      }
       
    }

    const handleResetPassword = (e) =>{
      if (!isVerified) return // 確保只有通過驗證後才能執行
      if (validateField2()) {
        console.log("Reset Password Process Started...")
        // 執行重設密碼邏輯
      }
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
          <Button type="button" className="w-full" onClick={handleVerify}>
            Verify
          </Button>
          <Input
              name="verificationCode"
              label="VerificationCode *"
              placeholder="請輸入6位驗證碼"
              value={formData.verificationCode}
              onChange={handleChange}
              error={errors.verificationCode}
            />
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