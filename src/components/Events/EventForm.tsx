import React, { useState } from "react";
import { Event } from "../../models/event";
import { generateDid } from "../../utils/didUtils";
import { issueVC } from "../../utils/vcHelpers";
import { saveItem } from "../../utils/storageHelpers";

interface Props {
  productId: string;
  by: string; // operator/machine DID
  onCreate?: (event: Event) => void;
}

const EventForm: React.FC<Props> = ({ productId, by, onCreate }) => {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const event: Event = {
      id: generateDid(),
      productId,
      type,
      description,
      date: new Date().toISOString(),
      by,
      done: false,
    };
    // Emissione VC per evento (opzionale)
    const issuer = by;
    const vc = issueVC<Event>(
      ["VerifiableCredential", "ProductEventCredential"],
      issuer,
      event
    );
    event.vcId = vc.id;
    saveItem(`Event:${event.id}`, event);
    saveItem(`VC:${vc.id}`, vc);
    onCreate?.(event);
    setType("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        placeholder="Tipo evento"
        value={type}
        onChange={e => setType(e.target.value)}
        required
        className="border px-2 py-1 rounded"
      />
      <input
        placeholder="Dettagli"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="border px-2 py-1 rounded"
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">
        Aggiungi evento
      </button>
    </form>
  );
};

export default EventForm;
