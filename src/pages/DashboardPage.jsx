import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext.jsx";
import { clearAll } from "../api.js";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { userId, logout } = useAuth();
  const [resetting, setResetting] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleReset() {
    if (!userId) return;
    const ok = window.confirm("Clear all data for this user?");
    if (!ok) return;
    try {
      setResetting(true);
      setError("");
      await clearAll(userId);
    } catch (err) {
      setError(err.message || "Failed to reset");
    } finally {
      setResetting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      <div className="dashboard-root">
        <div className="sensus-logo">SENSUS</div>
        <div className="dashboard-logged-in">Logged in as <strong>{userId}</strong></div>

        <div className="dashboard-section-label">Peeks</div>
        <div className="dashboard-button-row">
          <button className="pill-button" onClick={() => navigate("/peek")}>
            Peek Screen
          </button>
          <button className="pill-button" onClick={() => navigate("/spectator")}>
            Spectator Data
          </button>
        </div>

        <div className="dashboard-section-label">App Controls</div>
        <div className="dashboard-button-row">
          <button className="pill-button" onClick={() => navigate("/settings")}>
            Settings
          </button>
          <button className="pill-button red" onClick={handleReset} disabled={resetting}>
            {resetting ? "Resetting..." : "Reset App"}
          </button>
        </div>

        <button className="pill-button text-only" onClick={handleLogout}>
          Log Out
        </button>

        {error && <div className="error-text" style={{ marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}
