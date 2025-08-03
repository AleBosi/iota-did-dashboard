import React, { useState } from "react";
import { Product } from "../../models/product";

interface Props {
  products: Product[]; // Prodotti radice
  onAddChild?: (parentId: string) => void;
  onSelect?: (product: Product) => void;
}

const ProductBOMTree: React.FC<Props> = ({ products, onAddChild, onSelect }) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const renderNode = (product: Product) => (
    <li key={product.productId}>
      <div
        className="flex items-center gap-2"
        style={{ cursor: "pointer" }}
        onClick={() => onSelect?.(product)}
      >
        <span className="font-semibold">{product.name || product.productId}</span>
        <button
          type="button"
          className="px-2 py-1 rounded bg-blue-200 hover:bg-blue-300 text-xs"
          onClick={e => { e.stopPropagation(); onAddChild?.(product.productId); }}
        >
          + Sotto-componente
        </button>
        {product.children && product.children.length > 0 && (
          <button
            type="button"
            className="px-1 py-0 rounded bg-gray-100 text-xs"
            onClick={e => { e.stopPropagation(); toggle(product.productId); }}
          >
            [{expanded.includes(product.productId) ? "-" : "+"}]
          </button>
        )}
      </div>
      {expanded.includes(product.productId) && product.children && (
        <ul className="ml-6">
          {product.children.map(renderNode)}
        </ul>
      )}
    </li>
  );

  return (
    <ul>
      {products.map(renderNode)}
    </ul>
  );
};

export default ProductBOMTree;
