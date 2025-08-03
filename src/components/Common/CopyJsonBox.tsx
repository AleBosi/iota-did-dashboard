import React, { useState } from "react";

interface Props {
  label?: string;
  json: any;
}

export default function CopyJsonBox({ label = "JSON", json }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="relative my-2">
      <pre className="bg-gray-100 rounded p-2 overflow-auto text-xs max-h-64">{JSON.stringify(json, null, 2)}</pre>
      <button
        className="absolute top-2 right-2 text-xs bg-blue-200 rounded px-2 py-1"
        onClick={handleCopy}
      >
        {copied ? "Copiato!" : `Copia ${label}`}
      </button>
    </div>
  );
}
