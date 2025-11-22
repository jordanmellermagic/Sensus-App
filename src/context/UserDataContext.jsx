import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUserData } from "../hooks/useUserData.js";

const UserDataContext = createContext(null);

export function UserDataProvider({ children }) {
  const [userId, setUserId] = useState("");
  const [hasRequestedNotification, setHasRequestedNotification] = useState(false);
  const { data, isLoading, error, isOffline } = useUserData(userId, 1000);
  const lastNoteNameRef = useRef(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("sensus_user_id");
    if (stored) {
      setUserId(stored);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      window.localStorage.setItem("sensus_user_id", userId);
    }
  }, [userId]);

  useEffect(() => {
    if (!data || !data.note_name) return;

    const current = data.note_name;
    const prev = lastNoteNameRef.current;
    lastNoteNameRef.current = current;

    if (prev && current !== prev) {
      maybeNotifyNoteName(current, setHasRequestedNotification);
    }
  }, [data]);

  const value = {
    userId,
    setUserId,
    userData: data,
    isLoading,
    error,
    isOffline,
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

function maybeNotifyNoteName(noteName, setHasRequestedNotification) {
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
  if (!ctx) throw new Error("useUserDataContext must be used within UserDataProvider");
  return ctx;
}
