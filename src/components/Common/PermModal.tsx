import React, { useState } from "react";

type Member = { did: string; name?: string; role?: string };

export default function PermModal({
  nodeIds,
  members,
  bom,
  onSave,
  onCancel
}: {
  nodeIds: string[];
  members: Member[];
  bom: any[];
  onSave: (nodeIds: string[], allowed: string[]) => void;
  onCancel: () => void;
}) {
  const [allowed, setAllowed] = useState<string[]>([]);

  function handleToggle(did: string) {
    setAllowed(arr =>
      arr.includes(did) ? arr.filter(x => x !== did) : [...arr, did]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(nodeIds, allowed);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form className="bg-white p-8 rounded-xl w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold mb-4">Gestisci permessi</h2>
        <div className="mb-4">
          {members.map(m => (
  <label key={m.did} className="block mb-2">
    <input
      type="checkbox"
      checked={allowed.includes(m.did)}
      onChange={() => handleToggle(m.did)}
      className="mr-2"
    />
    <span className="font-bold">
      {m.role === "Macchinario"
        ? (m.matricola || "(no matricola)")
        : (m.name || "(senza nome)")}
    </span>
    <span className="ml-2 text-xs text-gray-500 font-mono break-all">
      ({m.did})
    </span>
    {m.role && <span className="text-gray-400 text-xs ml-1">({m.role})</span>}
  </label>
        ))}
        </div>
        <div className="flex gap-3">
          <button type="submit" className="bg-blue-700 text-white px-5 py-2 rounded-lg font-bold">Salva</button>
          <button type="button" className="bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-bold" onClick={onCancel}>Annulla</button>
        </div>
      </form>
    </div>
  );
}
