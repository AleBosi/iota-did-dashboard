// /models/vc.ts

export interface VCProof {
  type: string;             // es: "Ed25519Signature2020"
  created: string;          // ISO date
  proofPurpose: string;     // es: "assertionMethod"
  verificationMethod: string; // es: chiave pubblica DID
  jws: string;              // firma JWS
  hash: string;             // hash SHA-256 dei dati firmati
}

export interface VerifiableCredential<T = any> {
  id: string;
  type: string[];        // ["VerifiableCredential", ...]
  issuer: string;        // DID issuer
  issuanceDate: string;  // ISO date
  credentialSubject: T;  // dati firmati (es: Product, Event, Actor)
  proof: VCProof;
}
