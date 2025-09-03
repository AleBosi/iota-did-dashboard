import React, { Suspense, useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import { Toaster } from "@/components/ui/toaster";
import { SecretsProvider } from "@/contexts/SecretsContext";

// UI skeleton per il fallback durante i lazy import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
      {/* Mettiamo l'intero albero dentro SecretsProvider così LoginPage & co. hanno accesso a useSecrets */}
      <SecretsProvider>
        <Suspense fallback={<LoadingScreen />}>
          <AppRouter />
        </Suspense>
      </SecretsProvider>

      {/* Toast globali shadcn */}
      <Toaster />
    </>
  );
}
