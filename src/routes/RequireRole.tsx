import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

type UserRole = "admin" | "azienda" | "creator" | "operatore" | "macchinario";

interface Props {
  allow: UserRole[];       // ruoli ammessi
  children: React.ReactNode;
  redirectTo?: string;     // default: "/"
}

/**
 * Guard per proteggere route in base al ruolo utente.
 *
 * Uso:
 *   <RequireRole allow={['creator']}>
 *     <CreatorDashboard />
 *   </RequireRole>
 */
export default function RequireRole({ allow, children, redirectTo = "/" }: Props) {
  const { session, currentActor } = useUser();
  const role = (session?.role || currentActor?.role) as UserRole | undefined;

  if (!role) return <Navigate to={redirectTo} replace />;
  if (!allow.includes(role)) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}
