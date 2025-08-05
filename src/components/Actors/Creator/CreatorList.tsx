import { useState } from "react";
import { Actor } from "../../../models/actor";
import CreatorDetails from "./CreatorDetails";

interface Props {
  creators: Actor[];
  onCopySeed?: (seed: string) => void;
}

export default function CreatorList({ creators, onCopySeed }: Props) {
  const [selected, setSelected] = useState<Actor | null>(null);

  return (
    <div className="flex gap-8">
      <ul className="w-1/2">
        {creators.map(c => (
          <li
            key={c.id}
            className="mb-2 border-b pb-2 cursor-pointer hover:bg-blue-50"
            onClick={() => setSelected(c)}
          >
            <span className="font-semibold">{c.name}</span>
            <span className="text-xs text-gray-500 ml-2">({c.role})</span>
            <span className="text-xs text-gray-400 ml-2">ID: {c.id}</span>
            <span className="text-xs text-gray-400 ml-2">DID: {c.did}</span>
            <button
              className="ml-2 text-xs bg-blue-200 rounded px-2 py-1"
              onClick={e => { e.stopPropagation(); onCopySeed?.(c.seed || ""); }}
            >
              Copia seed
            </button>
          </li>
        ))}
      </ul>
      <div className="w-1/2">
        {selected && <CreatorDetails creator={selected} />}
      </div>
    </div>
  );
}
