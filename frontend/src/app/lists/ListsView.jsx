"use client"

import MyList from "./MyLists"
import SharedList from "./SharedLists"
import { useDispatch, useSelector } from "react-redux"

export function ListsView() {
    //const dispatch = useDispatch()
    
    return(
        <div className="flex-1 ml-60">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <MyList />
                <SharedList />
            </div>
        </div>
    )
}