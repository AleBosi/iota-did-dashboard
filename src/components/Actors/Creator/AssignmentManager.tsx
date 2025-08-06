import { useState } from "react";
import { Actor } from "../../../models/actor";
import { Event } from "../../../models/event";

interface Assignment {
  eventId: string;
  operatoreId?: string;
  macchinarioId?: string;
}

interface Props {
  eventi: Event[];
  actors: Actor[];
  onAssign: (assignment: Assignment) => void;
  assignments?: Assignment[];
}

export default function AssignmentManager({
  eventi,
  actors,
  onAssign,
  assignments = [],
}: Props) {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedOperatore, setSelectedOperatore] = useState<string>("");
  const [selectedMacchinario, setSelectedMacchinario] = useState<string>("");

  // Filtra gli attori in base al ruolo
  const operatori = actors.filter(a => a.role === "operatore");
  const macchinari = actors.filter(a => a.role === "macchinario");

  const handleAssign = () => {
    if (!selectedEvent) return;
    onAssign({
      eventId: selectedEvent,
      operatoreId: selectedOperatore || undefined,
      macchinarioId: selectedMacchinario || undefined,
    });
    setSelectedOperatore("");
    setSelectedMacchinario("");
  };

  return (
    <div className="p-4 border rounded bg-gray-50 mb-4">
      <h3 className="font-semibold mb-2">Assegna Operatore e Macchinario a un Evento</h3>
      <div className="flex flex-col gap-3 mb-4">
        <select
          value={selectedEvent}
          onChange={e => setSelectedEvent(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Seleziona Evento</option>
          {eventi.map(ev => (
            <option key={ev.id} value={ev.id}>
              {ev.type} - {ev.description}
            </option>
          ))}
        </select>
        <select
          value={selectedOperatore}
          onChange={e => setSelectedOperatore(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Seleziona Operatore</option>
          {operatori.map(op => (
            <option key={op.id} value={op.id}>
              {op.name} ({op.did})
            </option>
          ))}
        </select>
        <select
          value={selectedMacchinario}
          onChange={e => setSelectedMacchinario(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Seleziona Macchinario</option>
          {macchinari.map(mac => (
            <option key={mac.id} value={mac.id}>
              {mac.name} ({mac.did})
            </option>
          ))}
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded mt-2"
          disabled={!selectedEvent || (!selectedOperatore && !selectedMacchinario)}
          onClick={handleAssign}
        >
          Assegna
        </button>
      </div>
      {assignments.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-1">Assegnazioni Effettuate</h4>
          <ul className="space-y-1 text-sm">
            {assignments.map((ass, idx) => (
              <li key={idx} className="bg-gray-100 p-2 rounded">
                <b>Evento:</b> {eventi.find(e => e.id === ass.eventId)?.description || ass.eventId}
                {ass.operatoreId && (
                  <>
                    {" | "}
                    <b>Operatore:</b> {operatori.find(op => op.id === ass.operatoreId)?.name}
                  </>
                )}
                {ass.macchinarioId && (
                  <>
                    {" | "}
                    <b>Macchinario:</b> {macchinari.find(mac => mac.id === ass.macchinarioId)?.name}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
