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
        {operatori.map((o) => {
          const did = o.did || "-";
          const addr = o.evmAddress;
          return (
            <li
              key={o.id}
              className="mb-2 border-b pb-2 cursor-pointer hover:bg-blue-50"
              onClick={() => setSelected(o)}
              title={did}
            >
              <span className="font-semibold">{o.name}</span>
              <span className="text-xs text-gray-500 ml-2">({o.role})</span>
              <span className="text-xs text-gray-400 ml-2">DID: {did}</span>
              {addr && (
                <span className="text-xs text-gray-400 ml-2">Addr: {addr}</span>
              )}
              <button
                className="ml-2 text-xs bg-blue-200 rounded px-2 py-1 disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  if (o.seed) onCopySeed?.(o.seed);
                }}
                disabled={!o.seed}
              >
                Copia seed
              </button>
            </li>
          );
        })}
      </ul>
      <div className="w-1/2">
        {selected && <OperatoreDetails operatore={selected} />}
      </div>
    </div>
  );
}
