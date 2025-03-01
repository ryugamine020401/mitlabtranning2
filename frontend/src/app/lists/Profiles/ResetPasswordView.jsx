"use client";

import { useState } from "react";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import { setHomeView } from "../../../../store/homeSlice";
import { UserBox } from "../../../../services/UserManager/UserBox";

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export function ResetPasswordView() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    oldpassword: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // 初始為 false，通過驗證後變為 true
  const [successMessage, setSuccessMessage] = useState(""); // 儲存成功訊息
  const [errorMessage, setErrorMessage] = useState(""); // 儲存錯誤訊息

  const handleChange = (e) => {
    const { name, value } = e.target;

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
    if (!formData.oldpassword) {
      newErrors.oldpassword = "Old password為必填";
    }
    if (!formData.password) {
      newErrors.password = "password為必填";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "請確認密碼";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "密碼不一致";
    }
    if (formData.oldpassword && formData.password && formData.oldpassword === formData.password) {
      newErrors.password = "舊密碼不可與新密碼相同";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateField()) {
      const oldhashedPassword = await hashPassword(formData.oldpassword);
      const hashedPassword = await hashPassword(formData.confirmPassword);
      UserBox(
        "/updatePW_user/",
        {
          username: formData.username,
          email: formData.email,
          old_password: oldhashedPassword,
          new_password: hashedPassword,
        },
        true,
      )
        .then((result) => {
          console.log("Reset successful!");
          setSuccessMessage("重設成功！");
        })
        .catch((error) => {
          setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
          console.log("register failed:", error.message);
        });
    }
  };


  return (
    <div className="flex-1 ml-60 min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6 bg-white p-8 rounded-lg shadow space-y-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-center flex-1">
            Reset Password
          </h1>
        </div>
        <form className="space-y-4">
          <Input
            name="username"
            placeholder="Username"
            label="Username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <div className="relative">
            <Input
              name="oldpassword"
              type={showPassword ? "text" : "oldpassword"}
              label="Old Password *"
              placeholder="Old password"
              value={formData.oldpassword}
              onChange={handleChange}
              error={errors.oldpassword}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-[38px] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
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
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
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
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="flex gap-4 justify-center pt-4">
            <Button onClick={handleSubmit}>Reset Password</Button>
            <Button
              variant="secondary"
              className="px-8"
              onClick={() => dispatch(setHomeView("profile"))}
            >
              Cancel
            </Button>
          </div>
          {/* 錯誤訊息顯示 */}
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          {/* 成功訊息顯示 */}
          {successMessage && <p className="text-green-500">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
}
