// /models/event.ts
export interface Event {
  id: string;
  productId?: string;         // ID prodotto a cui è collegato
  bomComponent?: string;      // componente specifico
  type: string;               // es: "Assemblaggio", "Controllo"
  description: string;
  date: string;               // ISO
  by?: string;                // DID di operatore/macchinario
  done?: boolean;             // true se eseguito
  proofId?: string;           // se firmerai evento come VC
}
