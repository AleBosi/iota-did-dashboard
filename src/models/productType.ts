export interface ProductType {
  typeId: string;
  name: string;
  description?: string;
  standardCertVCId?: string; // ID della VC di conformità/certificazione tipologia
}
