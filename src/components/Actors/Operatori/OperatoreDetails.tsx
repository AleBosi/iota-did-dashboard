import React from "react";
import { Actor } from "../../../models/actor";

interface Props {
  operatore: Actor;
}

export default function OperatoreDetails({ operatore }: Props) {
  if (!operatore) return null;
  return (
    <div className="border rounded p-4 bg-gray-50 mb-2">
      <div><b>Nome:</b> {operatore.name}</div>
      <div><b>Ruolo:</b> {operatore.role}</div>
      <div><b>DID:</b> {operatore.id}</div>
      {operatore.seed && <div><b>Seed:</b> <code>{operatore.seed}</code></div>}
      {operatore.publicKey && <div><b>PublicKey:</b> <code>{operatore.publicKey}</code></div>}
      {operatore.aziendaId && <div><b>DID Azienda:</b> {operatore.aziendaId}</div>}
      {operatore.credentials && <div><b>Credenziali:</b> {operatore.credentials.length}</div>}
      {operatore.events && <div><b>Eventi:</b> {operatore.events.length}</div>}
      {operatore.createdAt && <div className="text-xs text-gray-400">Creato il: {operatore.createdAt}</div>}
      {operatore.updatedAt && <div className="text-xs text-gray-400">Aggiornato il: {operatore.updatedAt}</div>}
    </div>
  );
}
