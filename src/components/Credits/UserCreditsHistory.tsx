import React, { useState } from "react";

export interface CreditEvent {
  id: string;
  date: string;
  amount: number;
  type: "add" | "spend";
  description?: string;
}

interface Props {
  history: CreditEvent[];
  onSelect?: (credit: CreditEvent) => void;
}

export default function UserCreditsHistory({ history, onSelect }: Props) {
  const [selected, setSelected] = useState<CreditEvent | null>(null);

  return (
    <div className="flex gap-8">
      <ul className="w-1/2">
        {history.map(h => (
          <li
            key={h.id}
            className={`mb-2 border-b pb-2 cursor-pointer hover:bg-blue-50`}
            onClick={() => {
              setSelected(h);
              onSelect?.(h);
            }}
          >
            <span className="font-semibold">{h.type === "add" ? "+" : "-"}{h.amount}</span>
            <span className="ml-2">{h.description}</span>
            <span className="ml-2 text-xs text-gray-400">{h.date}</span>
          </li>
        ))}
      </ul>
      <div className="w-1/2">
        {selected && <CreditEventDetails credit={selected} />}
      </div>
    </div>
  );
}

// CreditEventDetails (interno allo stesso file, se vuoi):
function CreditEventDetails({ credit }: { credit: CreditEvent }) {
  if (!credit) return null;
  return (
    <div className="border rounded p-4 bg-gray-50 mb-2">
      <div><b>ID:</b> {credit.id}</div>
      <div><b>Tipo:</b> {credit.type === "add" ? "Ricarica" : "Spesa"}</div>
      <div><b>Importo:</b> {credit.amount}</div>
      <div><b>Data:</b> {credit.date}</div>
      {credit.description && <div><b>Note:</b> {credit.description}</div>}
    </div>
  );
}
