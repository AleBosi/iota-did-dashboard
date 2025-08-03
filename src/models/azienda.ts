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
    [key: string]: any;   // altri campi liberi (es: phone, codice SDI...)
  };
  creators: string[];     // DID dei creator associati (opzionale, se vuoi ruoli intermedi)
  operatori: string[];    // DID operatori
  macchinari: string[];   // DID macchinari
  createdAt?: string;     // ISO
  updatedAt?: string;     // ISO
}
