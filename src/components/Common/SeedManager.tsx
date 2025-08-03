import React, { useState } from "react";

interface Props {
  seed: string;
  onReset?: () => void;
  onExport?: () => void;
  onImport?: (newSeed: string) => void;
}

export default function SeedManager({ seed, onReset, onExport, onImport }: Props) {
  const [importValue, setImportValue] = useState("");

  return (
    <div className="border rounded p-4 bg-gray-50 mb-4">
      <div className="mb-2">
        <b>Seed:</b> <code>{seed}</code>
      </div>
      <button className="bg-red-100 text-red-800 px-3 py-1 rounded mr-2" onClick={onReset}>
        Reset
      </button>
      <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded mr-2" onClick={onExport}>
        Esporta
      </button>
      <input
        className="border px-2 py-1 rounded w-48 mr-2"
        value={importValue}
        onChange={e => setImportValue(e.target.value)}
        placeholder="Importa nuovo seed"
      />
      <button className="bg-green-100 text-green-800 px-3 py-1 rounded" onClick={() => onImport && onImport(importValue)}>
        Importa
      </button>
    </div>
  );
}
