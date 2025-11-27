import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../api.js";
import { useAuth } from "../authContext.jsx";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    if (!oldPassword || !newPassword) {
      setMessage("Enter both old and new password.");
      return;
    }
    try {
      setLoading(true);
      await changePassword(userId, oldPassword, newPassword);
      setMessage("Password changed.");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="settings-shell">
      <div className="back-link" onClick={() => navigate("/dashboard")}>
        ← Home
      </div>
      <div className="settings-card">
        <div className="settings-title">Settings</div>
        <form onSubmit={handleSubmit}>
          <div className="settings-field">
            <div className="field-label">Old Password</div>
            <input
              className="text-input"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="settings-field">
            <div className="field-label">New Password</div>
            <input
              className="text-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>
        {message && <div className="error-text" style={{ marginTop: 12 }}>{message}</div>}
      </div>
    </div>
  );
}
