import React from "react";
import type { Event as UiEvent } from "../../models/event";

type HistoryEntry =
  | { ts: string; type: "create"; actorDid?: string | null; note?: string | null }
  | { ts: string; type: "status"; status: "pending" | "in_progress" | "completed"; actorDid?: string | null; note?: string | null }
  | { ts: string; type: "note"; authorDid?: string; text: string };

export default function EventHistory({ event }: { event: UiEvent }) {
  const history: HistoryEntry[] = Array.isArray((event as any).history)
    ? (event as any).history
    : [];

  if (!event) return null;

  const fmt = (ts?: string) => {
    if (!ts) return "";
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return String(ts);
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">Storico evento</h3>

      {history.length === 0 ? (
        <div className="text-sm text-gray-500">Nessuna voce nello storico.</div>
      ) : (
        <ul className="mt-2 space-y-2">
          {history.map((h: any, i: number) => {
            const key = `${h?.ts || i}-${h?.type || "entry"}`;
            return (
              <li key={key} className="bg-gray-50 px-3 py-2 rounded border text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {h.type === "create" && "Creato"}
                    {h.type === "status" && `Stato → ${h.status}`}
                    {h.type === "note" && "Nota"}
                  </span>
                  <span className="text-xs text-gray-500">{fmt(h.ts)}</span>
                </div>

                {/* Dettagli voce */}
                {h.type === "create" && (
                  <div className="mt-1 text-gray-700">
                    {h.note ? <span>{h.note}</span> : <span className="text-gray-500">Evento creato</span>}
                    {h.actorDid && (
                      <span className="ml-2 text-xs text-gray-500">({h.actorDid})</span>
                    )}
                  </div>
                )}

                {h.type === "status" && (
                  <div className="mt-1 text-gray-700">
                    {h.note && <span>{h.note}</span>}
                    {h.actorDid && (
                      <span className="ml-2 text-xs text-gray-500">({h.actorDid})</span>
                    )}
                  </div>
                )}

                {h.type === "note" && (
                  <div className="mt-1 text-gray-700">
                    <span>{h.text}</span>
                    {h.authorDid && (
                      <span className="ml-2 text-xs text-gray-500">({h.authorDid})</span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
