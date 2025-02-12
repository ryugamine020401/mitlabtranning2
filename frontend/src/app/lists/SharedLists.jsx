"use client";

import { useState, useEffect } from "react";
import { ListPermissionsBox } from "../../../services/ListPermissionsManager/ListPermissionsBox";
import Link from "next/link";

export default function SharedList() {
  const [sharedLists, setSharedLists] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // 儲存錯誤訊息
  const [successMessage, setSuccessMessage] = useState(""); // 儲存成功訊息
  const [refreshKey, setRefreshKey] = useState(0); // 用來觸發 `useEffect`

  useEffect(() => {
    ListPermissionsBox("/get_sharelist_permission/", {}, true)
      .then((response) => {
        if (response.data.length > 0) {
          const formattedLists = response.data.map((item) => ({
            id: item.f_list_id,
            listname: item.list_name,
            description: item.description || "",
            sharedBy: item.f_owner_email,
          }));
          //console.log(formattedLists);
          setSharedLists(formattedLists);
        } else {
          setSharedLists([]);
          setErrorMessage(response.msg);
        }
      })
      .catch((error) => {
        setErrorMessage(error.message); // 顯示API回傳的錯誤訊息
      });
  }, [refreshKey]);

  return (
    <div>
      {/* Shared Lists Section */}
      <section>
        <h1 className="text-2xl font-bold mb-6">Shared Lists</h1>
        {/* 錯誤訊息顯示 */}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {/* 成功訊息顯示 */}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
        <div className="space-y-4">
          {sharedLists.map((list) => (
            <div key={list.id} className="flex items-center gap-4">
              <Link
                href={{
                  pathname: `/lists/${list.listname}`,
                  query: { id: list.id },
                }}
                className="flex-1"
              >
                <div
                  className="flex-1 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <span className="font-bold">{list.listname}</span>
                      <span className="text-gray-500 text-sm">
                        {list.description}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Shared by: {list.sharedBy}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
