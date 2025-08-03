import React, { createContext, useContext, useState } from "react";

export type UserRole = "admin" | "azienda" | "creator" | "operatore" | "macchinario";

export interface UserSession {
  role: UserRole | null;
  data: any | null; // Puoi tipizzare meglio: Azienda, Actor, ecc
}

interface UserContextProps {
  session: UserSession;
  login: (role: UserRole, data: any) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextProps>({
  session: { role: null, data: null },
  login: () => {},
  logout: () => {}
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession>({ role: null, data: null });

  const login = (role: UserRole, data: any) => setSession({ role, data });
  const logout = () => setSession({ role: null, data: null });

  return (
    <UserContext.Provider value={{ session, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
