import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import { useUser } from "./contexts/UserContext";

// ⬇️ Aggiorna questi path se i tuoi file reali sono in sottocartelle diverse.
const AdminDashboard = lazy(() => import("./components/Dashboard/AdminDashboard"));
const AziendaDashboard = lazy(() => import("./components/Dashboard/AziendaDashboard"));
const CreatorDashboard = lazy(() => import("./components/Dashboard/CreatorDashboard"));
const OperatorDashboard = lazy(() => import("./components/Dashboard/OperatorDashboard"));
const MacchinarioDashboard = lazy(() => import("./components/Dashboard/MacchinarioDashboard"));

function RoleHomeRedirect() {
  const { session } = useUser();
  if (!session.role) return <Navigate to="/login" replace />;
  const map: Record<string, string> = {
    admin: "/admin",
    azienda: "/azienda",
    creator: "/creator",
    operatore: "/operatore",
    macchinario: "/macchinario",
  };
  return <Navigate to={map[session.role] || "/login"} replace />;
}

function RequireRole({
  role,
  children,
}: {
  role: "admin" | "azienda" | "creator" | "operatore" | "macchinario";
  children: React.ReactNode;
}) {
  const { session } = useUser();
  if (session.role !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<RoleHomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin/*"
          element={
            <RequireRole role="admin">
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/azienda/*"
          element={
            <RequireRole role="azienda">
              <AziendaDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/creator/*"
          element={
            <RequireRole role="creator">
              <CreatorDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/operatore/*"
          element={
            <RequireRole role="operatore">
              <OperatorDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/macchinario/*"
          element={
            <RequireRole role="macchinario">
              <MacchinarioDashboard />
            </RequireRole>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
