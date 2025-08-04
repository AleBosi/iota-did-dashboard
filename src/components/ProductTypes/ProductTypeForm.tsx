import React, { useState } from "react";
import { ProductType } from "../../models/productType";
import { generateDid } from "../../utils/didUtils";
import { issueVC } from "../../utils/vcHelpers";
import { saveItem } from "../../utils/storageHelpers";

interface Props {
  onCreate?: (type: ProductType) => void;
}

const ProductTypeForm: React.FC<Props> = ({ onCreate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newType: ProductType = {
      id: generateDid(), // usa 'id' come nel modello
      name,
      description,
    };
    // Emissione VC di conformità tipologia prodotto
    const issuer = "did:iota:evm:0x..."; // DID azienda (sostituisci con reale)
    const vc = issueVC<ProductType>(
      ["VerifiableCredential", "ProductTypeCredential"],
      issuer,
      newType
    );
    // Aggiunta proprietà extra con cast
    (newType as any).standardCertVCId = vc.id;

    // Salva su localStorage o passa a parent
    saveItem(`ProductType:${newType.id}`, newType);
    saveItem(`VC:${vc.id}`, vc);
    onCreate?.(newType);
    setName("");
    setDescription("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Nome tipologia"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        placeholder="Descrizione"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button type="submit">Crea tipologia</button>
    </form>
  );
};

export default ProductTypeForm;
