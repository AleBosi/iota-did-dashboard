import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import { useUser } from "./contexts/UserContext";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ⬇️ AGGIUNTA: SecretsProvider per abilitare useSecrets ovunque (LoginPage compresa)
import { SecretsProvider } from "@/contexts/SecretsContext";

// Lazy routes (aggiorna i path se i file sono altrove)
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

  const dest = map[String(session.role)] ?? "/login";
  return <Navigate to={dest} replace />;
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

function LoadingScreen() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-6 w-24 rounded-xl" />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 rounded-xl" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-6 w-32 rounded-xl" />
                <Skeleton className="h-4 w-20 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content block */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-40 rounded-xl" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  // Forza tema dark per coerenza con il design condiviso
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      {/* ⬇️ TUTTO l’albero (Routes incluse) è ora dentro SecretsProvider */}
      <SecretsProvider>
        <Suspense fallback={<LoadingScreen />}>
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
      </SecretsProvider>

      {/* Toast globali shadcn */}
      <Toaster />
    </>
  );
}
