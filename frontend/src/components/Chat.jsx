import React, { useState, useEffect } from "react";
import instance from "../utils/axios";
import { useSocket } from "../lib/SocketProvider";

const Chat = ({ onChatSelect }) => {
  const [data, setData] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const { socket } = useSocket();

  const getChatData = async () => {
    try {
      const response = await instance.get("/chat/");
      setData(response.data.chatsWithNames || response.data.chats || []);
    } catch (error) {
      console.error("Error fetching chat data:", error);
    }
  };

  const handleChatClick = (chatId) => {
    setSelectedChatId(chatId);
    if (onChatSelect) {
      onChatSelect(chatId);
    }
  };
  const handlesocketLastMessage = () => {
    if (!socket) return;

    const handleLastMessage = (message) => {
      setData((prevData) => {
        // Update the chat with new message
        const updatedData = prevData.map((chat) =>
          chat._id === message.chatId
            ? {
                ...chat,
                lastMessage: message.content,
                // Update chatName if provided (useful for new chats)
                ...(message.chatName && { chatName: message.chatName }),
                // Update timestamp for proper sorting
                updatedAt: message.updatedAt || new Date().toISOString(),
              }
            : chat
        );

        // Sort by updatedAt to show most recent chats first
        return updatedData.sort(
          (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
        );
      });
    };

    socket.on("lastMessage", handleLastMessage);

    // Return cleanup function
    return () => {
      socket.off("lastMessage", handleLastMessage);
    };
  };
  useEffect(() => {
    getChatData();
    const cleanup = handlesocketLastMessage();

    // Cleanup on unmount
    return cleanup;
  }, [socket]);

  return (
    <div className="h-full bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200">
      {/* Chat List */}
      <div className="px-2 py-6 overflow-y-auto h-full">
        {data.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-24 h-24 mx-auto mb-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">No chats yet</p>
            <p className="text-gray-400 text-xs mt-1">Start a conversation!</p>
          </div>
        ) : (
          data.map((chat) => (
            <div key={chat._id} className="group mb-1  flex justify-center">
              <div className="w-full max-w-sm">
                <button
                  onClick={() => handleChatClick(chat._id)}
                  className={`w-full p-2 text-left transition-all duration-200 ease-in-out transform hover:scale-[1.01] rounded-xl ${
                    selectedChatId === chat._id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 border-2 border-blue-400/50"
                      : "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md border-2 border-slate-100 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 my-2 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                        selectedChatId === chat._id
                          ? "bg-white/20 backdrop-blur-sm"
                          : "bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200/50"
                      }`}
                    >
                      <span
                        className={`text-sm font-bold ${
                          selectedChatId === chat._id
                            ? "text-white"
                            : "text-blue-500"
                        }`}
                      >
                        {chat.chatName?.charAt(0)?.toUpperCase() || "C"}
                      </span>
                    </div>
                    <div className="w-[2%]"></div>{" "}
                    {/* spacer between logo and name */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p
                        className={`font-semibold truncate text-base ${
                          selectedChatId === chat._id
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                      >
                        {chat.chatName}
                      </p>
                      <p
                        className={`text-sm text-gray-500 ${
                          selectedChatId === chat._id ? "text-white" : ""
                        }`}
                      >
                        {chat.lastMessage
                          ? chat.lastMessage
                          : "No messages yet"}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Chat;
