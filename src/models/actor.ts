// /models/actor.ts

export interface Actor {
  id: string; // DID unico (es: "did:iota:evm:0x...")
  did: string;
  name: string;
  role: "admin" | "azienda" | "creator" | "operatore" | "macchinario";
  aziendaId?: string;      // DID dell’azienda di appartenenza
  seed?: string;           // non esportare mai in VC!
  publicKey?: string;      // per interoperabilità/validazione
  createdAt?: string;      // opzionale, ISO date
  updatedAt?: string;      // opzionale
  vcIds?: string[];        // Lista degli ID delle VC associate a questo attore
}
