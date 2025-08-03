import React from "react";
import { Event } from "../../models/event";

interface Props {
  event: Event;
  onExecute: (eventId: string) => void;
}

export default function EventAction({ event, onExecute }: Props) {
  return (
    <div className="flex items-center gap-2 my-2">
      <span>
        <b>{event.type}</b>: {event.description}
      </span>
      {!event.done && (
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => onExecute(event.id)}
        >
          Esegui evento
        </button>
      )}
      {event.done && <span className="text-green-600 font-bold">Completato</span>}
    </div>
  );
}
