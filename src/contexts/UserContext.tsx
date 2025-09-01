import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type UserRole = "admin" | "azienda" | "creator" | "operatore" | "macchinario";

type Session = {
  role: UserRole | null;
  seed?: string | null;
  entityId?: string | null; // DID o id dell'entità corrente (azienda/attore/macchina)
};

type Ctx = {
  session: Session;
  login: (role: UserRole, payload: { seed?: string | null; entityId?: string | null }) => void;
  logout: () => void;
};

const LS_KEY = "mockSession/v1";
const CtxUser = createContext<Ctx | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : { role: null, seed: null, entityId: null };
    } catch {
      return { role: null, seed: null, entityId: null };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(session));
    } catch {/* ignore */}
  }, [session]);

  const login = (role: UserRole, payload: { seed?: string | null; entityId?: string | null }) => {
    setSession({
      role,
      seed: payload.seed ?? null,
      entityId: payload.entityId ?? null,
    });
  };

  const logout = () => setSession({ role: null, seed: null, entityId: null });

  const value = useMemo(() => ({ session, login, logout }), [session]);
  return <CtxUser.Provider value={value}>{children}</CtxUser.Provider>;
}

export function useUser() {
  const ctx = useContext(CtxUser);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}

export const routeByRole: Record<UserRole, string> = {
  admin: "/admin",
  azienda: "/azienda",
  creator: "/creator",
  operatore: "/operatore",
  macchinario: "/macchinario",
};
