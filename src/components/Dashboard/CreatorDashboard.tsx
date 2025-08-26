import { useEffect, useState } from "react";
import { safeGet, safeSet } from "../../utils/storage";
import { computeVcPayloadHash } from "../../services/vc";
import VerifyFlag from "../Common/VerifyFlag";

type ProductType = { id: string; name: string; productFields?: string[]; eventFields?: string[] };

export default function CreatorDashboard({ creator }: { creator?: any }) {
  const [types, setTypes] = useState<ProductType[]>(() => safeGet("productTypes", [] as ProductType[]));
  const [name, setName] = useState("");
  const [vcs, setVcs] = useState<any[]>(() => safeGet("vcs", [] as any[]));

  function addType() {
    const id = "TYPE-" + Math.random().toString(36).slice(2, 6);
    const next = [...types, { id, name: name || id, productFields: ["serial"], eventFields: ["result"] }];
    setTypes(next);
    safeSet("productTypes", next);
    setName("");
  }

  async function makeDPP() {
    const products = safeGet<any[]>("products", []);
    if (!products.length) return alert("Nessun prodotto in archivio");
    const p = products[0];
    const vc = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "DPP"],
      issuer: creator?.did || p.owner,
      credentialSubject: { productId: p.productId, typeId: p.typeId, serial: p.serial },
      eventHistory: safeGet<any[]>("events:" + p.productId, []),
      proof: { jws: "" }
    };
    vc.proof.jws = await computeVcPayloadHash(vc);
    const next = [vc, ...vcs];
    setVcs(next);
    safeSet("vcs", next);
  }

  useEffect(() => {
    // hook per future policy/template
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Creator</h1>

      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-medium mb-2">Product Types</h2>
        <div className="flex gap-2 mb-3">
          <input className="border rounded px-2 py-1" value={name} onChange={e=>setName(e.target.value)} placeholder="Nome type"/>
          <button className="px-3 py-1 rounded bg-black text-white" onClick={addType}>Aggiungi</button>
        </div>
        <ul className="list-disc ml-6">
          {types.map(t => <li key={t.id}>{t.id} — {t.name}</li>)}
        </ul>
      </section>

      <section className="bg-white p-4 rounded-xl shadow">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">VC / DPP</h2>
          <button className="px-3 py-1 rounded bg-black text-white" onClick={makeDPP}>Genera DPP per il primo prodotto</button>
        </div>
        <ul className="divide-y mt-3">
          {vcs.map((v, i) => (
            <li key={i} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{v.type?.join(", ")}</div>
                <div className="text-xs text-gray-500">{v.credentialSubject?.productId}</div>
              </div>
              <VerifyFlag vc={v} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
