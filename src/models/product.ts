// /models/product.ts

export interface Product {
  productId: string;          // ID interno locale/DB
  typeId: string;             // Tipo prodotto (es: "smartphone", "batteria")
  did: string;                // DID prodotto (es: "did:iota:evm:...")
  serial?: string;
  owner?: string;             // DID azienda owner
  children?: Product[];       // Struttura BOM ricorsiva (figli)
  credentials?: string[];     // lista ID delle VC associate
}
