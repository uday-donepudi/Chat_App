import React, { useState } from "react";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import ChatShow from "../components/ChatShow";
import { useSocket } from "../lib/SocketProvider";

const HomePage = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const { isConnected } = useSocket();

  const handleChatSelect = (chatId) => {
    setSelectedChatId(chatId);
  };

  return (
    <div className="h-screen flex flex-col">
      

      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r border-gray-300">
          <SideBar onChatSelect={handleChatSelect} />
        </div>
        <div className="flex-1">
          {selectedChatId ? (
            <ChatShow chatId={selectedChatId} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
              <div className="text-center px-12">
                <div className="w-32 h-32 mx-auto mb-10 bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 rounded-full flex items-center justify-center shadow-inner border border-blue-100">
                  <svg
                    className="w-16 h-16 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-4">
                  Welcome to ChatApp
                </h3>
                <p className="text-slate-500 text-base max-w-sm leading-relaxed mx-auto">
                  Select a chat from the chats to start messaging, or create a
                  new chat to begin a conversation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
