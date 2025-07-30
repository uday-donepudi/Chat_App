import React from "react";
import { useAuth } from "../lib/AuthProvider";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <nav className="relative bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 text-white shadow-2xl">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 backdrop-blur-sm rounded-b-2xl"></div>

      {/* Outer wrapper */}
      <div className="relative px-2 py-2  ">
        {/* Flex container with manual spacing */}
        <div className="flex items-center justify-between w-full">
          {/* Left - Logo and Text */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-md border border-white/30">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent leading-snug">
                ChatApp
              </h1>
              <p className="text-sm text-blue-100 opacity-80">Connect & Chat</p>
            </div>
          </div>

          {/* Right - Logout Button */}
          <div>
            <button
              onClick={handleLogout}
              className="group relative flex items-center space-x-2 px-6 py-2 rounded-full border border-red-300/30 bg-gradient-to-r from-red-500/80 to-pink-500/80 hover:from-red-600 hover:to-pink-600 transition-all duration-300 ease-in-out shadow-md hover:shadow-xl transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              <svg
                className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="relative text-white font-medium tracking-wide">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
