import React, { useMemo, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useData } from "../../state/DataContext";
import { makeVCIntegrity } from "../../utils/vcIntegrity";

// Tipi minimi compatibili con lo standard VC
type DraftVC = {
  "@context": string[];
  type: string[];
  issuer: string;               // DID dell'emittente (attore corrente)
  issuanceDate: string;         // ISO 8601
  credentialSubject: {
    id: string;                 // DID o identificativo del soggetto
    type?: string | string[];   // opzionale: tipologia subject
    value: string;              // valore/attributo
  };
  // NB: eventHistory NON viene firmata by-design
  eventHistory?: Array<any>;
  // proof sarà aggiunta da makeVCIntegrity
};

export default function VCCreator() {
  const { currentActor } = useUser();
  const { COSTS, spendFromActor, addVC, notify } = useData();

  // form state
  const [subject, setSubject] = useState("");
  const [vcType, setVcType] = useState("");   // es: "Abilitazione"
  const [value, setValue] = useState("");

  const canPublish =
    !!currentActor?.did && subject.trim() !== "" && vcType.trim() !== "" && value.trim() !== "";

  // Prepara un draft VC coerente con lo standard base
  const draft: DraftVC | null = useMemo(() => {
    if (!currentActor?.did || !subject || !vcType || !value) return null;

    return {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        // eventuale context custom di dominio
      ],
      type: ["VerifiableCredential", vcType],
      issuer: currentActor.did,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: subject,
        type: vcType,
        value,
      },
      // opzionale, NON firmata: timeline operativa o append-only log
      eventHistory: [],
    };
  }, [currentActor?.did, subject, vcType, value]);

  const onPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish || !currentActor || !draft) return;

    try {
      // 1) Addebito crediti (sponsored tx dal wallet master secondo governance)
      await spendFromActor(currentActor.did, COSTS.publishVC);

      // 2) Calcolo proof su payload canonicalizzato (senza proof/eventHistory)
      const withProof = await makeVCIntegrity(draft, { signerDid: currentActor.did });

      // 3) Persistenza VC nel DataContext (fonte unica)
      addVC(withProof);

      // UI feedback + reset form
      notify?.("VC pubblicata con successo ✅");
      setSubject("");
      setVcType("");
      setValue("");
    } catch (err: any) {
      notify?.(`Errore pubblicazione VC: ${err?.message || String(err)}`, "error");
    }
  };

  return (
    <form onSubmit={onPublish} className="flex flex-col gap-3 mb-4">
      <div className="grid grid-cols-1 gap-2">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject (DID o nome)"
          className="border px-3 py-2 rounded-xl"
        />
        <input
          value={vcType}
          onChange={(e) => setVcType(e.target.value)}
          placeholder="Tipo credential (es: Abilitazione)"
          className="border px-3 py-2 rounded-xl"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Valore / Attributo"
          className="border px-3 py-2 rounded-xl"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Costo pubblicazione: <b>{COSTS?.publishVC ?? 1}</b> crediti
        </div>
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-xl disabled:opacity-40"
          disabled={!canPublish}
          title={!canPublish ? "Compila tutti i campi" : "Pubblica VC"}
        >
          Pubblica VC
        </button>
      </div>

      {/* Anteprima JSON (read-only) utile in fase di debug */}
      {draft && (
        <pre className="mt-2 text-xs bg-gray-50 border rounded-xl p-3 overflow-auto">
          {JSON.stringify(draft, null, 2)}
        </pre>
      )}
    </form>
  );
}
