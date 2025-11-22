// src/hooks/useUserData.js

import { useEffect, useRef, useState } from "react";
import { getUser, createUserIfNotExists } from "../api/client.js";

// Merge helper: keep existing non-empty strings unless new value is non-empty
function mergeUserData(prev, next) {
  if (!prev) return next;
  if (!next) return prev;

  const merged = { ...prev };

  for (const key of Object.keys(next)) {
    const newVal = next[key];
    const oldVal = prev[key];

    if (typeof newVal === "string") {
      // Only overwrite if the new string is non-empty
      merged[key] = newVal.trim() !== "" ? newVal : oldVal;
    } else if (newVal !== null && newVal !== undefined) {
      merged[key] = newVal;
    } else {
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

    async function loadInitial() {
      if (!userId) {
        setData(null);
        setError(null);
        return;
      }

      setIsLoading(true);

      try {
        // Ensure the user exists (creates blank record if missing)
        const result = await createUserIfNotExists(userId);
        if (!cancelled) {
          setData((prev) => (prev ? mergeUserData(prev, result) : result));
          setError(null);
          setIsOffline(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setIsOffline(!navigator.onLine);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadInitial();

    if (intervalRef.current) clearInterval(intervalRef.current);

    if (userId) {
      intervalRef.current = setInterval(async () => {
        try {
          const result = await getUser(userId);
          if (!cancelled) {
            setData((prev) => (prev ? mergeUserData(prev, result) : result));
            setError(null);
            setIsOffline(false);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err);
            setIsOffline(!navigator.onLine);
          }
        }
      }, intervalMs);
    }

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, intervalMs]);

  // NOTE: we now expose setData so pages can intentionally update local state
  return { data, setData, isLoading, error, isOffline };
}
