import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import LoginPage from "./LoginPage";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import AziendaDashboard from "./components/Dashboard/AziendaDashboard";
import CreatorDashboard from "./components/Dashboard/CreatorDashboard";
import OperatorDashboard from "./components/Dashboard/OperatorDashboard";
import MacchinarioDashboard from "./components/Dashboard/MacchinarioDashboard";

function ProtectedRoute({
  children,
  allowed
}: { children: React.ReactNode; allowed: string[] }) {
  const { session } = useUser();
  if (!session?.role || !allowed.includes(session.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { session } = useUser();
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowed={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/azienda"
        element={
          <ProtectedRoute allowed={["azienda"]}>
            <AziendaDashboard azienda={session?.data} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/creator"
        element={
          <ProtectedRoute allowed={["creator"]}>
            <CreatorDashboard creator={session?.data} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operatore"
        element={
          <ProtectedRoute allowed={["operatore"]}>
            <OperatorDashboard operatore={session?.data} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/macchinario"
        element={
          <ProtectedRoute allowed={["macchinario"]}>
            <MacchinarioDashboard macchinario={session?.data} />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
