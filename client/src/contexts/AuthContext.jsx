import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔁 CHECK LOGIN STATUS ON APP LOAD
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await authAPI.getMe();
        setUser(res.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // 🔐 LOGIN
  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials);
      setUser(res.data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  // 📝 REGISTER
  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // 🚪 LOGOUT
  const logout = async () => {
    try {
      await authAPI.logout(); // clears cookie on backend
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // 👤 UPDATE PROFILE
  const updateProfile = async (profileData) => {
    try {
      const res = await authAPI.updateProfile(profileData);
      setUser(res.data.data || res.data.user || res.data);
      return { success: true, data: res.data.data, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Profile update failed",
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
