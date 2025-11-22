// src/context/UserDataContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useUserData } from "../hooks/useUserData.js";
import { postUser } from "../api/client.js";

const UserDataContext = createContext(null);

export function UserDataProvider({ children }) {
  const [userId, setUserId] = useState("");
  const [userIdJustChanged, setUserIdJustChanged] = useState(null);
  const [hasRequestedNotification, setHasRequestedNotification] =
    useState(false);
  const { data, isLoading, error, isOffline } = useUserData(userId, 1000);
  const lastNoteRef = useRef(null);

  // Load saved ID at startup
  useEffect(() => {
    const saved = localStorage.getItem("sensus_user_id");
    if (saved) setUserId(saved);
  }, []);

  // When userId changes, persist & ensure it exists
  useEffect(() => {
    if (!userId) return;

    localStorage.setItem("sensus_user_id", userId);

    setUserIdJustChanged(userId);
    const timer = setTimeout(() => setUserIdJustChanged(null), 2000);

    // Important: do NOT override spectator data — empty POST only if new user
    postUser(userId, {}); // merge-safe post

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

  return (
    <UserDataContext.Provider
      value={{
        userId,
        setUserId,
        userData: data,
        isLoading,
        error,
        isOffline,
        userIdJustChanged,
      }}
    >
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
    setHasRequestedNotification((req) => {
      if (req) return req;

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
  if (!ctx) throw new Error("useUserDataContext must be used inside provider");
  return ctx;
}
