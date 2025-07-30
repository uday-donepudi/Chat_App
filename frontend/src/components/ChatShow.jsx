import React, { useState, useEffect, useCallback, useRef } from "react";
import instance from "../utils/axios";
import { useAuth } from "../lib/AuthProvider";
import { useSocket } from "../lib/SocketProvider";
import toast from "react-hot-toast";

const ChatShow = ({ chatId, onBack, isMobile, chatName }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [chatInput, setChatInput] = useState("");
  const { socket } = useSocket();
  const messagesContainerRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Touch/swipe gesture states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Message deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null); // For desktop hover dropdown

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

  const handleDeleteMessage = async (messageId) => {
    try {
      // Optimistically remove the message from UI immediately
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );

      await instance.delete(`message/${messageId}`);

      toast.success("Message deleted successfully", {
        position: "top-center",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error deleting message:", error);

      // Revert the optimistic update by refetching messages
      getMessages();

      toast.error("Failed to delete message. Please try again.", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  // Long press handlers for mobile
  const handleLongPressStart = (messageId) => {
    if (!isMobile) return;

    const timer = setTimeout(() => {
      setMessageToDelete(messageId);
      setShowDeleteModal(true);
    }, 800); // 800ms long press threshold

    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Right click handler for desktop
  const handleRightClick = (e, messageId) => {
    if (isMobile) return;

    e.preventDefault();
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (messageToDelete) {
      handleDeleteMessage(messageToDelete);
      setShowDeleteModal(false);
      setMessageToDelete(null);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };
  // Swipe gesture handlers
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -50; // Swipe right threshold

    if (isRightSwipe && isMobile && onBack) {
      onBack();
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

    const handleMessageDeleted = (deletedData) => {
      if (deletedData.chatId !== chatId) return;

      // Remove the deleted message from the UI
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== deletedData.messageId)
      );

      // Show notification if the message was deleted by someone else
      if (deletedData.sender !== user?.id) {
        toast.info("A message was deleted", {
          position: "top-center",
          duration: 2000,
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);

    // Cleanup function
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket, chatId, user?.id]);

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

  // Cleanup long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

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
    <div
      className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      ref={chatContainerRef}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* Header with Back Button for Mobile */}
      <div className="relative bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative p-3.5">
          <div className="flex items-center">
            {/* Back Button for Mobile */}
            {isMobile && onBack && (
              <button
                onClick={onBack}
                className="mr-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                aria-label="Go back to chat list"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                {isMobile && chatName ? chatName : "Chat Messages"}
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
                    className={`group max-w-[80%] min-w-0 relative ${
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
                      // Mobile: Long press to delete (only for user's own messages)
                      onTouchStart={
                        message.sender === user?.id
                          ? () => handleLongPressStart(message._id)
                          : undefined
                      }
                      onTouchEnd={
                        message.sender === user?.id
                          ? handleLongPressEnd
                          : undefined
                      }
                      onTouchCancel={
                        message.sender === user?.id
                          ? handleLongPressEnd
                          : undefined
                      }
                      // Desktop: Right click to delete (only for user's own messages)
                      onContextMenu={
                        message.sender === user?.id
                          ? (e) => handleRightClick(e, message._id)
                          : undefined
                      }
                      // Prevent text selection during long press
                      style={{ userSelect: isMobile ? "none" : "auto" }}
                    >
                      {/* Desktop hover delete button (only for user's own messages) */}
                      {!isMobile && message.sender === user?.id && (
                        <button
                          onClick={() => {
                            setMessageToDelete(message._id);
                            setShowDeleteModal(true);
                          }}
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg z-20"
                          title="Delete message"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}

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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Message
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this message? This action cannot
                be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatShow;
