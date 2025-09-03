import React from "react";
import { Routes, Route } from "react-router-dom";

// Pagina di login
import LoginPage from "../LoginPage";

// Dashboard (adatta i percorsi ai tuoi file reali)
import AdminDashboard from "../components/Dashboard/AdminDashboard";
import AziendaDashboard from "../components/Dashboard/AziendaDashboard";
import CreatorDashboard from "../components/Dashboard/CreatorDashboard";
import OperatorDashboard from "../components/Dashboard/OperatorDashboard";
import MacchinarioDashboard from "../components/Dashboard/MacchinarioDashboard";

import RequireRole from "./RequireRole";

/**
 * Router centrale dell'app: definisce le rotte e applica le guardie di ruolo.
 * NB: l'integrazione in main/App verrà fatta dopo.
 */
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <RequireRole allow={["admin"]}>
            <AdminDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/azienda"
        element={
          <RequireRole allow={["azienda"]}>
            <AziendaDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/creator"
        element={
          <RequireRole allow={["creator"]}>
            <CreatorDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/operatore"
        element={
          <RequireRole allow={["operatore"]}>
            <OperatorDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/macchinario"
        element={
          <RequireRole allow={["macchinario"]}>
            <MacchinarioDashboard />
          </RequireRole>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}
