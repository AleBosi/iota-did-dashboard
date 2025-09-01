import React from "react";

export default function AziendaList({
  aziende,
  onSelect,
  onDelete,
  getCredits,
  showDid,
}: {
  aziende: any[];
  onSelect: (a: any) => void;
  onDelete: (id: string) => void;
  getCredits?: (id: string) => number;
  showDid?: boolean;
}) {
  if (!aziende || aziende.length === 0) {
    return <div className="text-sm text-gray-400">Nessuna azienda presente</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="py-2 pr-4">Nome</th>
            <th className="py-2 pr-4">P.IVA</th>
            {showDid && <th className="py-2 pr-4">DID</th>}
            <th className="py-2 pr-4">Crediti</th>
            <th className="py-2 pr-4">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {aziende.map((a) => (
            <tr key={a.id} className="border-t border-gray-100">
              <td className="py-2 pr-4">{a.name}</td>
              <td className="py-2 pr-4">{a.legalInfo?.vat || "-"}</td>
              {showDid && (
                <td className="py-2 pr-4">
                  <code className="text-xs">{a.id}</code>
                </td>
              )}
              <td className="py-2 pr-4">
                {(getCredits ? getCredits(a.id) : 0).toLocaleString()}
              </td>
              <td className="py-2 pr-4 space-x-2">
                <button
                  className="rounded px-3 py-1 border hover:bg-gray-100"
                  onClick={() => onSelect(a)}
                >
                  Dettagli
                </button>
                <button
                  className="rounded px-3 py-1 border border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(a.id)}
                >
                  Elimina
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
