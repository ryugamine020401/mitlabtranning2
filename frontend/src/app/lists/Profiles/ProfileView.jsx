"use client";

import { useState,useEffect } from "react";
import { useDispatch } from "react-redux";
import { setHomeView } from "../../../../store/homeSlice";
import { Button } from "../../components/Button";
import { Home } from "lucide-react";
import { ProfilesBox } from "../../../../services/ProfilesManager/ProfilesBox";

export function ProfileView() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(""); // 儲存錯誤訊息

  useEffect(() => {
    ProfilesBox("/get_profile/", {}, true)
      .then((response) => {
        if (response.data.length > 0) {
          setFormData(
            {
              name: response.data[0].name,
              phone_number: response.data[0].phone_number,
              date_of_birth: response.data[0].date_of_birth,
              address: response.data[0].address,
              profile_picture_url: response.data[0].profile_picture_url,
              bio:response.data[0].bio || "無"
            }
          )
        } else {
          setFormData([]);
          setErrorMessage(response.msg);
        }
      })
      .catch((error) => {
        setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
      });
  }, []);

  return (
    <div className="flex-1 ml-60 min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => dispatch(setHomeView("lists"))}
          >
            <Home className="w-4 h-4" />
          </Button>
        </div>
        <div className="bg-white p-8 rounded-lg shadow space-y-8">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 overflow-hidden">
              <img
                src="/user.svg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">Name:</p>
              <p className="text-lg">{formData.name}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">Phone number:</p>
              <p className="text-lg">{formData.phone_number}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">Date of birth:</p>
              <p className="text-lg">{formData.date_of_birth}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">Address:</p>
              <p className="text-lg">{formData.address}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-gray-600">個人說明:</p>
              <p className="text-lg">{formData.bio}</p>
            </div>
          </div>
          <div className="flex gap-4 justify-center pt-4">
            <Button onClick={() => dispatch(setHomeView("set-profile"))}>
              編輯個人檔案
            </Button>
            <Button
              variant="secondary"
              className="px-8"
              onClick={() => dispatch(setHomeView("resetpassword"))}
            >
              重設密碼
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
