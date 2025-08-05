import React from "react";
import { Actor } from "../../../models/actor";

interface Props {
  macchinario: Actor;
}

const MacchinarioDetails: React.FC<Props> = ({ macchinario }) => {
  if (!macchinario) return null;

  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-4">
      <h2 className="text-lg font-bold mb-2">Dettagli Macchinario</h2>
      <div className="grid gap-2 text-base">
        <div><b>Nome:</b> {macchinario.name}</div>
        <div><b>Ruolo:</b> {macchinario.role}</div>
        <div>
          <b>DID:</b>{" "}
          <span className="text-xs text-gray-500">{macchinario.did}</span>
        </div>
        {macchinario.seed && (
          <div>
            <b>Seed:</b> <code className="bg-gray-100 rounded px-2">{macchinario.seed}</code>
          </div>
        )}
        {macchinario.publicKey && (
          <div>
            <b>PublicKey:</b> <code className="bg-gray-100 rounded px-2">{macchinario.publicKey}</code>
          </div>
        )}
        {macchinario.aziendaId && (
          <div>
            <b>DID Azienda:</b>{" "}
            <span className="text-xs text-gray-500">{macchinario.aziendaId}</span>
          </div>
        )}
        {macchinario.vcIds && (
          <div>
            <b>VC associate:</b> <span>{macchinario.vcIds.length}</span>
          </div>
        )}
        {macchinario.createdAt && (
          <div className="text-xs text-gray-400">Creato il: {macchinario.createdAt}</div>
        )}
        {macchinario.updatedAt && (
          <div className="text-xs text-gray-400">Aggiornato il: {macchinario.updatedAt}</div>
        )}
      </div>
    </div>
  );
};

export default MacchinarioDetails;
