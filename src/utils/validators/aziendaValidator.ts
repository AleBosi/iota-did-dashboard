import { Azienda } from "../../models/azienda";

export function isAzienda(obj: any): obj is Azienda {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.seed === "string" &&
    (typeof obj.legalInfo === "undefined" || typeof obj.legalInfo === "object") &&
    Array.isArray(obj.creators) &&
    Array.isArray(obj.operatori) &&
    Array.isArray(obj.macchinari) &&
    (typeof obj.createdAt === "undefined" || typeof obj.createdAt === "string") &&
    (typeof obj.updatedAt === "undefined" || typeof obj.updatedAt === "string")
  );
}
