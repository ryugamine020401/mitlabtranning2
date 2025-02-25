"use client";
import { useState, useEffect } from "react";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Plus, Trash2, Users } from "lucide-react";
import { ListPermissionsBox } from "../../../../../services/ListPermissionsManager/ListPermissionsBox";

export function ShareButton() {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [members, setMembers] = useState([
    { id: 1, name: "", role: "", viewer_id: "" },
  ]);
  const [listid, setListid] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // 儲存成功訊息
  const [errorMessage, setErrorMessage] = useState(""); // 儲存錯誤訊息

  useEffect(() => {
    const currentPath = window.location.pathname; // 取得路由 path
    const pathSegments = currentPath.split("/"); // 分割 path
    const Name = pathSegments[pathSegments.length - 1] || ""; // 取得最後一個 path segment

    const urlParams = new URLSearchParams(window.location.search); // 解析 Query String
    const id = urlParams.get("id") || ""; // 獲取 id
    if (id) setListid(id);
    //console.log(id);
  }, []);

  const handleShow = () => {
    setErrorMessage("");
    setSuccessMessage("");

    ListPermissionsBox(
      "/get_viewer_permission/",
      {
        f_list_id: listid,
      },
      true
    )
      .then((response) => {
        const data = response.data;

        if (data.length > 0) {
          // 取得 owner_email (假設 API 回傳的 owner_email 一致)
          const ownerEmail = data[0].f_owner_email || "未提供";

          // 檢查是否存在 viewer (有 `f_viewer_email` 和 `f_viewer_id`)
          const formattedMembers = data
            .filter((item) => item.f_viewer_email && item.f_viewer_id) // 過濾掉沒有 viewer 的項目
            .map((item, index) => ({
              id: index + 2, // 避免與 owner (id: 1) 重複
              name: item.f_viewer_email,
              role: "Member",
              viewer_id: item.f_viewer_id,
            }));

          console.log("get_viewer success");

          // 更新 members 狀態，確保只保留 owner 或加上 viewers
          setMembers([
            { id: 1, name: ownerEmail, role: "Owner", viewer_id: "" }, // 保留 owner
            ...formattedMembers, // 只加入有 viewer 的項目
          ]);

          setShowShareModal(true);
        } else {
          // 沒有 viewers，只保留 owner
          setMembers([{ id: 1, name: "未提供", role: "Owner", viewer_id: "" }]);
          setShowShareModal(true);
          setErrorMessage(response.msg);
        }
      })
      .catch((error) => {
        setErrorMessage(error.message); // 顯示 API 回傳的錯誤訊息
        console.log("get_viewer failed:", error.message);
      });
  };

  const handleShare = () => {
    if (shareEmail) {
      ListPermissionsBox(
        "/create_viewer_permission/",
        {
          email: shareEmail,
          f_list_id: listid,
        },
        true
      )
        .then((response) => {
          console.log("create_viewer success");
          setSuccessMessage("新增成功");
          setTimeout(() => {
            setSuccessMessage("");
            handleShow(true);
          }, 1000);
          setShareEmail("");
        })
        .catch((error) => {
          setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
          console.log("create_viewer failed:", error.message);
        });
    }
  };
  const handleRemoveMember = (id) => {
    console.log(id);
    ListPermissionsBox(
      "/delete_viewer_permission/",
      {
        f_viewer_id: id,
        f_list_id: listid,
      },
      true
    )
      .then((response) => {
        console.log("delete_viewer success");
        setSuccessMessage("刪除成功");
        setTimeout(() => {
          setSuccessMessage("");
          handleShow(true);
        }, 1000);
        setMembers(members.filter((member) => member.id !== id));
      })
      .catch((error) => {
        setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
        console.log("delete_viewer failed:", error.message);
      });
  };

  return (
    <div>
      <Button onClick={() => handleShow()}>
        <Users className="w-4 h-4 mr-2" />
        Share List
      </Button>

      {/*ShareButton*/}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Share List</h2>
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.role}:</span>
                    <span>{member.name}</span>
                  </div>
                  {member.role === "Member" && (
                    <Button
                      variant="secondary"
                      onClick={() => handleRemoveMember(member.viewer_id)}
                      className="p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {/* 錯誤訊息顯示 */}
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              {/* 成功訊息顯示 */}
              {successMessage && (
                <p className="text-green-500">{successMessage}</p>
              )}
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email to share"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
                <Button onClick={handleShare}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowShareModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
