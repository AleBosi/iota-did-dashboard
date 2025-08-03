import React from "react";
import { Actor } from "../../../models/actor";

interface Props {
  creator: Actor;
}

export default function CreatorDetails({ creator }: Props) {
  if (!creator) return null;
  return (
    <div className="border rounded p-4 bg-gray-50 mb-2">
      <div><b>Nome:</b> {creator.name}</div>
      <div><b>Ruolo:</b> {creator.role}</div>
      <div><b>DID:</b> {creator.id}</div>
      {creator.seed && <div><b>Seed:</b> <code>{creator.seed}</code></div>}
      {creator.publicKey && <div><b>PublicKey:</b> <code>{creator.publicKey}</code></div>}
      {creator.aziendaId && <div><b>DID Azienda:</b> {creator.aziendaId}</div>}
      {creator.credentials && <div><b>Credenziali:</b> {creator.credentials.length}</div>}
      {creator.events && <div><b>Eventi:</b> {creator.events.length}</div>}
      {creator.createdAt && <div className="text-xs text-gray-400">Creato il: {creator.createdAt}</div>}
      {creator.updatedAt && <div className="text-xs text-gray-400">Aggiornato il: {creator.updatedAt}</div>}
    </div>
  );
}
