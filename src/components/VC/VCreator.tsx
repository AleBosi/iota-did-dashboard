import React, { useState } from "react";

interface VCData {
  subject: string;
  type: string;
  value: string;
}

interface Props {
  onCreate: (vc: VCData) => void;
}

export default function VCCreator({ onCreate }: Props) {
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !type || !value) return;
    onCreate({ subject, type, value });
    setSubject("");
    setType("");
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
      <input
        value={subject}
        onChange={e => setSubject(e.target.value)}
        placeholder="Subject (DID o nome)"
        className="border px-2 py-1 rounded"
      />
      <input
        value={type}
        onChange={e => setType(e.target.value)}
        placeholder="Tipo credential (es: Abilitazione)"
        className="border px-2 py-1 rounded"
      />
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Valore/Attributo"
        className="border px-2 py-1 rounded"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-1 rounded"
        disabled={!subject || !type || !value}
      >
        Crea VC
      </button>
    </form>
  );
}
