import { Product } from "../../models/product";

export function isProduct(obj: any): obj is Product {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.did === "string" &&
    typeof obj.name === "string" &&
    (typeof obj.typeId === "undefined" || typeof obj.typeId === "string") &&
    (typeof obj.serial === "undefined" || typeof obj.serial === "string") &&
    (typeof obj.owner === "undefined" || typeof obj.owner === "string") &&
    (typeof obj.bom === "undefined" ||
      (Array.isArray(obj.bom) &&
        obj.bom.every(
          (c: any) =>
            c &&
            typeof c.id === "string" &&
            typeof c.name === "string"
        ))) &&
    (typeof obj.credentials === "undefined" || Array.isArray(obj.credentials)) &&
    (typeof obj.eventHistory === "undefined" || Array.isArray(obj.eventHistory)) &&
    (typeof obj.description === "undefined" || typeof obj.description === "string") &&
    (typeof obj.batchNumber === "undefined" || typeof obj.batchNumber === "string") &&
    (typeof obj.expiryDate === "undefined" || typeof obj.expiryDate === "string")
  );
}
