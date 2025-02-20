"use client";

import { useState } from "react";
import { Input } from "./components/Input";
import { Button } from "./components/Button";
import { useDispatch } from "react-redux";
import { setView } from "../../store/authSlice";
import { Eye, EyeOff } from "lucide-react";
import { UserBox } from "../../services/UserManager/UserBox";


async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}


export function SignupView() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    birthDate: "",
    city: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // 儲存成功訊息
  const [errorMessage, setErrorMessage] = useState(""); // 儲存錯誤訊息

  const taiwanCities = [
    "基隆市",
    "臺北市",
    "新北市",
    "桃園市",
    "新竹市",
    "新竹縣",
    "苗栗縣",
    "臺中市",
    "彰化縣",
    "南投縣",
    "雲林縣",
    "嘉義市",
    "嘉義縣",
    "臺南市",
    "高雄市",
    "屏東縣",
    "宜蘭縣",
    "花蓮縣",
    "臺東縣",
    "澎湖縣",
    "金門縣",
    "連江縣",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const hashedPassword = await hashPassword(formData.password);
      UserBox(
        "/create_user/",
        {
          username: formData.username,
          email: formData.email,
          password: hashedPassword,
          name: formData.name,
          phone_number: formData.phone,
          date_of_birth: formData.birthDate,
          address: `${formData.city}${formData.address}`,
        },
        false
      )
        .then((result) => {
          console.log("register successful!");
          //console.log(result.data.message)
          setSuccessMessage("註冊成功！請前往登入頁面");
        })
        .catch((error) => {
          setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
          console.log("register failed:", error.message);
        });
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorMessage("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    setErrorMessage("");
    setSuccessMessage("");
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "name為必填";
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
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "請確認密碼";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "密碼不一致";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "電話為必填";
    }
    if (!formData.birthDate) {
      newErrors.birthDate = "生日為必填";
    }
    if (!formData.city) {
      newErrors.city = "請選擇縣市";
    }
    if (!formData.address.trim()) {
      newErrors.address = "地址為必填";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="w-full max-w-md space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <button
          onClick={() => dispatch(setView("login"))}
          className="text-gray-500 hover:text-gray-700"
        >
          &larr;
        </button>
        <h1 className="text-2xl font-bold text-center flex-1">
          Create account
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          label="Name *"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Input
          name="email"
          type="email"
          label="Email *"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          name="username"
          label="Create username *"
          placeholder="Create username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password *"
            placeholder="Create a password"
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
        <Input
          name="phone"
          label="Phone number *"
          placeholder="Phone number"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        <Input
          name="birthDate"
          label="Date of birth *"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          error={errors.birthDate}
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            地址 *
          </label>
          <div className="flex gap-4">
            <select
              name="city"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className={`w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${
                      errors.city
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
            >
              <option value="">請選擇縣市</option>
              {taiwanCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}
            <Input
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="flex-1"
              error={errors.address}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}
          </div>
        </div>
        <Button type="submit" className="w-full">
          Register
        </Button>
        {/* 錯誤訊息顯示 */}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        {/* 成功訊息顯示 */}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
      </form>
    </div>
  );
}
