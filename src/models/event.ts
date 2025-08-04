// /models/event.ts

export interface Event {
  id: string;
  productId: string;         // ID prodotto collegato (ora obbligatorio)
  operatoreId: string;       // ID operatore coinvolto
  macchinarioId: string;     // ID macchinario coinvolto
  type: string;              // es: "Assemblaggio", "Controllo", "Assegnazione"
  description: string;
  date: string;              // ISO
  creatorId: string;         // DID del creator che ha creato l’evento
  done?: boolean;            // true se eseguito
  bomComponent?: string;     // opzionale, componente specifico
  proofId?: string;          // se firmerai evento come VC
  vcIds?: string[];          // VC associate/notarizzate collegate a questo evento
}
