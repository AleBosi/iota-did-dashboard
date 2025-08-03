import { Event } from "../../models/event";

export function isEvent(obj: any): obj is Event {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.type === "string" &&
    typeof obj.description === "string" &&
    typeof obj.date === "string" &&
    (typeof obj.productId === "undefined" || typeof obj.productId === "string") &&
    (typeof obj.bomComponent === "undefined" || typeof obj.bomComponent === "string") &&
    (typeof obj.by === "undefined" || typeof obj.by === "string") &&
    (typeof obj.done === "undefined" || typeof obj.done === "boolean") &&
    (typeof obj.vcId === "undefined" || typeof obj.vcId === "string")
  );
}
