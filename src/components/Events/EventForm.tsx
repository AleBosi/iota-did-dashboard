import React, { useState } from "react";
import { ProductEvent } from "../../models/event";
import { generateDid } from "../../utils/didUtils";
import { issueVC } from "../../utils/vcHelpers";
import { saveItem } from "../../utils/storageHelpers";

interface Props {
  productDid: string;
  operatorDid: string;
  onCreate?: (event: ProductEvent) => void;
}

const EventForm: React.FC<Props> = ({ productDid, operatorDid, onCreate }) => {
  const [eventType, setEventType] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const event: ProductEvent = {
      eventId: generateDid(),
      productDid,
      operatorDid,
      eventType,
      date: new Date().toISOString(),
      details,
    };
    // Emissione VC per evento
    const issuer = operatorDid;
    const vc = issueVC<ProductEvent>(
      ["VerifiableCredential", "ProductEventCredential"],
      issuer,
      event
    );
    event.vcId = vc.id;
    saveItem(`Event:${event.eventId}`, event);
    saveItem(`VC:${vc.id}`, vc);
    onCreate?.(event);
    setEventType("");
    setDetails("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Tipo evento"
        value={eventType}
        onChange={e => setEventType(e.target.value)}
        required
      />
      <input
        placeholder="Dettagli"
        value={details}
        onChange={e => setDetails(e.target.value)}
      />
      <button type="submit">Aggiungi evento</button>
    </form>
  );
};

export default EventForm;
