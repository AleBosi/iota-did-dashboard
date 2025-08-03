import React, { useState } from "react";
import { generateDid } from "../../utils/didUtils";
import { saveItem, loadItem } from "../../utils/storageHelpers";

// Modello base per azienda
interface Azienda {
  id: string; // DID
  name: string;
  creators: string[]; // lista DID creator associati
}

export default function AdminDashboard() {
  const [aziende, setAziende] = useState<Azienda[]>(() => {
    // Carica aziende da localStorage o backend
    const data = loadItem<Azienda[]>("aziende") || [];
    return data;
  });
  const [newName, setNewName] = useState("");

  const creaAzienda = () => {
    const id = generateDid();
    const nuovaAzienda: Azienda = { id, name: newName, creators: [] };
    const updated = [...aziende, nuovaAzienda];
    setAziende(updated);
    saveItem("aziende", updated);
    setNewName("");
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
      <h2 className="text-lg font-semibold mb-2">Crea nuova azienda</h2>
      <input
        placeholder="Nome azienda"
        value={newName}
        onChange={e => setNewName(e.target.value)}
        className="border px-2 py-1 rounded mr-2"
      />
      <button
        onClick={creaAzienda}
        disabled={!newName.trim()}
        className="bg-blue-500 text-white px-4 py-1 rounded"
      >
        Crea
      </button>
      <h2 className="text-lg font-semibold mt-6 mb-2">Aziende registrate</h2>
      <ul>
        {aziende.map(az => (
          <li key={az.id}>
            <span className="font-mono">{az.name}</span> <br />
            <span className="text-xs text-gray-500">DID: {az.id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
