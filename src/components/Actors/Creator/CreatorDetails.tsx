import React from "react";
import { Actor } from "../../../models/actor";

interface Props {
  creator: Actor;
}

const CreatorDetails: React.FC<Props> = ({ creator }) => {
  if (!creator) return null;

  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-4">
      <h2 className="text-lg font-bold mb-2">Dettagli Creator</h2>
      <div className="grid gap-2 text-base">
        <div><b>Nome:</b> {creator.name}</div>
        <div><b>Ruolo:</b> {creator.role}</div>
        <div><b>DID:</b> <span className="text-xs text-gray-500">{creator.id}</span></div>
        {creator.seed && (
          <div>
            <b>Seed:</b> <code className="bg-gray-100 rounded px-2">{creator.seed}</code>
          </div>
        )}
        {creator.publicKey && (
          <div>
            <b>PublicKey:</b> <code className="bg-gray-100 rounded px-2">{creator.publicKey}</code>
          </div>
        )}
        {creator.aziendaId && (
          <div>
            <b>DID Azienda:</b> <span className="text-xs text-gray-500">{creator.aziendaId}</span>
          </div>
        )}
        {creator.vcIds && (
          <div>
            <b>VC associate:</b> <span>{creator.vcIds.length}</span>
          </div>
        )}
        {creator.createdAt && (
          <div className="text-xs text-gray-400">
            Creato il: {creator.createdAt}
          </div>
        )}
        {creator.updatedAt && (
          <div className="text-xs text-gray-400">
            Aggiornato il: {creator.updatedAt}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDetails;
