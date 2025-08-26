import React, { createContext, useContext, useState } from "react";

export type UserRole = "admin" | "azienda" | "creator" | "operatore" | "macchinario";
export type Session = { role: UserRole | null; data: any | null };

type CtxType = {
  session: Session;
  login: (role: UserRole, data?: any) => void;
  logout: () => void;
};

const Ctx = createContext<CtxType | null>(null);

function safeParse<T>(raw: string | null, fb: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fb;
  } catch {
    return fb;
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(() =>
    safeParse<Session>(localStorage.getItem("session"), { role: null, data: null })
  );

  const login = (role: UserRole, data?: any) => {
    const s: Session = { role, data: data ?? null };
    localStorage.setItem("session", JSON.stringify(s));
    setSession(s);
  };

  const logout = () => {
    localStorage.removeItem("session");
    setSession({ role: null, data: null });
  };

  return <Ctx.Provider value={{ session, login, logout }}>{children}</Ctx.Provider>;
}

export const useUser = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("UserContext missing");
  return v;
};
