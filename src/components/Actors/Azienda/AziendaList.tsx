import React from "react";
import { Azienda } from "../../../models/azienda";

interface Props {
  aziende: Azienda[];
  onSelect?: (azienda: Azienda) => void;
}

export default function AziendaList({ aziende, onSelect }: Props) {
  return (
    <ul>
      {aziende.map(a => (
        <li key={a.id} className="mb-2 border-b pb-2 cursor-pointer" onClick={() => onSelect?.(a)}>
          <span className="font-semibold">{a.name}</span>
          <span className="text-xs text-gray-500 ml-2">{a.legalInfo?.vat}</span>
          <span className="text-xs text-gray-400 ml-2">(DID: {a.id})</span>
        </li>
      ))}
    </ul>
  );
}
