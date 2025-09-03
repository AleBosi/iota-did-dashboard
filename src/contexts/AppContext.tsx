import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { safeGet, safeSet } from "../utils/storage";

// Chiavi localStorage per preferenze UI
const LSK_UI = {
  theme: "ui_theme",
  sidebar: "ui_sidebar_open",
};

type Theme = "light" | "dark" | "system";

type AppUiContextShape = {
  theme: Theme;
  setTheme: (t: Theme) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Utilità per piccoli flag UI (es. modali, tour, ecc.)
  flags: Record<string, boolean>;
  setFlag: (key: string, value: boolean) => void;
};

const AppContext = createContext<AppUiContextShape>(null as any);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }: { children: ReactNode }) {
  // --- Stato UI con persistenza mock ---
  const [theme, setTheme] = useState<Theme>(() => safeGet<Theme>(LSK_UI.theme, "light"));
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => safeGet<boolean>(LSK_UI.sidebar, true));
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  // Persistenza mock su change
  useEffect(() => safeSet(LSK_UI.theme, theme), [theme]);
  useEffect(() => safeSet(LSK_UI.sidebar, sidebarOpen), [sidebarOpen]);

  // Setter per flags UI
  const setFlag = (key: string, value: boolean) =>
    setFlags((f) => ({ ...f, [key]: value }));

  const value = useMemo<AppUiContextShape>(
    () => ({
      theme,
      setTheme,
      sidebarOpen,
      setSidebarOpen,
      flags,
      setFlag,
    }),
    [theme, sidebarOpen, flags]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export { AppContext };
