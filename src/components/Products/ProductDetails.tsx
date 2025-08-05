import React from "react";
import { Product } from "../../models/product";
import ProductBOMTree from "./ProductBOMTree";

interface Props {
  product: Product;
}

const ProductDetails: React.FC<Props> = ({ product }) => {
  if (!product) return <div>Nessun prodotto selezionato</div>;

  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-4">
      <h2 className="text-lg font-bold mb-2">Dettagli Prodotto</h2>
      <div className="grid gap-2 text-base">
        <div><b>ID:</b> <span className="text-xs text-gray-500">{product.productId}</span></div>
        <div><b>DID:</b> <span className="text-xs text-gray-500">{product.did}</span></div>
        <div><b>Tipo:</b> {product.typeId}</div>
        {product.serial && <div><b>Seriale:</b> {product.serial}</div>}
        {product.owner && <div><b>Owner DID:</b> <span className="text-xs text-gray-500">{product.owner}</span></div>}
        {product.credentials && (
          <div>
            <b>VC associate:</b> <span>{product.credentials.length}</span>
          </div>
        )}
      </div>
      {product.children && product.children.length > 0 && (
        <div className="mt-4">
          <b>BOM (componenti):</b>
          <ProductBOMTree products={product.children} />
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
