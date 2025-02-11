"use client";
import { useState, useEffect } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Plus, Trash2, Users } from "lucide-react";
import { ListPermissionsBox } from "../../../../services/ListPermissionsManager/ListPermissionsBox";

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
    console.log(id);
  }, []);

  const handleShow = () => {
    setErrorMessage("")
    setSuccessMessage("")
    ListPermissionsBox(
      "/get_viewer_permission/",
      {
        f_list_id: listid,
      },
      true
    )
      .then((response) => {
        if (response.data.length > 0) {
          const formattedMembers = response.data.map((item, index) => ({
            id: index, // 假設 id 從 2 開始，避免與 "owner" 重複
            name: item.f_viewer_email,
            role: "member",
            viewer_id: item.f_viewer_id,
          }));

          console.log(formattedMembers);
          console.log("create_viewer success");
          setShowShareModal(true);

          // 更新 members 狀態
          setMembers((prevMembers) => {
            // 保留原本的 "owner"，然後加上新的 members
            return [...formattedMembers];
          });
        } else {
          setMembers([]); // 只保留 owner
          setErrorMessage(response.msg);
        }
      })
      .catch((error) => {
        setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
        console.log("create_viewer failed:", error.message);
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
          setMembers([
            ...members,
            {
              id: Date.now(),
              name: shareEmail.split("@")[0],
              role: "member",
            },
          ]);
          setShareEmail("");
          setSuccessMessage("新增成功")
        })
        .catch((error) => {
          setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
          console.log("create_viewer failed:", error.message);
        });
    }
  };
  const handleRemoveMember = (id) => {
    /* const memberToRemove = members.find((member) => member.id === id);

    if (!memberToRemove) {
      console.error("Member not found");
      return;
    }

    const { viewer_id } = memberToRemove; // 取得 viewer_id */
    console.log(id.toString())
    ListPermissionsBox(
      "/delete_viewer_permission/",
      {
        f_viewer_id: id.toString(),
        f_list_id: listid,
      },
      true
    )
      .then((response) => {
        console.log("delete_viewer success");
        setSuccessMessage("刪除成功")
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
                  {member.role === "member" && (
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
              {/* 錯誤訊息顯示 */}
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              {/* 成功訊息顯示 */}
              {successMessage && (
                <p className="text-green-500">{successMessage}</p>
              )}
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
