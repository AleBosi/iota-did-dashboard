import { useState } from "react";
import { Actor } from "../../../models/actor";
import OperatoreDetails from "./OperatoreDetails";

interface Props {
  operatori: Actor[];
  onCopySeed?: (seed: string) => void;
}

export default function OperatoreList({ operatori, onCopySeed }: Props) {
  const [selected, setSelected] = useState<Actor | null>(null);

  return (
    <div className="flex gap-8">
      <ul className="w-1/2">
        {operatori.map(o => (
          <li
            key={o.id}
            className="mb-2 border-b pb-2 cursor-pointer hover:bg-blue-50"
            onClick={() => setSelected(o)}
          >
            <span className="font-semibold">{o.name}</span>
            <span className="text-xs text-gray-500 ml-2">({o.role})</span>
            <span className="text-xs text-gray-400 ml-2">
              DID: {o.did || o.id}
            </span>
            <button
              className="ml-2 text-xs bg-blue-200 rounded px-2 py-1"
              onClick={e => { e.stopPropagation(); onCopySeed?.(o.seed || ""); }}
            >
              Copia seed
            </button>
          </li>
        ))}
      </ul>
      <div className="w-1/2">
        {selected && <OperatoreDetails operatore={selected} />}
      </div>
    </div>
  );
}
