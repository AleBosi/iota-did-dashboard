import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Role = "admin" | "azienda" | "creator" | "operatore" | "macchinario";

export type Session = {
  role: Role | "";          // "" a riposo
  did?: string;             // DID coerente (es. did:iota:evm:0x...)
  entityId?: string | null; // alias fallback
  seed?: string;            // opzionale (mock)
  username?: string | null; // opzionale
  data?: any;               // payload libero passato a login(...)
};

type Ctx = {
  session: Session;
  login: (role: Role, payload?: any) => void;
  logout: () => void;
};

const UserCtx = createContext<Ctx | undefined>(undefined);

// 📍 rotta per ruolo (usata da LoginPage e redirect vari)
export const routeByRole: Record<Role, string> = {
  admin: "/admin",
  azienda: "/azienda",
  creator: "/creator",
  operatore: "/operatore",
  macchinario: "/macchinario",
};

const STORAGE_KEY = "iota.trustup.session";

function readStoredSession(): Session {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { role: "" };
    const parsed = JSON.parse(raw);
    // hardening: garantiamo i campi minimi
    return {
      role: parsed?.role || "",
      did: parsed?.did,
      entityId: parsed?.entityId ?? parsed?.did ?? null,
      seed: parsed?.seed,
      username: parsed?.username ?? null,
      data: parsed?.data,
    } as Session;
  } catch {
    return { role: "" };
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(() => readStoredSession());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {}
  }, [session]);

  const login = (role: Role, payload: any = {}) => {
    // Accettiamo payload "libero" (compat test + chiamate esistenti)
    const did: string | undefined =
      (payload.did as string) ||
      (payload.entityId as string) ||
      (payload.id as string) ||
      undefined;

    const next: Session = {
      role,
      did,
      entityId: payload.entityId ?? did ?? null,
      seed: payload.seed,
      username: payload.username ?? payload.user ?? null,
      data: payload, // 👈 mantiene compat con i test: session.data.name === "Mario"
    };

    setSession(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const logout = () => {
    setSession({ role: "" });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const value = useMemo<Ctx>(() => ({ session, login, logout }), [session]);

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
}

export function useUser(): Ctx {
  const ctx = useContext(UserCtx);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
