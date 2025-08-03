// /models/did.ts
export interface DidDocument {
  id: string; // es: "did:iota:evm:0x123..."
  controller?: string[];
  verificationMethod?: {
    id: string;
    type: string;
    publicKeyMultibase: string;
  }[];
  authentication?: string[];
  service?: {
    id: string;
    type: string;
    serviceEndpoint: string;
  }[];
  // Altri campi secondo specifica, se serve
}
