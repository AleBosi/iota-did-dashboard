import { useState } from "react";
import { Product } from "../../models/product";
import ProductDetails from "./ProductDetails";

interface Props {
  products: Product[];
  onSelect?: (product: Product) => void;
}

export default function ProductList({ products, onSelect }: Props) {
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <div className="flex gap-8">
      <ul className="w-1/2">
        {products.map(p => (
          <li
            key={p.productId}
            className="mb-2 border-b pb-2 cursor-pointer hover:bg-blue-50"
            onClick={() => {
              setSelected(p);
              onSelect?.(p);
            }}
          >
            <span className="font-semibold">{p.typeId}</span>
            {p.serial && <span className="ml-2 text-gray-400">Seriale: {p.serial}</span>}
            {/* Badge VC */}
            {p.credentials && p.credentials.length > 0 && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 rounded px-2">
                {p.credentials.length} VC
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="w-1/2">
        {selected && <ProductDetails product={selected} />}
      </div>
    </div>
  );
}
