import React, { useState, useRef } from "react";
import { genUID } from "./utilsVC";
import { Button } from "@/components/ui/button";

export default function ImportPage({
  onImport,
  did,
}: {
  onImport: (vc: any) => void;
  did: string;
}) {
  const [text, setText] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleTextImport() {
    try {
      let json = JSON.parse(text);
      if (!json._uid) json._uid = genUID();
      await onImport(json);
      setText("");
      setFileError("");
      alert("Import riuscito!");
    } catch {
      setFileError("Il testo inserito non è un JSON valido!");
    }
  }

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function (ev) {
      try {
        let json = JSON.parse(ev.target?.result as string);
        if (!json._uid) json._uid = genUID();
        await onImport(json);
        setText("");
        setFileError("");
        alert("Import riuscito!");
      } catch {
        setFileError("Il file non contiene un JSON valido!");
      }
    };
    reader.readAsText(file);
  }

  function openFileDialog() {
    fileInputRef.current?.click();
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6">
        Importa Verifiable Credential (VC) JSON
      </h1>

      <div className="mb-6">
        <p className="font-semibold mb-2">Importa da file:</p>
        <Button onClick={openFileDialog} className="mr-4">
          Importa file JSON
        </Button>
        <input
          ref={fileInputRef}
          id="json-file"
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileImport}
        />
      </div>

      <div className="mb-6">
        <p className="font-semibold mb-2">Incolla qui il JSON:</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Incolla qui il contenuto JSON della tua VC"
          className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md bg-gray-100 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={handleTextImport} variant="outline" className="mt-4">
          Importa da testo
        </Button>
        {fileError && (
          <div className="text-red-500 mt-2 font-medium">{fileError}</div>
        )}
      </div>
    </div>
  );
}
