import { useState } from "react";
import { Event } from "../../models/event";
import { saveItem, loadItem } from "../../utils/storageHelpers";

export default function EventHistory({ did }: { did: string }) {
  const [events, setEvents] = useState<Event[]>(() =>
    loadItem<Event[]>(`events_${did}`) || []
  );
  const [description, setDescription] = useState("");
  const [type, setType] = useState("generic");

  const addEvent = () => {
   const ev: Event = {
   id: Date.now().toString(),
   type,
   date: new Date().toISOString(),
   creatorId: did,
   description,
   done: false,
   productId: "",   
   operatoreId: "",
   macchinarioId: ""
    };
    const updated = [...events, ev];
    setEvents(updated);
    saveItem(`events_${did}`, updated);
    setDescription("");
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">Eventi</h3>
      <div className="flex gap-2 mb-2">
        <select value={type} onChange={e => setType(e.target.value)} className="border px-2 py-1 rounded">
          <option value="generic">Generico</option>
          <option value="manutenzione">Manutenzione</option>
          <option value="avvio">Avvio</option>
          <option value="fermo">Fermo</option>
        </select>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Descrizione evento"
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={addEvent}
          disabled={!description.trim()}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Aggiungi
        </button>
      </div>
      <ul className="mt-2 space-y-2">
        {events.map(ev => (
          <li key={ev.id} className="bg-gray-100 px-3 py-2 rounded">
            <span className="font-semibold">{ev.type}</span>{" "}
            <span className="text-xs text-gray-500">{new Date(ev.date).toLocaleString()}</span>
            <br />
            <span>{ev.description}</span>
            {ev.done && <span className="ml-2 text-green-600 font-bold">✓</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
