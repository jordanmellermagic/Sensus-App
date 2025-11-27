import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(() => window.localStorage.getItem("sensus_user_id") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!window.localStorage.getItem("sensus_user_id"));

  const login = (id) => {
    setUserId(id);
    setIsAuthenticated(true);
    window.localStorage.setItem("sensus_user_id", id);
  };

  const logout = () => {
    setUserId("");
    setIsAuthenticated(false);
    window.localStorage.removeItem("sensus_user_id");
  };

  const value = { userId, isAuthenticated, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
