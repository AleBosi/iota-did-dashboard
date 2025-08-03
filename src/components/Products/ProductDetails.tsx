import React from "react";
import { Product } from "../../models/product";

interface Props {
  product: Product;
}

export default function ProductDetails({ product }: Props) {
  if (!product) return <div>Nessun prodotto selezionato</div>;
  return (
    <div className="border rounded p-4 bg-gray-50 mb-2">
      <div><b>Nome:</b> {product.name}</div>
      <div><b>ID:</b> {product.id}</div>
      {product.typeId && <div><b>Tipo:</b> {product.typeId}</div>}
      {product.serial && <div><b>Seriale:</b> {product.serial}</div>}
      {product.owner && <div><b>Owner DID:</b> {product.owner}</div>}
      {product.bom && product.bom.length > 0 && (
        <div className="mt-2">
          <b>BOM (componenti):</b>
          <ul>
            {product.bom.map(c => (
              <li key={c.id} className="ml-2">
                • {c.name} (<span className="text-xs">{c.id}</span>)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
