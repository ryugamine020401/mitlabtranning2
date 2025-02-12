"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { ListsView } from "./ListsView";
import { ProfileView } from "./Profiles/ProfileView";
import { SetProfileView } from "./Profiles/SetProfileView";
import { ResetPasswordView } from "./Profiles/ResetPasswordView";
import { setView } from "../../../store/authSlice";
import { setHomeView } from "../../../store/homeSlice";
import { ProfilesBox } from "../../../services/ProfilesManager/ProfilesBox";

export default function HomeContainer() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentView = useSelector((state) => state.home.currentHomeView);
  const [hydrated, setHydrated] = useState(false); // 用來避免畫面閃爍
  const [Data, setData] = useState({ name: "", profile_url: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedView = localStorage.getItem("homeView") || "lists";
      ProfilesBox("/get_profile/", {}, true)
        .then((response) => {
          if (response.data.length > 0) {
            setData(response.data[0]);
            dispatch(setHomeView(storedView));
            setHydrated(true); // Hydration 完成
          } else {
            setErrorMessage(response.msg);
          }
        })
        .catch((error) => {
          setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
        });
    }
  }, [dispatch]);

  if (!hydrated) return null; // **避免 Hydration 錯誤，等到 useEffect 執行後才渲染**

  const handleLogout = () => {
    localStorage.removeItem("token"); // 清除 token
    localStorage.removeItem("authView"); // 清除存儲的 authView
    dispatch(setView("login")); // 設定回 initialState
    router.push("/"); // 跳轉回首頁
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-60 bg-white shadow-lg fixed h-full">
        <div className="p-6 flex flex-col h-full">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gray-200 mb-4">
              <img
                src={Data.profile_url ? Data.profile_url : "/user.svg"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="text-lg font-medium">{Data.name}</span>
          </div>
          <nav className="flex-1">
            <div
              className="flex items-center gap-2 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => dispatch(setHomeView("profile"))}
            >
              <User className="w-5 h-5" />
              Profile
            </div>
          </nav>
          <div
            className="flex items-center gap-2 p-3 text-gray-700 hover:bg-gray-100 rounded-lg mt-auto"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </div>
        </div>
      </div>

      {/* ListsContainer */}
      {currentView === "lists" && <ListsView />}
      {currentView === "profile" && <ProfileView />}
      {currentView === "set-profile" && <SetProfileView />}
      {currentView === "resetpassword" && <ResetPasswordView />}
    </div>
  );
}
