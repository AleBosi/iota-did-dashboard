import { useState } from "react";
import { Product } from "../../models/product";
import { Actor } from "../../models/actor";
import { generateDid } from "../../utils/didUtils";
import { issueVC } from "../../utils/vcHelpers";
import { saveItem } from "../../utils/storageHelpers";

interface Props {
  prodotti: Product[];      // productId, typeId, did, serial, owner, credentials, children
  operatori: Actor[];       // did, name, credentials
  macchinari: Actor[];      // did, name, credentials
  creatorDid: string;       // <-- DID del creator (utente loggato)
  onCreate?: (event: any) => void;
}

const EventForm: React.FC<Props> = ({
  prodotti,
  operatori,
  macchinari,
  creatorDid,
  onCreate,
}) => {
  const [productId, setProductId] = useState("");
  const [operatoreDid, setOperatoreDid] = useState("");
  const [macchinarioDid, setMacchinarioDid] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [bomComponent, setBomComponent] = useState("");
  const [done, setDone] = useState(false);
  const [vcPreview, setVcPreview] = useState<any | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !operatoreDid || !macchinarioDid || !type) return;

    // Ricava oggetti completi (non solo ID) per collegare al nuovo evento
    const prodotto = prodotti.find(p => p.productId === productId);
    const operatore = operatori.find(o => o.did === operatoreDid);
    const macchinario = macchinari.find(m => m.did === macchinarioDid);

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

    // Event model VC-centric: la VC è collegata direttamente
    const event = {
      ...eventCore,
      vc,                  // collegamento diretto alla VC emessa
      vcId: vc.id,
      credentials: [vc],   // possibilità di espandere in futuro
    };

    saveItem(`Event:${event.eventId}`, event);
    saveItem(`VC:${vc.id}`, vc);
    setVcPreview(vc);
    onCreate?.(event);

    // Reset form
    setProductId("");
    setOperatoreDid("");
    setMacchinarioDid("");
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
      <label>
        Operatore:
        <select value={operatoreDid} onChange={e => setOperatoreDid(e.target.value)} required>
          <option value="">-- Seleziona operatore --</option>
          {operatori.map(o => (
            <option key={o.did} value={o.did}>
              {o.name} ({o.did.slice(-6)})
            </option>
          ))}
        </select>
      </label>
      <label>
        Macchinario:
        <select value={macchinarioDid} onChange={e => setMacchinarioDid(e.target.value)} required>
          <option value="">-- Seleziona macchinario --</option>
          {macchinari.map(m => (
            <option key={m.did} value={m.did}>
              {m.name} ({m.did.slice(-6)})
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
