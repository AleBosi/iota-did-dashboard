import React, { useState } from "react";
import { Product } from "../../models/product";
import { generateDid } from "../../utils/didUtils";
import { issueVC } from "../../utils/vcHelpers";
import { saveItem } from "../../utils/storageHelpers";

interface Props {
  parentProduct?: Product;  // se fornito, aggiunge come figlio
  onCreate?: (product: Product) => void;
  typeId?: string; // opzionale, preimpostata se crei dal tipo
}

const ProductForm: React.FC<Props> = ({ parentProduct, onCreate, typeId }) => {
  const [serial, setSerial] = useState("");
  const [owner, setOwner] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: generateDid(),
      typeId: typeId || "",
      did: generateDid(),
      serial,
      owner,
      name,
      bom: [],
      credentials: [],
    };
    // Emissione VC prodotto
    const issuer = owner || "did:iota:evm:0x...";
    const vc = issueVC<Product>(
      ["VerifiableCredential", "ProductCredential"],
      issuer,
      product
    );
    product.credentials?.push(vc.id);
    saveItem(`Product:${product.id}`, product);
    saveItem(`VC:${vc.id}`, vc);

    // Se c'è un parentProduct, aggiungi come figlio e salva il parent aggiornato
    if (parentProduct) {
      parentProduct.bom = parentProduct.bom || [];
      parentProduct.bom.push({ id: product.id, name: product.name });
      saveItem(`Product:${parentProduct.id}`, parentProduct);
    }

    onCreate?.(product);
    setSerial("");
    setOwner("");
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        placeholder="Nome prodotto"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        placeholder="Seriale"
        value={serial}
        onChange={e => setSerial(e.target.value)}
        required
      />
      <input
        placeholder="Owner DID"
        value={owner}
        onChange={e => setOwner(e.target.value)}
      />
      <button type="submit">
        {parentProduct ? "Aggiungi sotto-componente" : "Crea prodotto"}
      </button>
    </form>
  );
};

export default ProductForm;
