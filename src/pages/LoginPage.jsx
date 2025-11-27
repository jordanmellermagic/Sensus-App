import React, { useState } from 'react';
import { useAuth } from '../authContext.jsx';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../apiConfig.js';

export default function LoginPage() {
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async () => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userIdInput,
          password: passwordInput,
        }),
      });

      if (!res.ok) {
        setError('Invalid login.');
        return;
      }

      login(userIdInput);
      navigate('/dashboard');
    } catch {
      setError('Network error.');
    }
  };

  return (
    <div className="login-layout">
      <div className="login-card">
        <h1 className="sensus-title">SENSUS</h1>
        <div className="sensus-subtitle">Control panel</div>

        <input
          className="login-input"
          placeholder="User ID"
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
        />

        <input
          className="login-input"
          placeholder="Password"
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />

        <button className="pill-button" onClick={onSubmit}>
          Log In
        </button>

        {error && <div className="error-text">{error}</div>}
      </div>
    </div>
  );
}
