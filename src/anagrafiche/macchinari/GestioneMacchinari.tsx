// src/anagrafiche/macchinari/GestioneMacchinari.tsx

import React, { useState } from "react";
import { createMacchinario } from "./MacchinarioFactory";
import { loadMacchinari, saveMacchinari } from "./macchinarioStorage";
import MacchinarioForm from "./MacchinarioForm";
import MacchinarioList from "./MacchinarioList";

type Macchinario = ReturnType<typeof createMacchinario>;

// Placeholder per la modale VC
function ModalAggiungiVC({ macchinario, onClose }: { macchinario: Macchinario; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl min-w-[320px] shadow-xl">
        <h2 className="text-lg font-bold mb-2">Aggiungi Verifiable Credential</h2>
        <div className="mb-2 text-sm font-mono break-all">DID: {macchinario.did}</div>
        {/* Qui va il tuo form custom VC */}
        <div className="mb-3 text-gray-500">Qui potrai integrare la logica di emissione VC!</div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={onClose}>Chiudi</button>
      </div>
    </div>
  );
}

export default function GestioneMacchinari() {
  const [macchinari, setMacchinari] = useState<Macchinario[]>(() => loadMacchinari());
  const [editing, setEditing] = useState<Macchinario | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [vcModal, setVcModal] = useState<Macchinario | null>(null);

  function handleSave(m: Macchinario) {
    let updated: Macchinario[];
    if (m.id && macchinari.find(x => x.id === m.id)) {
      updated = macchinari.map(x => x.id === m.id ? m : x);
    } else {
      m.id = Date.now().toString();
      updated = [...macchinari, m];
    }
    setMacchinari(updated);
    saveMacchinari(updated);
    setEditing(null);
    setShowForm(false);
  }

  function handleEdit(m: Macchinario) {
    setEditing(m);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (!window.confirm("Eliminare questo macchinario?")) return;
    const updated = macchinari.filter(m => m.id !== id);
    setMacchinari(updated);
    saveMacchinari(updated);
  }

  function handleAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function handleAggiungiVC(m: Macchinario) {
    setVcModal(m);
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Gestione Macchinari</h2>
      <button className="mb-4 bg-green-600 text-white px-4 py-2 rounded" onClick={handleAdd}>+ Nuovo macchinario</button>
      {showForm && (
        <MacchinarioForm
          initial={editing || undefined}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
      <MacchinarioList
        macchinari={macchinari}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAggiungiVC={handleAggiungiVC}
      />
      {vcModal && (
        <ModalAggiungiVC macchinario={vcModal} onClose={() => setVcModal(null)} />
      )}
    </div>
  );
}
