export interface ProductType {
  id: string;               // es: GTIN, oppure UUID univoco
  name: string;
  description?: string;
  // Se vuoi tipizzare la proprietà extra, puoi aggiungerla così:
  // standardCertVCId?: string;
}
