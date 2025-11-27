import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SpectatorDataPage from './pages/SpectatorDataPage.jsx';
import PeekScreenPage from './pages/PeekScreenPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spectator"
          element={
            <ProtectedRoute>
              <SpectatorDataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/peek"
          element={
            <ProtectedRoute>
              <PeekScreenPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
