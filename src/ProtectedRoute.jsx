import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext.jsx';

export default function ProtectedRoute({ children }) {
  const { userId } = useAuth();
  if (!userId) return <Navigate to="/" replace />;
  return children;
}
