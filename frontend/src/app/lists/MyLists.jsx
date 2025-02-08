"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Plus, Pencil, Trash } from "lucide-react";
import { ListBox } from "../../../services/ListManager/ListBox";

export default function MyList() {
  const [myLists, setMyLists] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({ name: "", description: "" });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newListData, setNewListData] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(""); // 儲存錯誤訊息
  const [refreshKey, setRefreshKey] = useState(0); // 用來觸發 `useEffect`

  useEffect(() => {
    ListBox("/get_list", {}, true)
      .then((response) => {
        if (response.data.length > 0) {
          const formattedLists = response.data.map((item) => ({
            id: item.list_uid, // 設定 id
            name: item.list_name, // 設定 name
            description: item.description || "", // 設定 description（如果為 null 則給空字串）
          }));
          setMyLists(formattedLists);
        } else {
          setMyLists([]);
          setErrorMessage(response.msg);
        }
      })
      .catch((error) => {
        setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
      });
  }, [refreshKey]);

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.name.trim()) {
      newErrors.name = "清單名稱不能為空";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (list) => {
    setEditingId(list.id);
    setEditingData({ name: list.name, description: list.description });
  };

  const handleSave = () => {
    if (validateForm(editingData)) {
      setMyLists(
        myLists.map((list) =>
          list.id === editingId
            ? {
                ...list,
                name: editingData.name,
                description: editingData.description,
              }
            : list
        )
      );
      setEditingId(null);
      setEditingData({ name: "", description: "" });
    }
  };

  const handleDelete = (id) => {
    setMyLists(myLists.filter((list) => list.id !== id));
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setNewListData({ name: "", description: "" });
    setErrors({});
  };

  const handleSaveNew = () => {
    if (validateForm(newListData)) {
      ListBox(
        "/create_list",
        {
          list_name: newListData.name,
          description: newListData.description,
        },
        true,
      )
        .then((result) => {
          console.log("Create_list successful!");
          setRefreshKey(prevKey => prevKey + 1);
          setIsAddingNew(false);
        })
        .catch((error) => {
          setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
          console.log("Create_list failed:", error.message);
        });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Lists</h1>
      {/* 錯誤訊息顯示 */}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="space-y-4">
        {myLists.map((list) => (
          <div
            key={list.id}
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            {editingId === list.id ? (
              <div className="flex-1 flex gap-2">
                <Input
                  value={editingData.name}
                  onChange={(e) =>
                    setEditingData({ ...editingData, name: e.target.value })
                  }
                  placeholder="清單名稱"
                  error={errors.name}
                  className="flex-1"
                />
                <Input
                  value={editingData.description}
                  onChange={(e) =>
                    setEditingData({
                      ...editingData,
                      description: e.target.value,
                    })
                  }
                  placeholder="描述（可留空）"
                  className="flex-1"
                />
                <Button onClick={handleSave}>Save</Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingId(null);
                    setEditingData({ name: "", description: "" });
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <span className="font-bold">{list.name}</span>
                  {list.description && (
                    <span className="text-gray-500 text-sm ml-2">
                      {list.description}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handleEdit(list)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={() => handleDelete(list.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add New List Section */}
      {isAddingNew ? (
        <div className="flex items-center gap-4 mt-4 bg-white p-4 rounded-lg shadow">
          <Input
            value={newListData.name}
            onChange={(e) =>
              setNewListData({ ...newListData, name: e.target.value })
            }
            placeholder="輸入新清單名稱"
            error={errors.name}
            className="flex-1"
          />
          <Input
            value={newListData.description}
            onChange={(e) =>
              setNewListData({ ...newListData, description: e.target.value })
            }
            placeholder="描述（可留空）"
            className="flex-1"
          />
          <Button onClick={handleSaveNew}>Save</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setIsAddingNew(null);
              setNewListData({ name: "", description: "" });
              setErrors({});
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleAddNew}
          className="w-full mt-4 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增清單
        </Button>
      )}
    </div>
  );
}
