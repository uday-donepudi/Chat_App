import React, { useEffect, useState } from "react";
import instance from "../utils/axios";
import { useAuth } from "../lib/AuthProvider";
import toast from "react-hot-toast";

const NewChat = ({ onChatCreated }) => {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [allUsers, setAllUsers] = useState([]);

  const handlenewChat = async (selectedUserId) => {
    try {
      const chatData = {
        participants: [user.id, selectedUserId],
      };
      setData(chatData);

      const response = await instance.post("/chat/join", chatData);

      // Switch to Chats tab after successful chat creation
      toast.success("New chat created successfully!", {
        position: "top-center",
      });
      if (onChatCreated) {
        onChatCreated();
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast.error("Failed to create new chat. Please try again.", {
        position: "top-center",
      });
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await instance.get("/user/getuser");
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="h-full bg-gradient-to-b from-slate-50 to-slate-100 px-2 py-4">
      <div className="mb-3">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
          Start New Chat
        </h2>
        <p className="text-slate-500 mt-2">
          Choose someone to start chatting with
        </p>
      </div>

      <div className="space-y-1">
        {allUsers.length === 0 ? (
          <div className="text-center py-10 px-1">
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">
              No users available
            </p>
            <p className="text-gray-400 text-xs mt-1">Check back later!</p>
          </div>
        ) : (
          allUsers.map((otherUser) => (
            <div key={otherUser._id} className="group">
              <button
                onClick={() => handlenewChat(otherUser._id)}
                className="w-full p-4 text-left transition-all duration-200 ease-in-out transform hover:scale-[1.01] rounded-xl bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md border-2 border-slate-100 hover:border-blue-200"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200/50 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-sm font-bold text-blue-500">
                      {otherUser.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-base">
                      {otherUser.username}
                    </p>
                    <p className="text-sm text-gray-500">{otherUser.email}</p>
                  </div>
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110"></div>
                  </div>
                </div>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewChat;
