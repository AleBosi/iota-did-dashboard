import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import LoginPage from "./LoginPage";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import AziendaDashboard from "./components/Dashboard/AziendaDashboard";
import CreatorDashboard from "./components/Dashboard/CreatorDashboard";
import OperatorDashboard from "./components/Dashboard/OperatorDashboard";
import MacchinarioDashboard from "./components/Dashboard/MacchinarioDashboard";

// Protected route wrapper
function ProtectedRoute({ children, allowed }: { children: React.ReactNode; allowed: string[] }) {
  const { session } = useUser();
  if (!session.role || !allowed.includes(session.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { session } = useUser();

  return (
    <Router>
      <Routes>
        {/* Homepage = Login universale */}
        <Route path="/" element={<LoginPage />} />

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowed={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        {/* Azienda dashboard */}
        <Route
          path="/azienda"
          element={
            <ProtectedRoute allowed={["azienda"]}>
              <AziendaDashboard azienda={session.data} />
            </ProtectedRoute>
          }
        />
        {/* Creator dashboard */}
        <Route
          path="/creator"
          element={
            <ProtectedRoute allowed={["creator"]}>
              <CreatorDashboard creator={session.data} />
            </ProtectedRoute>
          }
        />
        {/* Operatore dashboard */}
        <Route
          path="/operatore"
          element={
            <ProtectedRoute allowed={["operatore"]}>
              <OperatorDashboard operatore={session.data} />
            </ProtectedRoute>
          }
        />
        {/* Macchinario dashboard */}
        <Route
          path="/macchinario"
          element={
            <ProtectedRoute allowed={["macchinario"]}>
              <MacchinarioDashboard macchinario={session.data} />
            </ProtectedRoute>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
