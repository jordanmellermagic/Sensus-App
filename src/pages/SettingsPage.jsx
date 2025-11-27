import React, { useState } from 'react';
import { useAuth } from '../authContext.jsx';
import { API_BASE } from '../apiConfig.js';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const submit = async () => {
    setMessage('');
    try {
      const res = await fetch(
        `${API_BASE}/user/${encodeURIComponent(userId)}/change_password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            old_password: oldPass,
            new_password: newPass,
          }),
        }
      );

      if (!res.ok) {
        setMessage('Incorrect password.');
        setIsError(true);
        return;
      }

      setMessage('Password changed successfully!');
      setIsError(false);
    } catch {
      setMessage('Network error.');
      setIsError(true);
    }
  };

  return (
    <div className="settings-layout">
      <h1 className="sensus-title">SENSUS</h1>
      <div className="sensus-subtitle">Settings</div>

      <input
        className="settings-input"
        placeholder="Old password"
        type="password"
        value={oldPass}
        onChange={(e) => setOldPass(e.target.value)}
      />

      <input
        className="settings-input"
        placeholder="New password"
        type="password"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
      />

      <button className="pill-button" onClick={submit}>
        Change Password
      </button>

      {message && (
        <div
          className={`settings-message ${
            isError ? 'settings-error' : 'settings-success'
          }`}
        >
          {message}
        </div>
      )}

      <button
        className="small-link-button"
        onClick={() => navigate('/dashboard')}
      >
        Back to dashboard
      </button>
    </div>
  );
}
