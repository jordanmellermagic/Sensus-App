import { useEffect, useRef, useState } from "react";
import { getUser } from "../api/client.js";

export function useUserData(userId, intervalMs = 1000) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOnce() {
      if (!userId) {
        setData(null);
        setError(null);
        return;
      }
      setIsLoading(true);
      try {
        const result = await getUser(userId);
        if (!cancelled) {
          setData(result);
          setError(null);
          setIsOffline(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setIsOffline(!navigator.onLine);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchOnce();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (userId) {
      intervalRef.current = setInterval(fetchOnce, intervalMs);
    }

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, intervalMs]);

  return { data, isLoading, error, isOffline };
}
