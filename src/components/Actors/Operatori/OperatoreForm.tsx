import { useState } from "react";
import { Actor } from "../../../models/actor";
import { generateMnemonic24 } from "@/utils/cryptoUtils";

interface Props {
  onCreate: (operatore: Actor) => void;
}

export default function OperatoreForm({ onCreate }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    // ✅ stessa pipeline dell’Azienda: generiamo la seed BIP-39 (24 parole)
    // DID ed EVM address verranno derivati dal parent con le stesse funzioni già usate per l’azienda.
    const seed = generateMnemonic24();

    const actor = {
      name: trimmed,
      role: "operatore",
      seed,                // <— il parent calcola did/evm/id
    } as Actor;

    onCreate(actor);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome operatore"
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
