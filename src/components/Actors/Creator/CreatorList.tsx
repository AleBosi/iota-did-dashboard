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
        {creators.map((c) => {
          const did = c.did || "-";
          const addr = c.evmAddress;
          return (
            <li
              key={c.id}
              className="mb-2 border-b pb-2 cursor-pointer hover:bg-blue-50"
              onClick={() => setSelected(c)}
              title={did}
            >
              <span className="font-semibold">{c.name}</span>
              <span className="text-xs text-gray-500 ml-2">({c.role})</span>
              <span className="text-xs text-gray-400 ml-2">DID: {did}</span>
              {addr && (
                <span className="text-xs text-gray-400 ml-2">Addr: {addr}</span>
              )}
              <button
                className="ml-2 text-xs bg-blue-200 rounded px-2 py-1 disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  if (c.seed) onCopySeed?.(c.seed);
                }}
                disabled={!c.seed}
              >
                Copia seed
              </button>
            </li>
          );
        })}
      </ul>
      <div className="w-1/2">
        {selected && <CreatorDetails creator={selected} />}
      </div>
    </div>
  );
}
