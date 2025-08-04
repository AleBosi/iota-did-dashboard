import { useState } from "react";
import { ProductType } from "../../models/productType";
import ProductTypeDetails from "./ProductTypeDetails";

interface Props {
  types: ProductType[];
  onSelect?: (type: ProductType) => void;
}

export default function ProductTypeList({ types, onSelect }: Props) {
  const [selected, setSelected] = useState<ProductType | null>(null);

  return (
    <div className="flex gap-8">
      <ul className="w-1/2">
        {types.map(t => (
          <li
            key={t.id}
            className="mb-2 border-b pb-2 cursor-pointer hover:bg-blue-50"
            onClick={() => {
              setSelected(t);
              onSelect?.(t);
            }}
          >
            <span className="font-semibold">{t.name}</span>
            {t.description && <span className="ml-2 text-gray-400">{t.description}</span>}
          </li>
        ))}
      </ul>
      <div className="w-1/2">
        {selected && <ProductTypeDetails type={selected} />}
      </div>
    </div>
  );
}
