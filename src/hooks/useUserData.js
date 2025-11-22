import { useEffect, useRef, useState } from "react";
import { getUser } from "../api/client.js";

// helper: merge new data into old, keeping old non-empty values
function mergeUserData(prev, next) {
  if (!next) return prev;
  if (!prev) return next;

  const merged = { ...prev };

  for (const key of Object.keys(next)) {
    const newVal = next[key];
    const oldVal = prev[key];

    // For strings: if new is non-empty, use it; if empty, keep old
    if (typeof newVal === "string") {
      merged[key] = newVal.trim() !== "" ? newVal : oldVal;
    } else if (newVal !== null && newVal !== undefined) {
      // Non-string fields: always use new when defined
      merged[key] = newVal;
    } else {
      // newVal null/undefined: keep old
      merged[key] = oldVal;
    }
  }

  return merged;
}

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
          setData((prev) => mergeUserData(prev, result));
          setError(null);
          setIsOffline(!navigator.onLine ? true : false);
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
