// /src/components/Common/LoginSeed.tsx
import React, { useState } from "react";
import { loadItem } from "../../utils/storageHelpers";
import { Actor } from "../../models/actor";

export default function LoginSeed({ onLogin, aziendaId }: { onLogin: (user: Actor) => void, aziendaId: string }) {
  const [seed, setSeed] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // Cerca tra i creator dell'azienda (puoi espandere a operatori/macchinari)
    const creators = loadItem<Actor[]>(`creators_${aziendaId}`) || [];
    const operatori = loadItem<Actor[]>(`operatori_${aziendaId}`) || [];
    const macchinari = loadItem<Actor[]>(`macchinari_${aziendaId}`) || [];
    const user =
      creators.find(u => u.seed === seed) ||
      operatori.find(u => u.seed === seed) ||
      macchinari.find(u => u.seed === seed);
    if (user) {
      onLogin(user);
      setError("");
    } else {
      setError("Seed non trovato");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        value={seed}
        onChange={e => setSeed(e.target.value)}
        placeholder="Inserisci il seed"
        className="border px-2 py-1 rounded"
      />
      <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={handleLogin}>
        Login
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
