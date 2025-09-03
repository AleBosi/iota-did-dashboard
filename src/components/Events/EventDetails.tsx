import React, { useMemo } from "react";
import type { Event as UiEvent } from "../../models/event";
import { useData } from "../../state/DataContext";

interface Props {
  event: UiEvent;
}

export default function EventDetails({ event }: Props) {
  const { actors = [] } = useData() as any;
  if (!event) return null;

  // ---- helpers ----
  const status: "pending" | "in_progress" | "completed" =
    (event as any).status ?? ((event as any).done ? "completed" : "pending");

  const when = useMemo(() => {
    const d = (event as any).date || (event as any).createdAt;
    try {
      return d ? new Date(d).toLocaleString() : "";
    } catch {
      return String(d ?? "");
    }
  }, [event]);

  // preferisci DID moderni; mantieni alias legacy come fallback
  const operatorDid =
    (event as any).assignedOperatorDid ||
    (event as any).operatorDid ||
    (event as any).assignedToDid ||
    (event as any).operatoreId ||
    null;

  const machineDid =
    (event as any).assignedMachineDid ||
    (event as any).machineDid ||
    ((event as any).assignedRole === "machine" ? (event as any).assignedToDid : null) ||
    (event as any).macchinarioId ||
    null;

  const findActorByDidOrId = (id?: string) =>
    actors.find((a: any) => a.did === id || a.id === id);

  const op = operatorDid ? findActorByDidOrId(operatorDid) : null;
  const mc = machineDid ? findActorByDidOrId(machineDid) : null;

  const creatorDid = (event as any).creatorDid || (event as any).creatorId;

  // VC refs (read-only, possono non esistere)
  const vcIds: string[] = Array.isArray((event as any).vcIds)
    ? (event as any).vcIds
    : ((event as any).vcId ? [(event as any).vcId] : []);

  return (
    <div className="border rounded-xl p-4 bg-gray-50 mb-2 space-y-2">
      <div><b>ID evento:</b> {(event as any).id}</div>
      <div><b>Tipo:</b> {(event as any).type || (event as any).title}</div>
      {event?.description && <div><b>Descrizione:</b> {(event as any).description}</div>}
      {(event as any).productId && <div><b>Prodotto:</b> {(event as any).productId}</div>}
      {(event as any).bomComponent && <div><b>Componente BOM:</b> {(event as any).bomComponent}</div>}

      <div>
        <b>Operatore:</b>{" "}
        {op ? (
          <>
            {op.name}{" "}
            <span className="text-xs text-gray-500">({op.did})</span>
          </>
        ) : operatorDid ? (
          <span className="text-xs text-gray-500">{String(operatorDid)}</span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>

      <div>
        <b>Macchinario:</b>{" "}
        {mc ? (
          <>
            {mc.name}{" "}
            <span className="text-xs text-gray-500">({mc.did})</span>
          </>
        ) : machineDid ? (
          <span className="text-xs text-gray-500">{String(machineDid)}</span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>

      <div><b>Creatore (DID):</b> {creatorDid ?? <span className="text-gray-400">—</span>}</div>
      <div><b>Data:</b> {when}</div>

      <div>
        <b>Stato:</b>{" "}
        <span
          className={
            status === "completed"
              ? "text-green-700 font-bold"
              : status === "in_progress"
              ? "text-blue-700 font-bold"
              : "text-orange-700"
          }
        >
          {status}
        </span>
      </div>

      {/* VC associate (read-only) */}
      {((event as any).proofId || (vcIds && vcIds.length > 0)) && (
        <div className="text-sm">
          {(event as any).proofId && (
            <div><b>VC principale (proofId):</b> {(event as any).proofId}</div>
          )}
          {vcIds.length > 0 && (
            <div><b>VC associate:</b> {vcIds.join(", ")}</div>
          )}
        </div>
      )}
    </div>
  );
}
