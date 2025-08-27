import React from "react";

export default function AziendaDetails({
  azienda,
  credits = 0,
  onUpdate,
  onDelete,
  showSecrets,
}: {
  azienda: any;
  credits?: number;
  onUpdate: (a: any) => void;
  onDelete: () => void;
  showSecrets?: boolean;
}) {
  const a = azienda || {};
  const li = a.legalInfo || {};

  const copy = (txt: string) => {
    try {
      navigator.clipboard.writeText(txt);
      alert("Copiato negli appunti");
    } catch {}
  };

  return (
    <div>
      <div className="space-y-1 text-sm">
        <div><strong>Ragione sociale:</strong> {a.name}</div>
        <div><strong>DID:</strong> <code className="text-xs">{a.id}</code>{" "}
          <button className="text-blue-600 underline" onClick={() => copy(a.id)}>Copia</button>
        </div>
        {showSecrets && a.seed && (
          <div><strong>Seed:</strong> <code className="text-xs">{a.seed}</code>{" "}
            <button className="text-blue-600 underline" onClick={() => copy(a.seed)}>Copia</button>
          </div>
        )}
        <div><strong>P.IVA:</strong> {li.vat || "-"}</div>
        <div><strong>LEI:</strong> {li.lei || "-"}</div>
        <div><strong>Indirizzo:</strong> {li.address || "-"}</div>
        <div><strong>Email:</strong> {li.email || "-"}</div>
        <div><strong>Nazione:</strong> {li.country || "-"}</div>
        <div><strong>Crediti azienda:</strong> {credits.toLocaleString()}</div>
        <div><strong>Creato il:</strong> {a.createdAt}</div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="rounded px-3 py-1 border hover:bg-gray-100"
          onClick={() => onUpdate({ ...a })}
        >
          Salva modifiche
        </button>
        <button
          className="rounded px-3 py-1 border border-red-300 text-red-700 hover:bg-red-50"
          onClick={onDelete}
        >
          Elimina
        </button>
      </div>
    </div>
  );
}
