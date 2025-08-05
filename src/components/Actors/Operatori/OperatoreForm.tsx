import { useState } from "react";
import { Actor } from "../../../models/actor";

interface Props {
  onCreate: (operatore: Actor) => void;
}

// Funzione mock per generare un DID coerente (sostituisci con la tua se serve)
function generateDid(name: string) {
  return "did:iota:evm:operatore:" + name.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
}

export default function OperatoreForm({ onCreate }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const did = generateDid(name);
    const actor: Actor = {
      id: did,
      did,
      name: name.trim(),
      role: "operatore"
    };
    onCreate(actor);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
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
