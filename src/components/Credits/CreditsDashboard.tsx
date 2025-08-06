import { useState } from "react";

interface Member {
  id: string;
  name: string;
}

interface Props {
  credits: number;
  role: "admin" | "azienda" | "operatore" | "macchinario";
  members?: Member[]; // lista aziende (per admin) o operatori/macchinari (per azienda)
  onAssignCredits?: (to: string, qty: number) => void;
}

export default function CreditsDashboard({
  credits,
  role,
  members = [],
  onAssignCredits,
}: Props) {
  const [qty, setQty] = useState(0);
  const [selected, setSelected] = useState("");

  return (
    <div className="border rounded p-4 bg-gray-50 mb-4">
      <div className="mb-2">
        <b>Crediti disponibili:</b>{" "}
        <span className="text-xl">{credits}</span>
      </div>
      {(role === "admin" || role === "azienda") && members.length > 0 && (
        <div className="flex gap-2 items-center">
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Seleziona destinatario</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={e => setQty(parseInt(e.target.value) || 0)}
            className="border px-2 py-1 rounded w-20"
            placeholder="Crediti"
          />
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            disabled={qty <= 0 || !selected}
            onClick={() => {
              if (onAssignCredits && selected) onAssignCredits(selected, qty);
              setQty(0);
              setSelected("");
            }}
          >
            Assegna
          </button>
        </div>
      )}
      {(role === "operatore" || role === "macchinario") && (
        <div className="text-sm text-gray-600 mt-2">
          Solo visualizzazione saldo.
        </div>
      )}
    </div>
  );
}
