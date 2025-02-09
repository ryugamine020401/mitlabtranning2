"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { FileUpload } from "../FileUpload";
import Link from "next/link";
import { setHomeView } from "../../../../store/homeSlice";

export function SetProfileView() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    city: "",
    address: "",
    phone: "",
    birthDate: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleFileSelect = (file) => {
    console.log("Selected file:", file);
    // Handle file upload
  };

  return (
    <div className="flex-1 ml-60 min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6 bg-white p-8 rounded-lg shadow space-y-8">
        <h1 className="text-2xl font-bold text-center flex-1">Set Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            label="Username"
            name="username"
            placeholder="username"
            value={formData.username}
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
            placeholder="(YYYY/MM/DD)"
            value={formData.birthDate}
            onChange={handleChange}
          />
          <FileUpload label="Profile picture" onFileSelect={handleFileSelect} />
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
        </form>
      </div>
    </div>
  );
}
