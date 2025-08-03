import { ProductType } from "../../models/productType";

export function isProductType(obj: any): obj is ProductType {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    (typeof obj.description === "undefined" || typeof obj.description === "string")
  );
}
