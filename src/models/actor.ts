// /src/models/actor.ts
export type ActorRole = "admin" | "azienda" | "creator" | "operatore" | "macchinario";

export interface Actor {
  id: string;         // DID
  role: ActorRole;
  name: string;
  aziendaId: string;
  seed: string;
}
