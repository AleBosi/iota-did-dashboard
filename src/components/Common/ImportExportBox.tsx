import React, { useRef } from "react";

interface Props {
  label: string;
  exportData: any;
  onImport: (data: any) => void;
}

export default function ImportExportBox({ label, exportData, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${label}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        onImport(json);
      } catch {
        alert("File non valido!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2 items-center mb-4">
      <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={handleExport}>
        Esporta {label}
      </button>
      <input
        type="file"
        accept=".json"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleImport}
      />
      <button className="bg-gray-300 px-4 py-1 rounded" onClick={() => fileInputRef.current?.click()}>
        Importa {label}
      </button>
    </div>
  );
}
