import { Actor } from "../../models/actor";

export function isActor(obj: any): obj is Actor {
  if (!obj) return false; // 👈 aggiungi questa riga!
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.role === "string" &&
    ["admin", "azienda", "creator", "operatore", "macchinario"].includes(obj.role) &&
    (typeof obj.aziendaId === "undefined" || typeof obj.aziendaId === "string") &&
    (typeof obj.seed === "undefined" || typeof obj.seed === "string") &&
    (typeof obj.publicKey === "undefined" || typeof obj.publicKey === "string") &&
    (typeof obj.credentials === "undefined" || Array.isArray(obj.credentials)) &&
    (typeof obj.events === "undefined" || Array.isArray(obj.events)) &&
    (typeof obj.createdAt === "undefined" || typeof obj.createdAt === "string") &&
    (typeof obj.updatedAt === "undefined" || typeof obj.updatedAt === "string")
  );
}
