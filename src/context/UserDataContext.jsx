// src/context/UserDataContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUserData } from "../hooks/useUserData.js";

const UserDataContext = createContext(null);

export function UserDataProvider({ children }) {
  const [userId, setUserIdState] = useState("");
  const [userIdJustChanged, setUserIdJustChanged] = useState(null);

  const { data, setData, isLoading, error, isOffline } = useUserData(
    userId,
    1000
  );

  useEffect(() => {
    const saved = window.localStorage.getItem("sensus_user_id");
    if (saved) {
      setUserIdState(saved);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      window.localStorage.removeItem("sensus_user_id");
      return;
    }

    window.localStorage.setItem("sensus_user_id", userId);
    setUserIdJustChanged(userId);
    const t = setTimeout(() => setUserIdJustChanged(null), 2000);
    return () => clearTimeout(t);
  }, [userId]);

  const setUserId = (nextId) => {
    setUserIdState(nextId || "");
  };

  const value = {
    userId,
    setUserId,
    userData: data,
    setUserData: setData,
    isLoading,
    error,
    isOffline,
    userIdJustChanged,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserDataContext() {
  const ctx = useContext(UserDataContext);
  if (!ctx)
    throw new Error("useUserDataContext must be used inside UserDataProvider");
  return ctx;
}
