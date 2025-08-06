import { Event } from "../../models/event";
import { Actor } from "../../models/actor";

interface Props {
  event: Event;
  actors?: Actor[]; // opzionale: se vuoi mostrare nomi/DID reali invece di solo ID
}

export default function EventDetails({ event, actors }: Props) {
  if (!event) return null;

  // Helper per trovare attore con id
  const findActor = (id?: string) => actors?.find(a => a.id === id);

  // Trova dettagli operatore/macchinario
  const operatore = findActor?.(event.operatoreId);
  const macchinario = findActor?.(event.macchinarioId);

  return (
    <div className="border rounded p-4 bg-gray-50 mb-2">
      <div><b>ID evento:</b> {event.id}</div>
      <div><b>Tipo:</b> {event.type}</div>
      <div><b>Descrizione:</b> {event.description}</div>
      <div><b>Prodotto:</b> {event.productId}</div>

      <div>
        <b>Operatore:</b>{" "}
        {operatore ? (
          <>
            {operatore.name} <span className="text-xs text-gray-500">({operatore.did})</span>
          </>
        ) : (
          event.operatoreId
        )}
      </div>

      <div>
        <b>Macchinario:</b>{" "}
        {macchinario ? (
          <>
            {macchinario.name} <span className="text-xs text-gray-500">({macchinario.did})</span>
          </>
        ) : (
          event.macchinarioId
        )}
      </div>

      <div><b>Creatore (DID):</b> {event.creatorId}</div>
      {event.bomComponent && <div><b>Componente BOM:</b> {event.bomComponent}</div>}
      <div><b>Data:</b> {new Date(event.date).toLocaleString()}</div>
      <div>
        <b>Stato:</b>{" "}
        <span className={event.done ? "text-green-700 font-bold" : "text-orange-700"}>
          {event.done ? "Completato" : "Da eseguire"}
        </span>
      </div>
      {event.proofId && <div><b>VC principale (proofId):</b> {event.proofId}</div>}
      {event.vcIds && event.vcIds.length > 0 && (
        <div>
          <b>VC associate:</b> {event.vcIds.join(", ")}
        </div>
      )}
    </div>
  );
}
