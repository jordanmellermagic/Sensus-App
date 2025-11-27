import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('sensus_user_id');
    if (stored) setUserId(stored);
  }, []);

  const login = (id) => {
    localStorage.setItem('sensus_user_id', id);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem('sensus_user_id');
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
