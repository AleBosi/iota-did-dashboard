import React, { createContext, useContext, useMemo, useState } from "react";

type Key = { type: "company" | "actor" | "machine"; id: string };
type Secrets = Record<string, string>; // key => mnemonic

function toKey(k: Key) { return `${k.type}:${k.id}`; }

const SecretsCtx = createContext<{
  getSeed: (k: Key) => string | undefined;
  setSeed: (k: Key, mnemonic: string) => void;
  clearSeed: (k?: Key) => void;
} | null>(null);

export const SecretsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [map, setMap] = useState<Secrets>({});

  const api = useMemo(() => ({
    getSeed: (k: Key) => map[toKey(k)],
    setSeed: (k: Key, mnemonic: string) => setMap(prev => ({ ...prev, [toKey(k)]: mnemonic })),
    clearSeed: (k?: Key) => {
      if (!k) return setMap({});
      setMap(prev => {
        const next = { ...prev };
        delete next[toKey(k)];
        return next;
      });
    }
  }), [map]);

  return <SecretsCtx.Provider value={api}>{children}</SecretsCtx.Provider>;
};

export const useSecrets = () => {
  const ctx = useContext(SecretsCtx);
  if (!ctx) throw new Error("useSecrets must be used within SecretsProvider");
  return ctx;
};
