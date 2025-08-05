import React from "react";
import { Actor } from "../../../models/actor";

interface Props {
  operatore: Actor | null; // accetta anche null (per robustezza test)
}

const OperatoreDetails: React.FC<Props> = ({ operatore }) => {
  if (!operatore) return null;

  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-4">
      <h2 className="text-lg font-bold mb-2">Dettagli Operatore</h2>
      <div className="grid gap-2 text-base">
        <div><b>Nome:</b> {operatore.name}</div>
        <div><b>Ruolo:</b> {operatore.role}</div>
        <div>
          <b>DID:</b> <span className="text-xs text-gray-500">{operatore.did || operatore.id}</span>
        </div>
        {operatore.seed && (
          <div>
            <b>Seed:</b> <code className="bg-gray-100 rounded px-2">{operatore.seed}</code>
          </div>
        )}
        {operatore.publicKey && (
          <div>
            <b>PublicKey:</b> <code className="bg-gray-100 rounded px-2">{operatore.publicKey}</code>
          </div>
        )}
        {operatore.aziendaId && (
          <div>
            <b>DID Azienda:</b> <span className="text-xs text-gray-500">{operatore.aziendaId}</span>
          </div>
        )}
        {operatore.vcIds && (
          <div>
            <b>VC associate:</b> <span>{operatore.vcIds.length}</span>
          </div>
        )}
        {operatore.createdAt && (
          <div className="text-xs text-gray-400">
            Creato il: {operatore.createdAt}
          </div>
        )}
        {operatore.updatedAt && (
          <div className="text-xs text-gray-400">
            Aggiornato il: {operatore.updatedAt}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperatoreDetails;
