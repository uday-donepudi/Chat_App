import React, { useState, useEffect, useCallback, useRef } from "react";
import instance from "../utils/axios";
import { useAuth } from "../lib/AuthProvider";
import { useSocket } from "../lib/SocketProvider";

const ChatShow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [chatInput, setChatInput] = useState("");
  const { socket } = useSocket();
  const messagesContainerRef = useRef(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

 

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const grouped = [];
    let currentDate = null;

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toDateString();

      if (currentDate !== messageDate) {
        // Add date separator
        grouped.push({
          type: "date-separator",
          date: messageDate,
          id: `date-${messageDate}`,
        });
        currentDate = messageDate;
      }

      grouped.push({
        type: "message",
        ...message,
      });
    });

    return grouped;
  };

  const getMessages = async () => {
    try {
      setLoading(true);
      const response = await instance.get(`/message/${chatId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return; // Prevent sending empty messages

    try {
      const response = await instance.post(`message/newMessage`, {
        chatId: chatId,
        content: chatInput,
      });

      const newMessage = response.data.message;
      setChatInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const handleSocketMessage = useCallback(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.chatId !== chatId) return;

      // Check if message already exists to prevent duplicates
      setMessages((prevMessages) => {
        const exists = prevMessages.some((msg) => msg._id === message._id);
        if (exists) return prevMessages;
        return [...prevMessages, message];
      });
    };

    socket.on("newMessage", handleNewMessage);

    // Cleanup function
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, chatId]);

  useEffect(() => {
    if (chatId) {
      getMessages();
      const cleanup = handleSocketMessage();

      // Cleanup on unmount or chatId change
      return cleanup;
    }
  }, [chatId, handleSocketMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Beautiful Header */}
      <div className="relative bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative p-3.5">
          <div className="flex items-center ">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Chat Messages
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-8 scrollbar-hide min-h-0"
      >
        {/* min-h-0 is important for proper flex behavior */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-12">
            <div className="w-32 h-32 mb-10 bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 rounded-full flex items-center justify-center shadow-inner border border-blue-100">
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
              No messages yet
            </h3>
            <p className="text-slate-500 text-base max-w-sm leading-relaxed">
              Start the conversation! Send a message to begin chatting with your
              contact.
            </p>
          </div>
        ) : (
          <div className="space-y-2 pb-6 max-w-8xl mx-auto">
            {groupMessagesByDate(messages).map((item, index) => {
              if (item.type === "date-separator") {
                return (
                  <div key={item.id} className="flex justify-center my-2">
                    <div className="bg-white/80 backdrop-blur-sm px-2 py-1 shadow-sm border border-slate-200">
                      <span className="text-xs font-medium text-slate-600">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                );
              }

              // Render message
              const message = item;
              return (
                <div
                  key={`message-${message._id}-${index}`}
                  className={`flex ${
                    message.sender === user?.id
                      ? "justify-end"
                      : "justify-start"
                  } animate-fadeIn px-2`}
                >
                  <div
                    className={`group max-w-[80%] min-w-0 ${
                      message.sender === user?.id ? "order-2" : "order-1"
                    }`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`relative px-4 py-1 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                        message.sender === user?.id
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto border border-blue-400/20"
                          : "bg-white text-slate-800 border border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="relative z-10 ">
                        <p className="text-base leading-7 break-words whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <div
                          className={`flex items-center space-x-2 ${
                            message.sender === user?.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <time
                            className={`text-xs font-medium ${
                              message.sender === user?.id
                                ? "text-blue-100"
                                : "text-slate-400"
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Beautiful Input Area - Fixed at bottom */}
      <div className="relative bg-white border-t border-slate-200 p-4 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                name="chatInput"
                id="chatInput"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="w-full py-3 px-5 pr-20 bg-white border-2 border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-base placeholder-slate-400 transition-all duration-200 hover:border-slate-300"
              />
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <svg
                className="relative z-10 w-5 h-5 transform group-hover:rotate-12 transition-transform duration-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatShow;
