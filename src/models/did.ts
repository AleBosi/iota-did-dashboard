export interface DidDocument {
  id: string; // es: "did:iota:evm:0x123..."
  controller?: string[];
  verificationMethod?: {
    id: string;
    type: string;
    publicKeyMultibase: string;
  }[];
  service?: {
    id: string;
    type: string;
    serviceEndpoint: string;
  }[];
}
