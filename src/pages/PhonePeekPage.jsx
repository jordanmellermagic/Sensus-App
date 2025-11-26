// src/pages/PhonePeekPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserDataContext } from "../context/UserDataContext.jsx";
import StatusBanner from "../components/StatusBanner.jsx";
import { API_BASE } from "../api/client.js";

export default function PhonePeekPage() {
  const navigate = useNavigate();
  const { userId, userData, error, isOffline } = useUserDataContext();
  const [screenshotUrl, setScreenshotUrl] = useState(null);

  useEffect(() => {
    if (!userId || !userData?.screenshot_path) {
      setScreenshotUrl(null);
      return;
    }
    const url = `${API_BASE}/screen_peek/${encodeURIComponent(
      userId
    )}/screenshot?ts=${Date.now()}`;
    setScreenshotUrl(url);
  }, [userId, userData?.screenshot_path]);

  const noteName = userData?.note_name || "";

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <StatusBanner error={error} isOffline={isOffline} />

      <div className="flex items-center justify-between px-4 pt-4">
        <button
          className="text-sm text-neutral-400"
          onClick={() => navigate("/")}
        >
          ← Home
        </button>
        <div className="text-xs text-neutral-500">
          {userId ? `ID: ${userId}` : "No user selected"}
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <div className="text-2xl font-semibold text-center break-words">
          {noteName || " "}
        </div>

        {screenshotUrl ? (
          <div className="w-3/4 max-w-xs mt-4">
            <img
              src={screenshotUrl}
              alt="Screenshot"
              className="w-full h-auto rounded-lg border border-neutral-700 object-contain"
            />
          </div>
        ) : (
          <div className="text-sm text-neutral-500">
            No screenshot available.
          </div>
        )}
      </main>
    </div>
  );
}
