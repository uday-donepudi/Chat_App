import React from "react";
import { useState } from "react";
import LogIn from "../components/LogIn";
import SignUp from "../components/SignUp";

const LoginPage = () => {
  const [islogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Single Container with Tabs and Form */}
        <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs Header */}
          <div className="p-6 pb-0">
            <div className="flex bg-gray-100 rounded-full">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-full font-medium transition-all duration-200 ${
                  islogin
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-full font-medium transition-all duration-200 ${
                  !islogin
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 pb-6 pt-2">
            {islogin ? <LogIn /> : <SignUp />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
