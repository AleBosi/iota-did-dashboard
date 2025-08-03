import React, { createContext, useState, ReactNode } from "react";

export const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  // MOCK login (da sostituire con logica reale)
  const login = (seed: string) => {
    // Simula login assegnando un ruolo. Cambia "admin" in "azienda", ecc per testare
    setUser({ username: "demo", role: "admin" }); 
  };

  const logout = () => setUser(null);

  return (
    <AppContext.Provider value={{ user, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};
