import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      // Create socket connection only if we don't have one or if user ID changed
      if (!socket || socket.userId !== user.id) {
        // Clean up existing socket if any
        if (socket) {
          socket.close();
        }

        const newSocket = io(import.meta.env.MODE === "development" ? "http://localhost:3001" : "/", {
          withCredentials: true,
        });

        // Store user ID on socket for reference
        newSocket.userId = user.id;

        newSocket.on("connect", () => {
          console.log("Connected to server:", newSocket.id);
          setIsConnected(true);

          // Join the user to their room
          newSocket.emit("join", user.id);
        });

        newSocket.on("disconnect", () => {
          console.log("Disconnected from server");
          setIsConnected(false);
        });

        newSocket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          setIsConnected(false);
        });

        setSocket(newSocket);
      }
    } else {
      // If user is not logged in, disconnect socket
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [user?.id]); // Only depend on user.id instead of the entire user object

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
