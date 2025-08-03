import { VerifiableCredential } from "../models/vc";

export function issueVC<T>(
  type: string[],
  issuer: string,
  subject: T
): VerifiableCredential<T> {
  const issuanceDate = new Date().toISOString();
  const id = `urn:uuid:${crypto.randomUUID()}`;
  const proof = {
    type: "Ed25519Signature2018",
    created: issuanceDate,
    proofPurpose: "assertionMethod",
    verificationMethod: issuer,
    jws: btoa(JSON.stringify(subject)), // solo mock
    hash: "mockhash-" + id, // <-- AGGIUNTA QUI!
  };
  return {
    '@context': [
      "https://www.w3.org/2018/credentials/v1",
    ],
    id,
    type,
    issuer,
    issuanceDate,
    credentialSubject: subject,
    proof,
  };
}
