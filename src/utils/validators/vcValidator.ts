import { VerifiableCredential, VCProof } from "../../models/vc";

function isVCProof(obj: any): obj is VCProof {
  return (
    obj &&
    typeof obj.type === "string" &&
    typeof obj.created === "string" &&
    typeof obj.proofPurpose === "string" &&
    typeof obj.verificationMethod === "string" &&
    typeof obj.jws === "string" &&
    typeof obj.hash === "string"
  );
}

export function isVerifiableCredential(obj: any): obj is VerifiableCredential {
  return (
    obj &&
    typeof obj.id === "string" &&
    Array.isArray(obj.type) &&
    typeof obj.issuer === "string" &&
    typeof obj.issuanceDate === "string" &&
    "credentialSubject" in obj &&
    isVCProof(obj.proof) &&
    (typeof obj.status === "undefined" ||
      ["valid", "revoked", "expired", "pending"].includes(obj.status)) &&
    (typeof obj.previousProofs === "undefined" ||
      (Array.isArray(obj.previousProofs) &&
        obj.previousProofs.every(isVCProof)))
  );
}
