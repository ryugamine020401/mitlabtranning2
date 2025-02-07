"use client";

import { useState } from "react";

export default function SharedList() {
    const [sharedLists, setSharedLists] = useState([
        { id: 1, name: "清單1",description:"A家", sharedBy: "User A" },
        { id: 2, name: "清單2",description:"A家", sharedBy: "User B" },
      ])


    return (
        <div>
        {/* Shared Lists Section */}
          <section>
            <h1 className="text-2xl font-bold mb-6">Shared Lists</h1>
            <div className="space-y-4">
              {sharedLists.map((list) => (
                <div key={list.id} className="flex items-center gap-4">
                  <div
                    onClick={() => handleViewDetail(list.name)}
                    className="flex-1 bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <span className="font-bold">{list.name}</span>
                        <span className="text-gray-500 text-sm">{list.description}</span>
                      </div>
                        <span className="text-sm text-gray-500">Shared by: {list.sharedBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
    );
}
