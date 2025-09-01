import { useState } from "react";
import { Actor } from "../../../models/actor";
import { generateMnemonic24 } from "@/utils/cryptoUtils";

interface Props {
  onCreate: (macchinario: Actor) => void;
}

export default function MacchinarioForm({ onCreate }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    // ✅ seed coerente con l’Azienda; DID/EVM saranno calcolati dal parent
    const seed = generateMnemonic24();

    const macchinario = {
      name: trimmed,
      role: "macchinario",
      seed,        // <— il parent calcola did/evm/id
      vcIds: [],   // (manteniamo il campo se lo usi altrove)
    } as Actor;

    onCreate(macchinario);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome macchinario"
        className="border px-2 py-1 rounded"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-1 rounded"
        disabled={!name.trim()}
      >
        Aggiungi
      </button>
    </form>
  );
}
