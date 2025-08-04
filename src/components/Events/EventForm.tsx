import React, { useState } from "react";
import { Event } from "../../models/event";
import { generateDid } from "../../utils/didUtils";
import { issueVC } from "../../utils/vcHelpers";
import { saveItem } from "../../utils/storageHelpers";

interface Props {
  prodotti: { id: string; name: string }[];
  operatori: { id: string; name: string }[];
  macchinari: { id: string; name: string }[];
  creatorId: string; // <-- DID del creator (utente loggato)
  onCreate?: (event: Event) => void;
}

const EventForm: React.FC<Props> = ({
  prodotti,
  operatori,
  macchinari,
  creatorId,
  onCreate
}) => {
  const [productId, setProductId] = useState("");
  const [operatoreId, setOperatoreId] = useState("");
  const [macchinarioId, setMacchinarioId] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [bomComponent, setBomComponent] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !operatoreId || !macchinarioId || !type) return;

    const event: Event = {
      id: generateDid(),
      productId,
      operatoreId,
      macchinarioId,
      creatorId,
      type,
      description,
      date: new Date().toISOString(),
      done,
      bomComponent: bomComponent || undefined,
      // proofId, vcIds saranno aggiunti dopo (se necessario)
    };

    // Emissione VC per evento (opzionale ma best practice)
    const issuer = creatorId;
    const vc = issueVC<Event>(
      ["VerifiableCredential", "ProductEventCredential"],
      issuer,
      event
    );
    event.proofId = vc.id;
    event.vcIds = [vc.id];
    saveItem(`Event:${event.id}`, event);
    saveItem(`VC:${vc.id}`, vc);
    onCreate?.(event);

    // Reset campi form
    setProductId("");
    setOperatoreId("");
    setMacchinarioId("");
    setType("");
    setDescription("");
    setBomComponent("");
    setDone(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-2xl shadow flex flex-col gap-2">
      <label>
        Prodotto:
        <select value={productId} onChange={e => setProductId(e.target.value)} required>
          <option value="">-- Seleziona prodotto --</option>
          {prodotti.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <label>
        Operatore:
        <select value={operatoreId} onChange={e => setOperatoreId(e.target.value)} required>
          <option value="">-- Seleziona operatore --</option>
          {operatori.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </label>
      <label>
        Macchinario:
        <select value={macchinarioId} onChange={e => setMacchinarioId(e.target.value)} required>
          <option value="">-- Seleziona macchinario --</option>
          {macchinari.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </label>
      <label>
        Tipo evento:
        <input
          placeholder="Tipo evento"
          value={type}
          onChange={e => setType(e.target.value)}
          required
          className="border px-2 py-1 rounded"
        />
      </label>
      <label>
        Descrizione:
        <input
          placeholder="Dettagli"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </label>
      <label>
        Componente BOM:
        <input
          placeholder="(opzionale)"
          value={bomComponent}
          onChange={e => setBomComponent(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </label>
      <label>
        Eseguito:
        <input
          type="checkbox"
          checked={done}
          onChange={e => setDone(e.target.checked)}
        />
      </label>
      <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">
        Aggiungi evento
      </button>
    </form>
  );
};

export default EventForm;
