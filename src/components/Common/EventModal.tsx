import React, { useState } from "react";

export default function EventModal({
  nodeIds,
  types,
  onSave,
  onCancel,
  bom
}: {
  nodeIds: string[];
  types: any[];
  onSave: (nodeIds: string[], event: { id: string; date: string; descr: string }) => void;
  onCancel: () => void;
  bom: any[];
}) {
  const [descr, setDescr] = useState("");
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descr.trim()) return alert("Inserisci una descrizione evento");
    onSave(nodeIds, { id: Math.random().toString(36), date: new Date().toISOString(), descr });
  }
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form className="bg-white p-8 rounded-xl w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold mb-4">Aggiungi evento</h2>
        <textarea
          className="border w-full rounded px-2 py-2 mb-4"
          value={descr}
          onChange={e => setDescr(e.target.value)}
          placeholder="Descrizione evento"
        />
        <div className="flex gap-3">
          <button type="submit" className="bg-green-700 text-white px-5 py-2 rounded-lg font-bold">Salva</button>
          <button type="button" className="bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-bold" onClick={onCancel}>Annulla</button>
        </div>
      </form>
    </div>
  );
}
