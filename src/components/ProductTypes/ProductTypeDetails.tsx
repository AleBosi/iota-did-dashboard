import { ProductType } from "../../models/productType";

interface Props {
  type: ProductType;
}

export default function ProductTypeDetails({ type }: Props) {
  if (!type) return null;
  return (
    <div className="border rounded p-4 bg-gray-50 mb-2">
      <div><b>Nome:</b> {type.name}</div>
      <div><b>ID:</b> {type.id}</div>
      {type.description && <div><b>Descrizione:</b> {type.description}</div>}
    </div>
  );
}
