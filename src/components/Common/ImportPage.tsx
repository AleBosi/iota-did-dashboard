import React, { useRef } from "react";

interface Props {
  onImport: (json: any) => void;
  label?: string;
}

export default function ImportPage({ onImport, label = "Importa JSON" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        onImport(json);
      } catch (err) {
        alert("Errore nel file JSON");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <input
        type="file"
        accept=".json"
        ref={fileRef}
        onChange={handleImport}
        className="hidden"
      />
      <button className="bg-blue-200 text-blue-900 px-3 py-1 rounded" onClick={() => fileRef.current?.click()}>
        {label}
      </button>
    </div>
  );
}
