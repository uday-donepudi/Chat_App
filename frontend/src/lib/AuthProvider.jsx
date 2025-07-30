import { createContext, useContext, useState, useEffect } from "react";
import instance from "../utils/axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await instance.get("/auth/check");
      setUser(res.data.user);
    } catch (error) {
      if (error.response?.status !== 401 && error.code !== "ERR_NETWORK") {
        console.error("Auth error:", error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (navigate) => {
    try {
      await instance.post("/auth/logout");
      setUser(null);
      toast.success("Logout successful!", {
        position: "top-center",
      });
      if (navigate) {
        navigate("/");
      }
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed. Please try again.", {
        position: "top-center",
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
