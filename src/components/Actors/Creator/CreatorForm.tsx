import React, { useState } from "react";
import { Actor } from "../../../models/actor";

interface Props {
  onCreate: (creator: Actor) => void;
}

export default function CreatorForm({ onCreate }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name } as Actor); // gli altri campi (id, seed, ecc.) gestiti dal parent
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
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
