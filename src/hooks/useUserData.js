// src/hooks/useUserData.js

import { useEffect, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

// Fetch helper
async function safeGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

export function useUserData(userId, intervalMs = 1000) {
  const [data, setData] = useState({
    dataPeek: null,
    notePeek: null,
    screenPeek: null,
  });

  const [error, setError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        setData({
          dataPeek: null,
          notePeek: null,
          screenPeek: null,
        });
        return;
      }

      setIsLoading(true);

      try {
        const [dataPeek, notePeek, screenPeek] = await Promise.all([
          safeGet(`/data_peek/${userId}`),
          safeGet(`/note_peek/${userId}`),
          safeGet(`/screen_peek/${userId}`),
        ]);

        if (!cancelled) {
          setData({ dataPeek, notePeek, screenPeek });
          setError(false);
          setIsOffline(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(true);
          setIsOffline(!navigator.onLine);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    // load immediately
    load();

    // clear existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    // set up polling
    if (userId) {
      intervalRef.current = setInterval(load, intervalMs);
    }

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, intervalMs]);

  return { data, setData, isLoading, error, isOffline };
}
