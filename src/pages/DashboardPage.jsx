import React from 'react';
import { useAuth } from '../authContext.jsx';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../apiConfig.js';

export default function DashboardPage() {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();

  const resetApp = async () => {
    try {
      await fetch(`${API_BASE}/clear_all/${encodeURIComponent(userId)}`, {
        method: 'POST',
      });
    } catch {
      // ignore network errors
    }
  };

  return (
    <div className="dashboard-layout">
      <h1 className="sensus-title">SENSUS</h1>
      <div className="sensus-subtitle">Logged in as {userId}</div>

      <div className="dashboard-section-title">Peeks</div>
      <button className="pill-button" onClick={() => navigate('/peek')}>
        Peek Screen
      </button>
      <button className="pill-button" onClick={() => navigate('/spectator')}>
        Spectator Data
      </button>

      <div className="dashboard-section-title">App Controls</div>
      <button className="pill-button" onClick={() => navigate('/settings')}>
        Settings
      </button>
      <button className="pill-button pill-button-danger" onClick={resetApp}>
        Reset App
      </button>

      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
