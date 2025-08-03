export interface Product {
  productId: string;
  typeId: string;
  did: string;
  serial?: string;
  owner?: string; // DID azienda
  children?: Product[]; // struttura BOM (Bill of Materials)
  credentials?: string[]; // lista ID delle VC associate
}
