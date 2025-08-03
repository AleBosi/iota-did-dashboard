import React, { useState } from "react";
import { generateDid } from "../../utils/didUtils";
import { generateSeed } from "../../utils/seedUtils";
import { saveItem, loadItem } from "../../utils/storageHelpers";
import { Actor } from "../../models/actor";

export default function AziendaDashboard({ aziendaId }: { aziendaId: string }) {
  // CREATORI
  const [creators, setCreators] = useState<Actor[]>(() =>
    loadItem<Actor[]>(`creators_${aziendaId}`) || []
  );
  const [newCreatorName, setNewCreatorName] = useState("");

  // OPERATORI
  const [operatori, setOperatori] = useState<Actor[]>(() =>
    loadItem<Actor[]>(`operatori_${aziendaId}`) || []
  );
  const [newOperatoreName, setNewOperatoreName] = useState("");

  // MACCHINARI
  const [macchinari, setMacchinari] = useState<Actor[]>(() =>
    loadItem<Actor[]>(`macchinari_${aziendaId}`) || []
  );
  const [newMacchinarioName, setNewMacchinarioName] = useState("");

  // CREA CREATOR
  const creaCreator = () => {
    const creator: Actor = {
      id: generateDid(),
      role: "creator",
      name: newCreatorName,
      aziendaId,
      seed: generateSeed(),
    };
    const updated = [...creators, creator];
    setCreators(updated);
    saveItem(`creators_${aziendaId}`, updated);
    setNewCreatorName("");
  };

  // CREA OPERATORE
  const creaOperatore = () => {
    const operatore: Actor = {
      id: generateDid(),
      role: "operatore",
      name: newOperatoreName,
      aziendaId,
      seed: generateSeed(),
    };
    const updated = [...operatori, operatore];
    setOperatori(updated);
    saveItem(`operatori_${aziendaId}`, updated);
    setNewOperatoreName("");
  };

  // CREA MACCHINARIO
  const creaMacchinario = () => {
    const macchinario: Actor = {
      id: generateDid(),
      role: "macchinario",
      name: newMacchinarioName,
      aziendaId,
      seed: generateSeed(),
    };
    const updated = [...macchinari, macchinario];
    setMacchinari(updated);
    saveItem(`macchinari_${aziendaId}`, updated);
    setNewMacchinarioName("");
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Azienda Dashboard</h1>
      <h2 className="font-semibold mb-2">Crea nuovo creator</h2>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Nome creator"
          value={newCreatorName}
          onChange={e => setNewCreatorName(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={creaCreator}
          disabled={!newCreatorName.trim()}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Crea
        </button>
      </div>

      <h2 className="font-semibold mb-2">Crea nuovo operatore</h2>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Nome operatore"
          value={newOperatoreName}
          onChange={e => setNewOperatoreName(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={creaOperatore}
          disabled={!newOperatoreName.trim()}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Crea
        </button>
      </div>

      <h2 className="font-semibold mb-2">Crea nuovo macchinario</h2>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Nome macchinario"
          value={newMacchinarioName}
          onChange={e => setNewMacchinarioName(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={creaMacchinario}
          disabled={!newMacchinarioName.trim()}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Crea
        </button>
      </div>

      <h2 className="text-lg mt-6 mb-2">Creator azienda</h2>
      <UserListWithSeed users={creators} />

      <h2 className="text-lg mt-6 mb-2">Operatori azienda</h2>
      <UserListWithSeed users={operatori} />

      <h2 className="text-lg mt-6 mb-2">Macchinari azienda</h2>
      <UserListWithSeed users={macchinari} />
    </div>
  );
}

// Componente riutilizzabile per mostrare utenti con seed
function UserListWithSeed({ users }: { users: Actor[] }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id} className="mb-2 border-b pb-2">
          <span className="font-semibold">{user.name}</span>
          <span className="text-xs text-gray-500 ml-2">({user.role})</span>
          <br />
          <span className="text-xs text-gray-400">DID: {user.id}</span>
          <details>
            <summary className="cursor-pointer text-blue-600">Mostra seed</summary>
            <code className="block bg-gray-100 px-2 py-1 rounded mb-1">{user.seed}</code>
            <button
              className="text-xs bg-blue-200 rounded px-2 py-1"
              onClick={() => navigator.clipboard.writeText(user.seed)}
            >
              Copia
            </button>
          </details>
        </li>
      ))}
    </ul>
  );
}
