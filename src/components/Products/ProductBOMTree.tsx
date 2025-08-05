import { useState } from "react";
import { Product } from "../../models/product";

interface Props {
  products: Product[]; // Prodotti da cui partire (root o sottoalberi)
  onAddChild?: (parentId: string) => void;
  onSelect?: (product: Product) => void;
}

const ProductBOMTree: React.FC<Props> = ({ products, onAddChild, onSelect }) => {
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (productId: string) => {
    setExpanded(prev =>
      prev.includes(productId) ? prev.filter(e => e !== productId) : [...prev, productId]
    );
  };

  const renderNode = (product: Product) => (
    <li key={product.productId} className="mb-2">
      <div
        className="flex items-center gap-2 p-2 bg-white rounded shadow hover:bg-blue-50"
        style={{ cursor: "pointer" }}
        onClick={() => onSelect?.(product)}
      >
        <span className="font-semibold">{product.typeId || product.productId}</span>
        {product.credentials && product.credentials.length > 0 && (
          <span className="ml-2 text-xs bg-green-100 text-green-800 rounded px-2">
            {product.credentials.length} VC
          </span>
        )}
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
      {expanded.includes(product.productId) && product.children && product.children.length > 0 && (
        <ul className="ml-6 border-l pl-4">
          {product.children.map(renderNode)}
        </ul>
      )}
    </li>
  );

  return (
    <ul className="bg-gray-50 p-4 rounded-2xl shadow">
      {products.map(renderNode)}
    </ul>
  );
};

export default ProductBOMTree;
