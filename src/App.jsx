import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./authContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SpectatorDataPage from "./pages/SpectatorDataPage.jsx";
import PeekScreenPage from "./pages/PeekScreenPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

export default function App() {
  return (
    <AuthProvider>
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
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
