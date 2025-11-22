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
  const [hasRequestedNotification, setHasRequestedNotification] =
    useState(false);
  const [userIdJustChanged, setUserIdJustChanged] = useState(null);
  const { data, isLoading, error, isOffline } = useUserData(userId, 1000);
  const lastNoteNameRef = useRef(null);

  // Load userId from localStorage on mount
  useEffect(() => {
    const stored = window.localStorage.getItem("sensus_user_id");
    if (stored) {
      setUserId(stored);
    }
  }, []);

  // Persist userId and show confirmation flag
  useEffect(() => {
    if (userId) {
      window.localStorage.setItem("sensus_user_id", userId);
      setUserIdJustChanged(userId);
      const t = setTimeout(() => setUserIdJustChanged(null), 2000);
      return () => clearTimeout(t);
    }
  }, [userId]);

  // Note name change notifications
  useEffect(() => {
    if (!data) return;
    const current = data.note_name;
    const prev = lastNoteNameRef.current;
    lastNoteNameRef.current = current;

    // Notify when note_name becomes non-empty OR changes between values
    if (current && current !== prev) {
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
    userIdJustChanged,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
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
  if (!ctx)
    throw new Error("useUserDataContext must be used within UserDataProvider");
  return ctx;
}
