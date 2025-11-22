// src/context/UserDataContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useUserData } from "../hooks/useUserData.js";

const UserDataContext = createContext(null);

export function UserDataProvider({ children }) {
  const [userId, setUserId] = useState("");
  const [userIdJustChanged, setUserIdJustChanged] = useState(null);
  const [hasRequestedNotification, setHasRequestedNotification] =
    useState(false);

  const { data, setData, isLoading, error, isOffline } = useUserData(
    userId,
    1000
  );

  const lastNoteRef = useRef(null);

  // Load stored ID on startup
  useEffect(() => {
    const saved = window.localStorage.getItem("sensus_user_id");
    if (saved) setUserId(saved);
  }, []);

  // Whenever userId changes, persist it and show confirmation pill
  useEffect(() => {
    if (!userId) return;

    window.localStorage.setItem("sensus_user_id", userId);

    setUserIdJustChanged(userId);
    const timer = setTimeout(() => setUserIdJustChanged(null), 2000);

    // No POST here — creation is handled by createUserIfNotExists in the hook
    return () => clearTimeout(timer);
  }, [userId]);

  // Watch note_name for notifications
  useEffect(() => {
    if (!data) return;

    const curr = data.note_name;
    const prev = lastNoteRef.current;
    lastNoteRef.current = curr;

    if (curr && curr !== prev) {
      notifyNote(curr, setHasRequestedNotification);
    }
  }, [data]);

  const value = {
    userId,
    setUserId,
    userData: data,
    setUserData: setData, // expose setter so pages can intentionally update local state
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

function notifyNote(noteName, setHasRequestedNotification) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification("New note", { body: noteName });
    return;
  }

  if (Notification.permission === "default") {
    setHasRequestedNotification((requested) => {
      if (requested) return requested;

      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification("New note", { body: noteName });
        }
      });

      return true;
    });
  }
}

export function useUserDataContext() {
  const ctx = useContext(UserDataContext);
  if (!ctx)
    throw new Error("useUserDataContext must be used inside UserDataProvider");
  return ctx;
}
