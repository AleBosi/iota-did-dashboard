// /models/productType.ts
export interface ProductType {
  id: string;               // es: GTIN, oppure UUID univoco
  name: string;
  description?: string;
}
