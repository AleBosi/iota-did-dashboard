import React, { useMemo, useState } from "react";
import UnlockAccountModal from "@/components/Common/UnlockAccountModal";
import SeedPasswordModal from "@/components/Common/SeedPasswordModal";
import { useSecrets } from "@/contexts/SecretsContext";
import { hasEncryptedSeed, generateMnemonic24, deriveMockAccount } from "@/utils/cryptoUtils";

export default function AziendaDetails({
  azienda,
  credits = 0,
  onUpdate,
  onDelete,
  showSecrets, // ignorato: la seed va mostrata solo dopo sblocco
}: {
  azienda: any;
  credits?: number;
  onUpdate: (a: any) => void;
  onDelete: () => void;
  showSecrets?: boolean;
}) {
  const a = azienda || {};
  const li = a.legalInfo || {};
  const did = (a.did || a.id || "").trim();

  const { getSeed, setSeed, clearSeed } = useSecrets();
  const unlocked = getSeed({ type: "company", id: did });

  const seedExists = useMemo(() => (did ? hasEncryptedSeed("company", did) : false), [did]);

  const [showUnlock, setShowUnlock] = useState(false);

  // per aziende legacy senza seed salvata: generiamo una mnemonic e apriamo la modale di salvataggio
  const [setPwdOpen, setSetPwdOpen] = useState(false);
  const [mnemonicToSave, setMnemonicToSave] = useState<string>("");

  const copy = (txt: string) => {
    try {
      navigator.clipboard.writeText(txt);
      alert("Copiato negli appunti");
    } catch {}
  };

  const handleSetPassword = () => {
    // 1) se l’azienda ha già una seed valida (>=12 parole), riusiamola; altrimenti generiamo
    const existing =
      typeof a.seed === "string" && a.seed.split(" ").length >= 12 ? a.seed : "";

    const m = existing || generateMnemonic24(); // 24 parole reali BIP39
    setMnemonicToSave(m);

    // 2) allinea DID/Address alla seed (stessa pipeline di AziendaForm)
    try {
      const acc = deriveMockAccount(m);
      const newDid = `did:iota:evm:${acc.address}`;
      if (did !== newDid) {
        onUpdate({ ...a, did: newDid, evmAddress: acc.address, seed: a.seed || m });
      }
    } catch {
      // non bloccare l'UI in caso di errore di derivazione
    }

    // 3) apri la modale di impostazione password/salvataggio cifrato
    setSetPwdOpen(true);
  };

  // estrai address da DID iota:evm se presente (utile da mostrare)
  const address =
    did.startsWith("did:iota:evm:") ? (did.split(":").pop() as string) : undefined;

  return (
    <div>
      <div className="space-y-1 text-sm">
        <div>
          <strong>Ragione sociale:</strong> {a.name}
        </div>

        <div>
          <strong>DID:</strong>{" "}
          <code className="text-xs">{did || "-"}</code>{" "}
          {did && (
            <button className="text-blue-600 underline" onClick={() => copy(did)}>
              Copia
            </button>
          )}
        </div>

        {address && (
          <div>
            <strong>Address:</strong>{" "}
            <code className="text-xs">{address}</code>{" "}
            <button className="text-blue-600 underline" onClick={() => copy(address)}>
              Copia
            </button>
          </div>
        )}

        {/* ✅ Seed mostrata solo se sbloccata */}
        {unlocked && (
          <div className="mt-2">
            <strong>Seed (24 parole):</strong>
            <div className="mt-1 rounded border bg-gray-50 p-2 text-xs leading-6 select-all">
              {unlocked}
            </div>
          </div>
        )}

        <div>
          <strong>P.IVA:</strong> {li.vat || "-"}
        </div>
        <div>
          <strong>LEI:</strong> {li.lei || "-"}
        </div>
        <div>
          <strong>Indirizzo:</strong> {li.address || "-"}
        </div>
        <div>
          <strong>Email:</strong> {li.email || "-"}
        </div>
        <div>
          <strong>Nazione:</strong> {li.country || "-"}
        </div>
        <div>
          <strong>Crediti azienda:</strong> {credits.toLocaleString()}
        </div>
        <div>
          <strong>Creato il:</strong> {a.createdAt}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="rounded px-3 py-1 border hover:bg-gray-100"
          onClick={() => onUpdate({ ...a })}
        >
          Salva modifiche
        </button>
        <button
          className="rounded px-3 py-1 border border-red-300 text-red-700 hover:bg-red-50"
          onClick={onDelete}
        >
          Elimina
        </button>

        {/* Azioni seed */}
        {!seedExists && did && (
          <button
            className="rounded px-3 py-1 border bg-amber-600 text-white hover:opacity-90"
            onClick={handleSetPassword}
          >
            Imposta password & salva seed
          </button>
        )}

        {seedExists && !unlocked && (
          <button
            className="rounded px-3 py-1 border bg-gray-900 text-white hover:opacity-90"
            onClick={() => setShowUnlock(true)}
          >
            Sblocca e mostra seed
          </button>
        )}

        {unlocked && (
          <button
            className="rounded px-3 py-1 border hover:bg-gray-100"
            onClick={() => clearSeed({ type: "company", id: did })}
          >
            Nascondi seed
          </button>
        )}
      </div>

      {/* Modal sblocco (password -> seed in chiaro in RAM) */}
      <UnlockAccountModal
        open={showUnlock}
        onClose={() => setShowUnlock(false)}
        entityType="company"
        entityId={did}
        entityName={a.name}
        onUnlocked={(mnemonic) => setSeed({ type: "company", id: did }, mnemonic)}
      />

      {/* Modal set password & salva (per aziende legacy senza seed salvata) */}
      <SeedPasswordModal
        open={setPwdOpen}
        onClose={() => setSetPwdOpen(false)}
        entityType="company"
        entityId={did}
        entityName={a.name}
        mnemonic={mnemonicToSave}
        onSaved={() => {
          // una volta salvata, possiamo anche sbloccarla subito in RAM per comodità
          setSeed({ type: "company", id: did }, mnemonicToSave);
          setSetPwdOpen(false);
        }}
      />
    </div>
  );
}
