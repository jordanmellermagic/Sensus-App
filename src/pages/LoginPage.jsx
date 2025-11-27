import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api.js";
import { useAuth } from "../authContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!userId || !password) {
      setError("Enter your user ID and password.");
      return;
    }
    try {
      setLoading(true);
      await loginRequest(userId, password);
      login(userId);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fullscreen-center">
      <div className="login-card">
        <div className="sensus-header">
          <div className="sensus-logo">SENSUS</div>
        </div>
        <div className="login-title">Performer Login</div>
        <form onSubmit={handleSubmit}>
          <div className="field-label">User ID</div>
          <input
            className="text-input"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <div className="field-label" style={{ marginTop: 14 }}>Password</div>
          <input
            className="text-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        {error && <div className="error-text">{error}</div>}
      </div>
    </div>
  );
}
