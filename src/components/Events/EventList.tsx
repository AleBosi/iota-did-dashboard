import React, { useState } from "react";
import { Event } from "../../models/event";
import EventDetails from "./EventDetails";

interface Props {
  events: Event[];
  onSelect?: (event: Event) => void;
}

export default function EventList({ events, onSelect }: Props) {
  const [selected, setSelected] = useState<Event | null>(null);

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
            {ev.bomComponent && <span className="ml-2 text-gray-600">[{ev.bomComponent}]</span>}
            <span className="ml-2">{ev.description}</span>
            <span className="ml-2 text-xs text-gray-400">{ev.date}</span>
            {ev.done && <span className="ml-2 text-green-600 font-bold">✓</span>}
          </li>
        ))}
      </ul>
      <div className="w-1/2">
        {selected && <EventDetails event={selected} />}
      </div>
    </div>
  );
}
