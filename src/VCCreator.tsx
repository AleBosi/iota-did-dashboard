import React, { useState } from "react";
import { addProofMock } from "./utilsVC";
import VerifyFlag from "./VerifyFlag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VCCreator({
  did,
  onCreated,
}: {
  did: string;
  onCreated: (vc: any) => Promise<boolean>;
}) {
  const [vc, setVc] = useState<any>(null);
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [desc, setDesc] = useState("");

  async function createVc() {
    if (!did) {
      alert("DID mancante!");
      return;
    }
    if (!serial || !model || !desc) {
      alert("Compila tutti i campi!");
      return;
    }

    const credential = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "ProductCertificate"],
      issuer: did,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: `urn:product:${serial}`,
        model,
        description: desc,
      },
      eventHistory: [],
    };

    const withProof = await addProofMock(credential, did);
    const ok = await onCreated(withProof);
    if (ok) {
      setVc(withProof);
    } else {
      setVc(null);
    }
  }

  function downloadJson(obj: any, filename = "vc.json") {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(obj, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", filename);
    a.click();
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Digital Product Passport</h1>

      <h2 className="text-lg font-semibold">DID aziendale</h2>
      <div className="w-full mb-4 bg-gray-100 text-gray-800 font-mono border border-gray-300 rounded-md p-2 break-words">
        {did}
      </div>

      <h2 className="text-lg font-semibold mb-2">
        Crea una Verifiable Credential (VC)
      </h2>

      <Input
        placeholder="Seriale Prodotto"
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
        className="mb-3"
      />
      <Input
        placeholder="Modello"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="mb-3"
      />
      <Input
        placeholder="Descrizione"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="mb-4"
      />

      <Button onClick={createVc} className="mb-6">
        Crea VC
      </Button>

      {vc && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Step 3: Risultato VC (JSON) <VerifyFlag vc={vc} />
          </h2>
          <pre className="bg-gray-100 p-4 mt-2 rounded-md text-sm text-gray-800 overflow-auto max-h-96">
            {JSON.stringify(vc, null, 2)}
          </pre>
          <Button
            onClick={() => downloadJson(vc)}
            variant="outline"
            className="mt-4"
          >
            Scarica VC come JSON
          </Button>
        </div>
      )}
    </div>
  );
}
