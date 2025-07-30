import React from "react";
import { useState, useEffect } from "react";
import instance from "../utils/axios";
import Chat from "./Chat";
import NewChat from "./NewChat";

const SideBar = ({ onChatSelect }) => {
  const [isChat, setIsChat] = useState(true);

  return (
    <>
      <div className="px-2 py-1 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center h-12">
          <button
            onClick={() => setIsChat(true)}
            className={`flex-1 py-2 text-lg font-bold rounded-l-lg transition-all duration-200 ${
              isChat
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Chats
          </button>
          <div className="w-px h-8 bg-slate-300"></div>
          <button
            onClick={() => setIsChat(false)}
            className={`flex-1 py-2 text-lg font-bold rounded-r-lg transition-all duration-200 ${
              !isChat
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            New Chat
          </button>
        </div>
      </div>
      {isChat ? (
        <Chat onChatSelect={onChatSelect} />
      ) : (
        <NewChat onChatCreated={() => setIsChat(true)} />
      )}
    </>
  );
};

export default SideBar;
