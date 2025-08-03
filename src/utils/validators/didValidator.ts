import { DidDocument } from "../../models/did";

export function isDidDocument(obj: any): obj is DidDocument {
  if (!obj) return false;
  return (
    obj &&
    typeof obj.id === "string" &&
    (typeof obj.controller === "undefined" || Array.isArray(obj.controller)) &&
    (typeof obj.verificationMethod === "undefined" ||
      (Array.isArray(obj.verificationMethod) &&
        obj.verificationMethod.every(
          (m: any) =>
            m &&
            typeof m.id === "string" &&
            typeof m.type === "string" &&
            typeof m.publicKeyMultibase === "string"
        ))) &&
    (typeof obj.authentication === "undefined" || Array.isArray(obj.authentication)) &&
    (typeof obj.service === "undefined" ||
      (Array.isArray(obj.service) &&
        obj.service.every(
          (s: any) =>
            s &&
            typeof s.id === "string" &&
            typeof s.type === "string" &&
            typeof s.serviceEndpoint === "string"
        )))
  );
}