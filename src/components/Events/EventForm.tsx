import { useState } from "react";
import { Product } from "../../models/product";
import { Actor } from "../../models/actor";
import { Event } from "../../models/event";
import { generateDid } from "../../utils/didUtils";
import { issueVC } from "../../utils/vcHelpers";
import { saveItem } from "../../utils/storageHelpers";
import AssignmentManager from "../Actors/Creator/AssignmentManager";

interface Props {
  prodotti: Product[];
  actors: Actor[];
  eventi: Event[]; // tutti gli eventi già creati (per assignment)
  creatorDid: string;
  onCreate?: (event: any) => void;
}

const EventForm: React.FC<Props> = ({
  prodotti,
  actors,
  eventi,
  creatorDid,
  onCreate,
}) => {
  const [productId, setProductId] = useState("");
  const [operatoreId, setOperatoreId] = useState("");
  const [macchinarioId, setMacchinarioId] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [bomComponent, setBomComponent] = useState("");
  const [done, setDone] = useState(false);
  const [vcPreview, setVcPreview] = useState<any | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);

  // Gestione assegnazione tramite AssignmentManager
  const handleAssign = (ass: { eventId: string; operatoreId?: string; macchinarioId?: string }) => {
    setAssignments(prev => [...prev, ass]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !operatoreId || !macchinarioId || !type) return;

    const prodotto = prodotti.find(p => p.productId === productId);
    const operatore = actors.find(a => a.id === operatoreId && a.role === "operatore");
    const macchinario = actors.find(a => a.id === macchinarioId && a.role === "macchinario");

    if (!prodotto || !operatore || !macchinario) return;

    const eventCore = {
      eventId: generateDid(),
      product: {
        productId: prodotto.productId,
        did: prodotto.did,
        serial: prodotto.serial,
        typeId: prodotto.typeId,
      },
      operatore: {
        did: operatore.did,
        name: operatore.name,
      },
      macchinario: {
        did: macchinario.did,
        name: macchinario.name,
      },
      creator: creatorDid,
      type,
      description,
      date: new Date().toISOString(),
      done,
      bomComponent: bomComponent || undefined,
    };

    // Emissione VC centrata sull'evento
    const vc = issueVC(
      ["VerifiableCredential", "ProductEventCredential"],
      creatorDid,
      eventCore
    );

    const event = {
      ...eventCore,
      vc,
      vcId: vc.id,
      credentials: [vc],
    };

    saveItem(`Event:${event.eventId}`, event);
    saveItem(`VC:${vc.id}`, vc);
    setVcPreview(vc);
    onCreate?.(event);

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
          {prodotti.map(p => (
            <option key={p.productId} value={p.productId}>
              {p.serial} ({p.typeId})
            </option>
          ))}
        </select>
      </label>
      <AssignmentManager
        eventi={eventi}
        actors={actors}
        onAssign={handleAssign}
        assignments={assignments}
      />
      {/* Permetti anche la selezione manuale (per fallback/test) */}
      <label>
        Operatore (diretto):
        <select value={operatoreId} onChange={e => setOperatoreId(e.target.value)}>
          <option value="">-- Seleziona operatore --</option>
          {actors.filter(a => a.role === "operatore").map(op => (
            <option key={op.id} value={op.id}>
              {op.name} ({op.id})
            </option>
          ))}
        </select>
      </label>
      <label>
        Macchinario (diretto):
        <select value={macchinarioId} onChange={e => setMacchinarioId(e.target.value)}>
          <option value="">-- Seleziona macchinario --</option>
          {actors.filter(a => a.role === "macchinario").map(mac => (
            <option key={mac.id} value={mac.id}>
              {mac.name} ({mac.id})
            </option>
          ))}
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
      {vcPreview && (
        <div className="mt-4 p-2 bg-gray-50 rounded-xl border text-xs">
          <div className="font-bold mb-1">✅ Evento VC emessa:</div>
          <pre className="overflow-x-auto">{JSON.stringify(vcPreview, null, 2)}</pre>
        </div>
      )}
    </form>
  );
};

export default EventForm;
