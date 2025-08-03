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
    <li key={product.id}>
      <div
        className="flex items-center gap-2"
        style={{ cursor: "pointer" }}
        onClick={() => onSelect?.(product)}
      >
        <span className="font-semibold">{product.name || product.id}</span>
        <button
          type="button"
          className="px-2 py-1 rounded bg-blue-200 hover:bg-blue-300 text-xs"
          onClick={e => { e.stopPropagation(); onAddChild?.(product.id); }}
        >
          + Sotto-componente
        </button>
        {product.bom && product.bom.length > 0 && (
          <button
            type="button"
            className="px-1 py-0 rounded bg-gray-100 text-xs"
            onClick={e => { e.stopPropagation(); toggle(product.id); }}
          >
            [{expanded.includes(product.id) ? "-" : "+"}]
          </button>
        )}
      </div>
      {expanded.includes(product.id) && product.bom && (
        <ul className="ml-6">
          {/* 
            Se vuoi puoi renderizzare qui i figli:  
            dovrai passare la lista prodotti completa e matchare per id 
            (es: products.find(p => p.id === c.id) per ogni c in product.bom) 
          */}
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
