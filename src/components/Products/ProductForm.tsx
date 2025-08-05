import React, { useState } from "react";
import { Product } from "../../models/product";
import { generateDid } from "../../utils/didUtils";
import { saveItem } from "../../utils/storageHelpers";

interface Props {
  parentProduct?: Product; // se fornito, aggiunge come figlio
  onCreate: (product: Product) => void;
}

const ProductForm: React.FC<Props> = ({ parentProduct, onCreate }) => {
  const [typeId, setTypeId] = useState("");
  const [serial, setSerial] = useState("");
  const [owner, setOwner] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeId || !serial) return;

    const product: Product = {
      productId: generateDid(),
      typeId,              // ora funge da nome prodotto
      did: generateDid(),
      serial,
      owner,
      credentials: [],
      children: [],
    };

    saveItem(`Product:${product.productId}`, product);

    // Se ha un padre, aggiungi il prodotto come child
    if (parentProduct) {
      parentProduct.children = parentProduct.children || [];
      parentProduct.children.push(product);
      saveItem(`Product:${parentProduct.productId}`, parentProduct);
    }

    onCreate(product);
    setTypeId("");
    setSerial("");
    setOwner("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
      <input
        placeholder="Nome prodotto"
        value={typeId}
        onChange={e => setTypeId(e.target.value)}
        required
        className="border px-2 py-1 rounded"
      />
      <input
        placeholder="Seriale"
        value={serial}
        onChange={e => setSerial(e.target.value)}
        required
        className="border px-2 py-1 rounded"
      />
      <input
        placeholder="Owner DID"
        value={owner}
        onChange={e => setOwner(e.target.value)}
        className="border px-2 py-1 rounded"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-1 rounded"
      >
        {parentProduct ? "Aggiungi sotto-componente" : "Crea prodotto"}
      </button>
    </form>
  );
};

export default ProductForm;
