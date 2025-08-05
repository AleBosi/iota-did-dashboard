import { useState } from "react";
import { Actor } from "../../../models/actor";
import MacchinarioDetails from "./MacchinarioDetails";

interface Props {
  macchinari: Actor[];
  onCopySeed?: (seed: string) => void;
}

export default function MacchinarioList({ macchinari, onCopySeed }: Props) {
  const [selected, setSelected] = useState<Actor | null>(null);

  return (
    <div className="flex gap-8">
      <ul className="w-1/2">
        {macchinari.map(m => (
          <li
            key={m.id}
            className="mb-2 border-b pb-2 cursor-pointer hover:bg-blue-50"
            onClick={() => setSelected(m)}
          >
            <span className="font-semibold">{m.name}</span>
            <span className="text-xs text-gray-500 ml-2">({m.role})</span>
            <span className="text-xs text-gray-400 ml-2">DID: {m.did}</span>
            <button
              className="ml-2 text-xs bg-blue-200 rounded px-2 py-1"
              onClick={e => { e.stopPropagation(); onCopySeed?.(m.seed || ""); }}
            >
              Copia seed
            </button>
          </li>
        ))}
      </ul>
      <div className="w-1/2">
        {selected && <MacchinarioDetails macchinario={selected} />}
      </div>
    </div>
  );
}
