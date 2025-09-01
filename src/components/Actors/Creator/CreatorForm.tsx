import { useState } from "react";
import { Actor } from "../../../models/actor";
import { generateMnemonic24 } from "@/utils/cryptoUtils";

interface Props {
  onCreate: (creator: Actor) => void;
}

export default function CreatorForm({ onCreate }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    // ✅ Uniformiamo la pipeline: generiamo la seed (24 parole) come per l’Azienda.
    // Il parent potrà derivare DID ed EVM address con le stesse funzioni già in uso.
    const seed = generateMnemonic24();

    onCreate({ name: trimmed, seed } as Actor); // gli altri campi (id, did, evmAddress, credits...) restano al parent
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome creator"
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
