// src/components/Events/EventHistory.tsx
import React, { useMemo } from "react";
import type { Event as UiEvent } from "../../models/event";
import { useData } from "../../state/DataContext";

type HistoryEntry =
  | { ts?: string; type: "create"; actorDid?: string | null; note?: string | null }
  | { ts?: string; type: "status"; status?: "pending" | "in_progress" | "completed" | "done" | "cancelled"; actorDid?: string | null; note?: string | null }
  | { ts?: string; type: "note"; authorDid?: string | null; text?: string | null }
  | { ts?: string; type?: string; [k: string]: any }; // tollerante a voci legacy

type Props =
  | { event?: UiEvent | null; eventId?: never; title?: string }
  | { event?: never; eventId?: string; title?: string };

/**
 * EventHistory (read-only, null-safe)
 * - Puoi passare `event` o `eventId`; se nessuno dei due è disponibile, mostra un placeholder.
 * - Accetta voci `history` anche legacy (campi opzionali).
 * - NON modifica mai l’evento: le append sono gestite nel DataContext.
 */
export default function EventHistory(props: Props) {
  const { events } = useData();

  const event: UiEvent | undefined = useMemo(() => {
    if (props.event) return props.event as UiEvent;
    if (props.eventId) return events.find((e: any) => e.id === props.eventId);
    return undefined;
  }, [props, events]);

  const history: HistoryEntry[] = useMemo(() => {
    const raw = (event as any)?.history;
    return Array.isArray(raw) ? (raw as HistoryEntry[]) : [];
  }, [event]);

  const title = props.title ?? "Storico evento";

  if (!event) {
    return (
      <div className="border rounded p-4 bg-gray-50">
        <div className="font-semibold mb-1">{title}</div>
        <div className="text-sm text-muted-foreground">Nessun evento selezionato.</div>
      </div>
    );
  }

  return (
    <div className="border rounded p-4 bg-gray-50">
      <div className="font-semibold mb-2">{title}</div>

      {history.length === 0 ? (
        <div className="text-sm text-muted-foreground">Nessuna voce nello storico.</div>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {history
            .slice()
            .reverse() // più recente in alto
            .map((h, i) => {
              const key = `${h?.ts || i}-${h?.type || "entry"}`;
              return (
                <li key={key} className="bg-white/70 px-3 py-2 rounded border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{labelFor(h)}</span>
                    <span className="text-xs text-muted-foreground">{fmt(h.ts)}</span>
                  </div>

                  {/* Dettagli */}
                  {renderDetails(h)}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}

function fmt(ts?: string) {
  if (!ts) return "-";
  const d = new Date(ts);
  return isNaN(d.getTime()) ? String(ts) : d.toLocaleString();
}

function shortDid(did?: string | null) {
  if (!did) return "";
  const s = String(did);
  return s.length > 22 ? `${s.slice(0, 10)}…${s.slice(-8)}` : s;
}

function labelFor(h: HistoryEntry) {
  const t = (h.type || "").toLowerCase();
  if (t === "create") return "Creazione";
  if (t === "status") {
    const s = (h as any).status || "";
    const sl = String(s).toLowerCase();
    if (sl === "in_progress") return "Stato: In esecuzione";
    if (sl === "completed" || sl === "done") return "Stato: Completato";
    if (sl === "pending") return "Stato: In attesa";
    if (sl === "cancelled") return "Stato: Annullato";
    return `Stato: ${s || "-"}`;
  }
  if (t === "note") return "Nota";
  if (t === "telemetry") return "Telemetria";
  return h.type || "Evento";
}

function renderDetails(h: HistoryEntry) {
  const t = (h.type || "").toLowerCase();

  if (t === "create") {
    return (
      <div className="mt-1 text-foreground/90">
        {h.note ? h.note : <span className="text-muted-foreground">Evento creato</span>}
        {h.actorDid && (
          <span className="ml-2 text-xs text-muted-foreground">({shortDid(h.actorDid)})</span>
        )}
      </div>
    );
  }

  if (t === "status") {
    return (
      <div className="mt-1 text-foreground/90">
        {(h as any).note && <span>{(h as any).note}</span>}
        {(h as any).actorDid && (
          <span className="ml-2 text-xs text-muted-foreground">
            ({shortDid((h as any).actorDid)})
          </span>
        )}
      </div>
    );
  }

  if (t === "note") {
    return (
      <div className="mt-1 text-foreground/90">
        <span>{(h as any).text || (h as any).note || ""}</span>
        {(h as any).authorDid && (
          <span className="ml-2 text-xs text-muted-foreground">
            ({shortDid((h as any).authorDid)})
          </span>
        )}
      </div>
    );
  }

  // fallback/legacy
  const text = (h as any).text || (h as any).note;
  const who = (h as any).actorDid || (h as any).authorDid;
  return (
    <div className="mt-1 text-foreground/90">
      {text && <span>{text}</span>}
      {who && (
        <span className="ml-2 text-xs text-muted-foreground">({shortDid(who)})</span>
      )}
    </div>
  );
}
