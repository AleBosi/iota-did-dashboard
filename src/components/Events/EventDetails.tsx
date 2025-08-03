import React from "react";
import { Event } from "../../models/event";

interface Props {
  event: Event;
}

export default function EventDetails({ event }: Props) {
  if (!event) return null;
  return (
    <div className="border rounded p-4 bg-gray-50 mb-2">
      <div><b>ID:</b> {event.id}</div>
      <div><b>Tipo:</b> {event.type}</div>
      <div><b>Descrizione:</b> {event.description}</div>
      <div><b>Prodotto:</b> {event.productId}</div>
      {event.bomComponent && <div><b>Componente BOM:</b> {event.bomComponent}</div>}
      <div><b>Data:</b> {event.date}</div>
      {event.by && <div><b>Eseguito da:</b> {event.by}</div>}
      <div><b>Stato:</b> {event.done ? "Completato" : "Da eseguire"}</div>
      {event.vcId && <div><b>VC collegata:</b> {event.vcId}</div>}
    </div>
  );
}
