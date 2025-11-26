// src/pages/HomePage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserDataContext } from "../context/UserDataContext.jsx";
import StatusBanner from "../components/StatusBanner.jsx";
import { adminCreateUser, changePassword } from "../api/client.js";

export default function HomePage() {
  const navigate = useNavigate();
  const { userId, setUserId, error, isOffline, userIdJustChanged } =
    useUserDataContext();

  const [loginUserId, setLoginUserId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [pwStatus, setPwStatus] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [adminKey, setAdminKey] = useState("");
  const [adminUserId, setAdminUserId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminStatus, setAdminStatus] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    if (userId) setLoginUserId(userId);
  }, [userId]);

  const loggedIn = Boolean(userId);
  const isAdmin = loggedIn && userId.toLowerCase() === "admin";

  const handleLogin = async () => {
    setLoginError("");
    const id = loginUserId.trim();
    const pw = loginPassword.trim();
    if (!id || !pw) {
      setLoginError("Enter both User ID and password.");
      return;
    }
    setLoginLoading(true);
    try {
      await changePassword(id, pw, pw);
      setUserId(id);
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("User not found")) setLoginError("User not found.");
      else if (msg.includes("Old password incorrect"))
        setLoginError("Incorrect password.");
      else setLoginError("Login failed. Check API and credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setUserId("");
    setLoginPassword("");
    setOldPw("");
    setNewPw("");
    setNewPwConfirm("");
    setPwStatus("");
    setPwError("");
  };

  const handleChangePassword = async () => {
    setPwStatus("");
    setPwError("");
    if (!loggedIn) {
      setPwError("You must be logged in.");
      return;
    }
    if (!oldPw || !newPw || !newPwConfirm) {
      setPwError("Fill all fields.");
      return;
    }
    if (newPw !== newPwConfirm) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(userId, oldPw, newPw);
      setPwStatus("Password changed.");
      setOldPw("");
      setNewPw("");
      setNewPwConfirm("");
    } catch (err) {
      setPwError(err?.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleAdminCreate = async () => {
    setAdminStatus("");
    setAdminError("");
    if (!isAdmin) {
      setAdminError("Only admin can use this panel.");
      return;
    }
    if (!adminKey.trim() || !adminUserId.trim() || !adminPassword.trim()) {
      setAdminError("Fill all fields.");
      return;
    }
    setAdminLoading(true);
    try {
      const json = await adminCreateUser(
        adminKey.trim(),
        adminUserId.trim(),
        adminPassword.trim()
      );
      if (json.status === "created")
        setAdminStatus(`User "${json.user_id}" created.`);
      else if (json.status === "updated")
        setAdminStatus(`Password updated for "${json.user_id}".`);
      else setAdminStatus("Success.");
    } catch (err) {
      setAdminError(err?.message || "Admin request failed.");
    } finally {
      setAdminLoading(false);
    }
  };

  const canNavigate = loggedIn;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative">
      <StatusBanner error={error} isOffline={isOffline} />

      {userIdJustChanged && (
        <div className="absolute top-2 inset-x-0 flex justify-center z-20">
          <div className="rounded-full bg-neutral-900 border border-neutral-700 px-4 py-1 text-xs text-neutral-200 shadow">
            Logged in as <span className="font-semibold">{userIdJustChanged}</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-start pt-16 px-6 gap-8">
        <header className="text-center">
          <h1 className="text-4xl font-semibold tracking-[0.25em] uppercase">
            Sensus
          </h1>
          <p className="mt-2 text-xs text-neutral-500 uppercase tracking-wide">
            Login &amp; Control
          </p>
        </header>

        {!loggedIn && (
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900/70 border border-neutral-800 px-4 py-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase text-neutral-300">
              Performer Login
            </h2>

            <div>
              <label className="text-xs uppercase text-neutral-400">
                User ID
              </label>
              <input
                value={loginUserId}
                onChange={(e) => setLoginUserId(e.target.value)}
                className="w-full mt-1 rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-2 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-neutral-400">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full mt-1 rounded-xl bg-neutral-900 border border-neutral-700 px-4 py-2 outline-none focus:border-blue-500"
              />
            </div>

            {loginError && (
              <div className="text-xs text-red-400">{loginError}</div>
            )}

            <button
              onClick={handleLogin}
              disabled={loginLoading}
              className="w-full mt-2 rounded-xl bg-neutral-100 text-black py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {loginLoading ? "Checking…" : "Log In"}
            </button>
          </div>
        )}

        {loggedIn && (
          <>
            <div className="flex flex-col items-center gap-2">
              <div className="text-sm text-neutral-400">
                Logged in as{" "}
                <span className="font-semibold text-neutral-100">
                  {userId}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1 rounded-full border border-neutral-700 bg-neutral-900 active:scale-95 transition"
              >
                Log Out
              </button>
            </div>

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

            <div className="w-full max-w-sm rounded-2xl bg-neutral-900/70 border border-neutral-800 px-4 py-4 space-y-2">
              <h3 className="text-xs uppercase text-neutral-400">
                Change Password
              </h3>

              <input
                type="password"
                placeholder="Current password"
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={newPwConfirm}
                onChange={(e) => setNewPwConfirm(e.target.value)}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />

              {pwError && (
                <div className="text-xs text-red-400 mt-1">{pwError}</div>
              )}
              {pwStatus && (
                <div className="text-xs text-emerald-400 mt-1">
                  {pwStatus}
                </div>
              )}

              <button
                onClick={handleChangePassword}
                disabled={pwLoading}
                className="w-full mt-1 rounded-xl bg-neutral-100 text-black py-2 text-xs font-medium disabled:opacity-60"
              >
                {pwLoading ? "Saving…" : "Change Password"}
              </button>
            </div>

            {isAdmin && (
              <div className="w-full max-w-sm rounded-2xl bg-neutral-950/80 border border-neutral-800 px-4 py-4 space-y-2">
                <h3 className="text-xs uppercase text-neutral-400">
                  Admin: Create / Update User
                </h3>

                <input
                  type="password"
                  placeholder="Admin key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <input
                  placeholder="User ID"
                  value={adminUserId}
                  onChange={(e) => setAdminUserId(e.target.value)}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />

                {adminError && (
                  <div className="text-xs text-red-400 mt-1">
                    {adminError}
                  </div>
                )}
                {adminStatus && (
                  <div className="text-xs text-emerald-400 mt-1">
                    {adminStatus}
                  </div>
                )}

                <button
                  onClick={handleAdminCreate}
                  disabled={adminLoading}
                  className="w-full mt-1 rounded-xl bg-neutral-100 text-black py-2 text-xs font-medium disabled:opacity-60"
                >
                  {adminLoading ? "Saving…" : "Create / Update User"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
