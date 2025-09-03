import React, { useMemo, useState } from "react";
import type { Event as UiEvent } from "../../models/event";
import { useData } from "../../state/DataContext";
import { useUser } from "../../contexts/UserContext";

interface Props {
  event: UiEvent;
}

/**
 * EventAction.tsx
 * - Component UI-only per cambiare lo stato di un evento.
 * - Usa solo updateAssignmentStatus del DataContext.
 * - Non contiene logica dominio/side-storage.
 */
export default function EventAction({ event }: Props) {
  const { updateAssignmentStatus, notify } = useData() as any;
  const { currentActor } = useUser();
  const [note, setNote] = useState("");

  const status = (event as any).status ?? ((event as any).done ? "completed" : "pending");
  const canStart = status === "pending";
  const canComplete = status === "in_progress";

  const title = useMemo(() => event?.type || event?.title || event?.id, [event]);

  const act = (next: "in_progress" | "completed") => {
    if (!currentActor?.did) {
      notify?.("Nessun actor autenticato.", "error");
      return;
    }
    updateAssignmentStatus(event.id, next, {
      actorDid: currentActor.did,
      note: note || undefined,
    });
    setNote("");
  };

  return (
    <div className="flex items-start gap-3 my-3 p-3 border rounded-xl bg-white">
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{title}</div>
        {event?.description && (
          <div className="text-sm text-gray-600">{event.description}</div>
        )}

        <div className="mt-2 text-xs">
          Stato:{" "}
          <b className={
            status === "completed" ? "text-green-600" :
            status === "in_progress" ? "text-blue-600" : "text-gray-600"
          }>
            {status}
          </b>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <input
            className="border px-2 py-1 rounded-xl text-sm"
            placeholder="Nota (opzionale)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            type="button"
            className="px-3 py-1 rounded-xl border disabled:opacity-40"
            disabled={!canStart}
            onClick={() => act("in_progress")}
            title="Avvia lavorazione"
          >
            Avvia
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded-xl border disabled:opacity-40"
            disabled={!canComplete}
            onClick={() => act("completed")}
            title="Segna come completato"
          >
            Completa
          </button>
        </div>
      </div>
    </div>
  );
}
