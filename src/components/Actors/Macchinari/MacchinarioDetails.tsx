import React from "react";
import { Actor } from "../../../models/actor";

interface Props {
  macchinario: Actor;
}

export default function MacchinarioDetails({ macchinario }: Props) {
  if (!macchinario) return null;
  return (
    <div className="border rounded p-4 bg-gray-50 mb-2">
      <div><b>Nome:</b> {macchinario.name}</div>
      <div><b>Ruolo:</b> {macchinario.role}</div>
      <div><b>DID:</b> {macchinario.id}</div>
      {macchinario.seed && <div><b>Seed:</b> <code>{macchinario.seed}</code></div>}
      {macchinario.publicKey && <div><b>PublicKey:</b> <code>{macchinario.publicKey}</code></div>}
      {macchinario.aziendaId && <div><b>DID Azienda:</b> {macchinario.aziendaId}</div>}
      {macchinario.credentials && <div><b>Credenziali:</b> {macchinario.credentials.length}</div>}
      {macchinario.events && <div><b>Eventi:</b> {macchinario.events.length}</div>}
      {macchinario.createdAt && <div className="text-xs text-gray-400">Creato il: {macchinario.createdAt}</div>}
      {macchinario.updatedAt && <div className="text-xs text-gray-400">Aggiornato il: {macchinario.updatedAt}</div>}
    </div>
  );
}
