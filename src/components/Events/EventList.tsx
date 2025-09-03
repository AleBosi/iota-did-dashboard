import React, { useMemo, useState } from "react";
import { useData } from "../../state/DataContext";
import { useUser } from "../../contexts/UserContext";
import EventDetails from "./EventDetails";

export default function EventList() {
  const { currentActor } = useUser();
  const { events = [], actors = [], getAssignmentsForOperator, getAssignmentsForMachine } = useData() as any;
  const [selected, setSelected] = useState<any | null>(null);

  // Scegli la sorgente in base al ruolo
  const rows = useMemo(() => {
    if (!currentActor?.did) return [];
    const role = (currentActor.role || "").toLowerCase();

    if (role === "operatore") {
      return getAssignmentsForOperator?.(currentActor.did) ?? [];
    }
    if (role === "macchinario") {
      return getAssignmentsForMachine?.(currentActor.did) ?? [];
    }
    // Creator/Azienda/Admin: vista completa (BI / supervisione)
    return events;
  }, [currentActor?.did, currentActor?.role, events, getAssignmentsForOperator, getAssignmentsForMachine]);

  // helper di visualizzazione
  const findActorById = (id?: string) => actors.find((a: any) => a.id === id || a.did === id);
  const displayWhen = (ev: any) => {
    const d = ev?.date || ev?.createdAt;
    try {
      return d ? new Date(d).toLocaleString() : "";
    } catch {
      return String(d ?? "");
    }
  };

  const title = (ev: any) => ev?.type || ev?.title || ev?.id;
  const status = (ev: any) => ev?.status || (ev?.done ? "completed" : "pending");

  // campi assegnazione (preferisci DID moderni, poi alias legacy)
  const getOperatorId = (ev: any) =>
    ev?.assignedOperatorDid || ev?.operatorDid || ev?.assignedToDid || ev?.operatoreId || null;

  const getMachineId = (ev: any) =>
    ev?.assignedMachineDid || ev?.machineDid || (ev?.assignedRole === "machine" ? ev?.assignedToDid : null) || null;

  return (
    <div className="flex gap-8">
      <ul className="w-1/2">
        {rows.map((ev: any) => {
          const opId = getOperatorId(ev);
          const mcId = getMachineId(ev);

          const opName = opId ? (findActorById(opId)?.name ?? opId) : null;
          const mcName = mcId ? (findActorById(mcId)?.name ?? mcId) : null;

          const isDone = status(ev) === "completed";

          return (
            <li
              key={ev.id ?? `${title(ev)}-${displayWhen(ev)}`}
              className={`border-b py-2 cursor-pointer hover:bg-blue-50 px-2 rounded-lg ${isDone ? "line-through text-gray-400" : ""}`}
              onClick={() => setSelected(ev)}
            >
              <span className="font-semibold">{title(ev)}</span>
              {ev.bomComponent && <span className="ml-2 text-gray-600">[{ev.bomComponent}]</span>}
              {ev.description && <span className="ml-2">{ev.description}</span>}

              {opName && (
                <span className="ml-2 text-xs text-blue-800" title={String(opId)}>
                  👤 {opName}
                </span>
              )}
              {mcName && (
                <span className="ml-2 text-xs text-purple-800" title={String(mcId)}>
                  🏭 {mcName}
                </span>
              )}

              <span className="ml-2 text-xs text-gray-400">{displayWhen(ev)}</span>
              {isDone && <span className="ml-2 text-green-600 font-bold">✓</span>}
            </li>
          );
        })}
      </ul>

      <div className="w-1/2">
        {/* Compat layer: EventDetails verrà rifattorizzato; intanto gli passiamo gli actors dal DataContext */}
        {selected && <EventDetails event={selected} actors={actors} />}
      </div>
    </div>
  );
}
