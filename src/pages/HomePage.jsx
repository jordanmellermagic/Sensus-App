import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserDataContext } from "../context/UserDataContext.jsx";
import StatusBanner from "../components/StatusBanner.jsx";

export default function HomePage() {
  const navigate = useNavigate();
  const { userId, setUserId, error, isOffline } = useUserDataContext();
  const [localId, setLocalId] = useState("");

  useEffect(() => {
    setLocalId(userId || "");
  }, [userId]);

  const handleUseId = () => {
    const trimmed = localId.trim();
    if (!trimmed) return;
    setUserId(trimmed);
  };

  const canNavigate = Boolean(userId || localId.trim());

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <StatusBanner error={error} isOffline={isOffline} />
      <div className="flex-1 flex flex-col items-center justify-start pt-16 px-6 gap-10">
        <header className="text-center">
          <h1 className="text-4xl font-semibold tracking-[0.25em] uppercase">
            Sensus
          </h1>
        </header>

        <div className="w-full max-w-sm flex flex-col gap-3">
          <label className="text-xs uppercase tracking-wide text-neutral-400">
            User ID
          </label>
          <input
            value={localId}
            onChange={(e) => setLocalId(e.target.value)}
            onBlur={handleUseId}
            placeholder="Enter user id"
            className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 text-base outline-none focus:border-blue-500"
          />
          <button
            onClick={handleUseId}
            className="mt-1 w-full rounded-xl bg-neutral-100 text-black py-2.5 text-sm font-medium active:scale-[0.98] transition"
          >
            Use this ID
          </button>
        </div>

        <div className="w-full max-w-sm flex flex-row gap-4 mt-6">
          <button
            disabled={!canNavigate}
            onClick={() => navigate("/peek")}
            className="flex-1 rounded-2xl py-4 text-sm font-semibold border border-neutral-700 bg-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition"
          >
            Phone Peek
          </button>
          <button
            disabled={!canNavigate}
            onClick={() => navigate("/spectator")}
            className="flex-1 rounded-2xl py-4 text-sm font-semibold border border-neutral-700 bg-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition"
          >
            Spectator Data
          </button>
        </div>
      </div>
    </div>
  );
}
