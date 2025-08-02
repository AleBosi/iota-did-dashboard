import React from "react";
import { getUserHistory } from "./creditUtils";

export default function UserCreditsHistory({ did }: { did: string }) {
  const events = getUserHistory(did).slice().reverse();

  if (!events.length) {
    return (
      <div className="text-gray-600 text-sm italic">
        Nessun movimento crediti.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-3">Storico crediti</h2>
      <ul className="space-y-2 font-mono text-sm text-gray-800">
        {events.map((e, i) => (
          <li
            key={i}
            className="bg-gray-100 rounded-md px-4 py-2 shadow-sm border border-gray-200 flex items-center justify-between"
          >
            <div>
              <span className="text-gray-500 mr-2">
                [{new Date(e.data).toLocaleString()}]
              </span>
              {e.descrizione}
              <span className="ml-2 text-xs text-gray-400">({e.delta})</span>
            </div>
            <div
              className={`text-lg ${
                e.tipo === "assegnazione" ? "text-green-600" : "text-red-500"
              }`}
              title={e.tipo === "assegnazione" ? "Credito assegnato" : "Credito speso"}
            >
              {e.tipo === "assegnazione" ? "➕" : "➖"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
