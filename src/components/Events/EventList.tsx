import { useState } from "react";
import { Event } from "../../models/event";
import { Actor } from "../../models/actor";
import EventDetails from "./EventDetails";

interface Props {
  events: Event[];
  actors: Actor[]; // serve per mostrare nomi/did nella lista e nei dettagli!
  onSelect?: (event: Event) => void;
}

export default function EventList({ events, actors, onSelect }: Props) {
  const [selected, setSelected] = useState<Event | null>(null);

  // Helper per trovare attore per id
  const findActor = (id?: string) => actors.find(a => a.id === id);

  return (
    <div className="flex gap-8">
      <ul className="w-1/2">
        {events.map(ev => (
          <li
            key={ev.id}
            className={`border-b py-2 cursor-pointer hover:bg-blue-50 ${ev.done ? "line-through text-gray-400" : ""}`}
            onClick={() => {
              setSelected(ev);
              onSelect?.(ev);
            }}
          >
            <span className="font-semibold">{ev.type}</span>
            {ev.bomComponent && (
              <span className="ml-2 text-gray-600">[{ev.bomComponent}]</span>
            )}
            <span className="ml-2">{ev.description}</span>
            {/* Operatore */}
            {ev.operatoreId && (
              <span className="ml-2 text-xs text-blue-800">
                👤 {findActor(ev.operatoreId)?.name ?? ev.operatoreId}
              </span>
            )}
            {/* Macchinario */}
            {ev.macchinarioId && (
              <span className="ml-2 text-xs text-purple-800">
                🏭 {findActor(ev.macchinarioId)?.name ?? ev.macchinarioId}
              </span>
            )}
            <span className="ml-2 text-xs text-gray-400">
              {new Date(ev.date).toLocaleString()}
            </span>
            {ev.done && (
              <span className="ml-2 text-green-600 font-bold">✓</span>
            )}
          </li>
        ))}
      </ul>
      <div className="w-1/2">
        {selected && <EventDetails event={selected} actors={actors} />}
      </div>
    </div>
  );
}
