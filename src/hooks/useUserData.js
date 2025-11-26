// src/hooks/useUserData.js

import { useEffect, useRef, useState } from "react";
import { getDataPeek, getNotePeek, getScreenPeek } from "../api/client.js";

export function useUserData(userId, intervalMs = 1000) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        setData(null);
        setError(false);
        setIsOffline(false);
        return;
      }

      setIsLoading(true);

      try {
        const [dataPeek, notePeek, screenPeek] = await Promise.all([
          getDataPeek(userId),
          getNotePeek(userId),
          getScreenPeek(userId),
        ]);

        if (!cancelled) {
          setData({ ...dataPeek, ...notePeek, ...screenPeek });
          setError(false);
          setIsOffline(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Polling error:", err);
          setError(true);
          setIsOffline(!navigator.onLine);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    if (intervalRef.current) clearInterval(intervalRef.current);

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
