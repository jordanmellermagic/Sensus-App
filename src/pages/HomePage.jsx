// src/pages/HomePage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserDataContext } from "../context/UserDataContext.jsx";
import StatusBanner from "../components/StatusBanner.jsx";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function HomePage() {
  const navigate = useNavigate();
  const { userId, setUserId, error, isOffline, userIdJustChanged } =
    useUserDataContext();

  // Performer login state
  const [localId, setLocalId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Admin create/update state
  const [adminKey, setAdminKey] = useState("");
  const [adminUserId, setAdminUserId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminStatus, setAdminStatus] = useState("");

  // Initialize localId from context userId (e.g. from localStorage)
  useEffect(() => {
    if (userId) {
      setLocalId(userId);
      setIsLoggedIn(true);
    }
  }, [userId]);

  const handleLogin = async () => {
    const trimmedId = localId.trim();
    setLoginError("");
    setAdminStatus("");

    if (!trimmedId) {
      setLoginError("Please enter a User ID.");
      return;
    }
    if (!password.trim()) {
      setLoginError("Please enter a password.");
      return;
    }
    if (!API_BASE) {
      setLoginError("API base URL not configured.");
      return;
    }

    setLoginLoading(true);
    try {
      // Use change_password as a login check by "changing" password to itself.
      const res = await fetch(
        `${API_BASE}/user/${encodeURIComponent(trimmedId)}/change_password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            old_password: password,
            new_password: password,
          }),
        }
      );

      if (!res.ok) {
        if (res.status === 403) {
          setLoginError("Incorrect password.");
        } else if (res.status === 404) {
          setLoginError("User not found.");
        } else {
          setLoginError("Login failed. Please try again.");
        }
        setIsLoggedIn(false);
        return;
      }

      // Successful "login"
      setUserId(trimmedId);
      setIsLoggedIn(true);
      setLoginError("");
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("Could not reach server.");
      setIsLoggedIn(false);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLocalIdChange = (e) => {
    setLocalId(e.target.value);
  };

  const canNavigate = isLoggedIn && Boolean(localId.trim());

  const handleAdminCreate = async () => {
    const trimmedAdminKey = adminKey.trim();
    const trimmedUserId = adminUserId.trim();
    setAdminError("");
    setAdminStatus("");
    setLoginError("");

    if (!trimmedAdminKey) {
      setAdminError("Enter the admin key.");
      return;
    }
    if (!trimmedUserId) {
      setAdminError("Enter a User ID.");
      return;
    }
    if (!adminPassword.trim()) {
      setAdminError("Enter a password.");
      return;
    }
    if (!API_BASE) {
      setAdminError("API base URL not configured.");
      return;
    }

    setAdminLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/auth/create_user?admin_key=${encodeURIComponent(
          trimmedAdminKey
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: trimmedUserId,
            password: adminPassword,
          }),
        }
      );

      const json = await res
        .json()
        .catch(() => ({ status: "unknown", detail: "No JSON" }));

      if (!res.ok) {
        if (res.status === 403) {
          setAdminError("Invalid admin key.");
        } else {
          setAdminError(
            json?.detail || "Admin create/update failed. Check console."
          );
        }
        return;
      }

      if (json.status === "created") {
        setAdminStatus(`User "${trimmedUserId}" created.`);
      } else if (json.status === "updated") {
        setAdminStatus(`Password for "${trimmedUserId}" updated.`);
      } else {
        setAdminStatus("Request succeeded.");
      }
    } catch (err) {
      console.error("Admin create error:", err);
      setAdminError("Could not reach server.");
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative">
      <StatusBanner error={error} isOffline={isOffline} />

      {userIdJustChanged && (
        <div className="absolute top-2 inset-x-0 flex justify-center z-20">
          <div className="rounded-full bg-neutral-900 border border-neutral-700 px-4 py-1 text-xs text-neutral-200 shadow">
            User ID set to{" "}
            <span className="font-semibold">{userIdJustChanged}</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-start pt-16 px-6 gap-10">
        <header className="text-center">
          <h1 className="text-4xl font-semibold tracking-[0.25em] uppercase">
            Sensus
          </h1>
          <p className="mt-2 text-xs text-neutral-500 uppercase tracking-wide">
            Login &amp; Admin
          </p>
        </header>

        {/* Performer Login Card */}
        <div className="w-full max-w-sm flex flex-col gap-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 px-4 py-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-neutral-200">
              Performer Login
            </h2>
            {isLoggedIn && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-600/40">
                Logged in
              </span>
            )}
          </div>

          <label className="text-xs uppercase tracking-wide text-neutral-400">
            User ID
          </label>
          <input
            value={localId}
            onChange={handleLocalIdChange}
            placeholder="Enter user id"
            className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 text-base outline-none focus:border-blue-500"
            autoComplete="username"
          />

          <label className="mt-2 text-xs uppercase tracking-wide text-neutral-400">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-3 text-base outline-none focus:border-blue-500"
            autoComplete="current-password"
          />

          {loginError && (
            <div className="mt-2 text-xs text-red-400">{loginError}</div>
          )}

          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="mt-3 w-full rounded-xl bg-neutral-100 text-black py-2.5 text-sm font-medium active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loginLoading ? "Checking..." : "Log In"}
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="w-full max-w-sm flex flex-row gap-4">
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

        {/* Admin Section */}
        <div className="w-full max-w-sm mt-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 px-4 py-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-wide text-neutral-400">
              Admin: Create / Update User
            </h3>
          </div>

          <label className="text-[11px] uppercase tracking-wide text-neutral-500">
            Admin Key
          </label>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin key"
            className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <label className="text-[11px] uppercase tracking-wide text-neutral-500 mt-1">
            User ID
          </label>
          <input
            value={adminUserId}
            onChange={(e) => setAdminUserId(e.target.value)}
            placeholder="User id"
            className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <label className="text-[11px] uppercase tracking-wide text-neutral-500 mt-1">
            Password
          </label>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          {adminError && (
            <div className="mt-1 text-[11px] text-red-400">{adminError}</div>
          )}
          {adminStatus && (
            <div className="mt-1 text-[11px] text-emerald-400">
              {adminStatus}
            </div>
          )}

          <button
            onClick={handleAdminCreate}
            disabled={adminLoading}
            className="mt-2 w-full rounded-xl bg-neutral-100 text-black py-2 text-xs font-medium active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {adminLoading ? "Saving..." : "Create / Update User"}
          </button>
        </div>
      </div>
    </div>
  );
}
