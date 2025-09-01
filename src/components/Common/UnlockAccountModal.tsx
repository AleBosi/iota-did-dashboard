import React, { useState } from "react";
import { hasEncryptedSeed, loadDecryptedSeed, deriveMockAccount } from "../../utils/cryptoUtils";

type SeedEntityType = "company" | "actor" | "machine";

interface Props {
  open: boolean;
  onClose: () => void;
  entityType: SeedEntityType;
  entityId: string;
  entityName?: string;
  onUnlocked: (mnemonic: string, info: { address: `0x${string}`; did: string }) => void;
}

const UnlockAccountModal: React.FC<Props> = ({
  open, onClose, entityType, entityId, entityName, onUnlocked
}) => {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const canUnlock = pwd.length >= 1 && !busy;

  const doUnlock = async () => {
    try {
      setError(null);
      setBusy(true);
      if (!hasEncryptedSeed(entityType, entityId)) {
        setError("Nessuna seed salvata per questa entità.");
        return;
      }
      const mnemonic = await loadDecryptedSeed(entityType, entityId, pwd);
      const acc = deriveMockAccount(mnemonic);
      onUnlocked(mnemonic, { address: acc.address, did: acc.did });
      onClose();
    } catch (e: any) {
      setError(e?.message || "Password errata o seed non disponibile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-2">Sblocca account</h2>
        {entityName && (
          <p className="text-sm text-gray-500 mb-2">Entità: <b>{entityName}</b></p>
        )}
        <p className="text-sm text-gray-600 mb-3">
          Inserisci la password per visualizzare la seed in chiaro e sbloccare l’account.
        </p>

        <label className="block text-xs text-gray-600 mb-1">Password</label>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm mb-2"
          placeholder="Password"
        />

        {error && <div className="text-red-700 text-sm mb-2">❌ {error}</div>}

        <div className="mt-3 flex justify-end gap-2">
          <button className="rounded border px-3 py-1 text-sm" onClick={onClose}>
            Annulla
          </button>
          <button
            disabled={!canUnlock}
            onClick={doUnlock}
            className={`rounded px-3 py-1 text-sm text-white ${canUnlock ? "bg-gray-900" : "bg-gray-400"}`}
          >
            {busy ? "Sblocco..." : "Sblocca"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockAccountModal;
