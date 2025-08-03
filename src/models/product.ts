// /models/product.ts
export interface Product {
  id: string;              // ID univoco locale/app
  did: string;             // DID prodotto (es: did:iota:evm:0x...)
  name: string;            // Nome commerciale o etichetta prodotto
  typeId?: string;         // riferimento a ProductType.id
  serial?: string;         // seriale prodotto
  owner?: string;          // DID del proprietario corrente
  bom?: { id: string; name: string }[]; // lista componenti (Bill of Materials)
  credentials?: string[];  // lista di VC associate (ID delle VC)
  description?: string;    // opzionale
}
