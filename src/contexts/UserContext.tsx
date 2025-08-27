import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { safeGet, safeSet } from "../utils/storage";

export type UserRole = "admin" | "azienda" | "creator" | "operatore" | "macchinario";

export interface UserSession {
  role: UserRole | null;
  seed: string | null;
  did: string | null;
  [k: string]: any;
}

interface UserContextShape {
  session: UserSession;
  login: (role: UserRole, data?: Partial<Omit<UserSession, "role">>) => void;
  logout: () => void;
}

const SESSION_KEY = "iota.trustup.session";
const defaultSession: UserSession = { role: null, seed: null, did: null };

const Ctx = createContext<UserContextShape>({
  session: defaultSession,
  login: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession>(() =>
    safeGet<UserSession>(SESSION_KEY, defaultSession)
  );

  useEffect(() => {
    safeSet<UserSession>(SESSION_KEY, session);
  }, [session]);

  const login = (role: UserRole, data?: Partial<Omit<UserSession, "role">>) => {
    const next: UserSession = {
      ...defaultSession,
      ...safeGet<UserSession>(SESSION_KEY, defaultSession),
      ...data,
      role,
    };
    setSession(next);
  };

  const logout = () => {
    setSession(defaultSession);
    safeSet<UserSession>(SESSION_KEY, defaultSession);
  };

  const value = useMemo(() => ({ session, login, logout }), [session]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUser() {
  return useContext(Ctx);
}

export const routeByRole: Record<UserRole, string> = {
  admin: "/admin",
  azienda: "/azienda",
  creator: "/creator",
  operatore: "/operatore",
  macchinario: "/macchinario",
};
