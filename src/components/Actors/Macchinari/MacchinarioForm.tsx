import { useState } from "react";
import { Actor } from "../../../models/actor";

interface Props {
  onCreate: (macchinario: Actor) => void;
}

export default function MacchinarioForm({ onCreate }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Genera un did temporaneo (puoi sostituire con generateDid() se vuoi)
    const did = `did:iota:evm:macchinario:${Date.now()}`;
    const macchinario: Actor = {
      id: did,
      did,
      name: name.trim(),
      role: "macchinario",
      vcIds: [],
    };

    onCreate(macchinario);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
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
