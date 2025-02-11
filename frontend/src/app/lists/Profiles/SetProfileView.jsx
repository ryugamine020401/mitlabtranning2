"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { FileUpload } from "../FileUpload";
import Link from "next/link";
import { setHomeView } from "../../../../store/homeSlice";
import { ProfilesBox } from "../../../../services/ProfilesManager/ProfilesBox";

export function SetProfileView() {
  const dispatch = useDispatch();
  const [successMessage, setSuccessMessage] = useState(""); // 儲存成功訊息
  const [errorMessage, setErrorMessage] = useState(""); // 儲存錯誤訊息
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    birthDate: "",
    profile_picture_url: "",
    bio: ""
  });
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

  useEffect(() => {
    ProfilesBox("/get_profile/", {}, true)
      .then((response) => {
        if (response.data.length > 0) {
          const fullAddress = response.data[0].address || "";
          const cityMatch = fullAddress.match(
            /^(台北市|新北市|桃園市|台中市|台南市|高雄市|基隆市|新竹市|嘉義市|彰化縣|南投縣|雲林縣|嘉義縣|屏東縣|宜蘭縣|花蓮縣|台東縣|澎湖縣|金門縣|連江縣)/
          );
          const extractedCity = cityMatch ? cityMatch[0] : "";
          setFormData({
            name: response.data[0].name,
            city: extractedCity,
            address: fullAddress.replace(extractedCity, "").trim(),
            phone: response.data[0].phone_number,
            birthDate: response.data[0].date_of_birth,
            profile_picture_url: response.data[0].profile_picture_url,
            bio:response.data[0].bio || "無"
          });
        }
      })
      .catch((error) => {
        setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    console.log(formData);
    e.preventDefault();
    //if (validateForm()) {
    ProfilesBox(
      "/update_profile/",
      {
        name: formData.name,
        phone_number: formData.phone,
        date_of_birth: formData.birthDate,
        address: `${formData.city}${formData.address}`,
        profile_picture_url: formData.profile_picture_url,
        bio: formData.bio,
      },
      true
    )
      .then((result) => {
        console.log("Reset profile successful!");
        setSuccessMessage("編輯成功");
      })
      .catch((error) => {
        setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
        console.log("Verify failed:", error.message);
      });
    //}
  };

  const validateForm = () => {
    const newErrors = {};
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email格式不正確";
    }

    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="flex-1 ml-60 min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6 bg-white p-8 rounded-lg shadow space-y-8">
        <h1 className="text-2xl font-bold text-center flex-1">Set Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className={`w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2`}
          >
            <option value="">請選擇縣市</option>
            {taiwanCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <Input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="flex-1"
          />

          <Input
            label="Phone number"
            name="phone"
            type="tel"
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="Date of birth"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
          />
          <Input
            label="個人說明"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />
          <FileUpload
            label="Profile Picture"
            onFileSelect={(base64) => {
              setFormData((prev) => ({
                ...prev,
                profile_picture_url: base64, // 確保變數名稱一致
              }));
            }}
          />
          <div className="flex gap-4 justify-center pt-4">
            <Button type="submit">Update</Button>
            <Button
              type="button"
              variant="secondary"
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
