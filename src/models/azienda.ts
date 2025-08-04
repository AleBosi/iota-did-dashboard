// /models/azienda.ts
export interface Azienda {
  id: string;         // DID (es: did:iota:evm:...)
  name: string;
  seed: string;       // per login e firma
  legalInfo?: {
    vat?: string;         // partita IVA o VAT
    lei?: string;         // Legal Entity Identifier (EBSI ready)
    address?: string;
    email?: string;
    country?: string;
    [key: string]: any;   // altri campi liberi
  };
  creators: string[];     // array di DID
  operatori: string[];
  macchinari: string[];
  createdAt?: string;     // ISO
  updatedAt?: string;     // ISO
}
