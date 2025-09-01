import React, { useState } from "react";
import { saveEncryptedSeed } from "../../utils/cryptoUtils";

type SeedEntityType = "company" | "actor" | "machine";

interface Props {
  open: boolean;
  onClose: () => void;
  entityType: SeedEntityType;
  entityId: string;
  entityName?: string;
  mnemonic: string;            // 24 parole generate
  /** 🔹 chiamato solo dopo salvataggio cifrato riuscito */
  onSaved?: () => void;
}

const SeedPasswordModal: React.FC<Props> = ({
  open, onClose, entityType, entityId, entityName, mnemonic, onSaved,
}) => {
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const canSave = pwd.length >= 6 && pwd === pwd2 && !saving;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const onSave = async () => {
    try {
      setError(null);
      setSaving(true);
      await saveEncryptedSeed(entityType, entityId, mnemonic, pwd);
      // 🔹 notifica al padre che il salvataggio è avvenuto con successo
      onSaved?.();
      onClose();
    } catch (e: any) {
      setError(e?.message || "Errore salvataggio seed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-2">Imposta password & salva Seed</h2>
        {entityName && (
          <p className="text-sm text-gray-500 mb-2">Entità: <b>{entityName}</b></p>
        )}
        <p className="text-sm text-gray-600 mb-3">
          Questa seed (24 parole) identifica <b>in modo permanente</b> l’account in fase MOCK.
          Verrà cifrata con la password e salvata nel browser.
        </p>

        <div className="rounded border bg-gray-50 p-3 text-sm leading-6 select-all mb-3">
          {mnemonic}
        </div>

        <div className="flex gap-2 mb-3">
          <button className="rounded border px-3 py-1 text-sm" onClick={onCopy}>
            {copied ? "Copiato ✓" : "Copia seed"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Password (min 6 char)</label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Inserisci password"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Conferma password</label>
            <input
              type="password"
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Ripeti password"
            />
          </div>
        </div>

        {error && <div className="text-red-700 text-sm mb-2">❌ {error}</div>}

        <div className="mt-3 flex justify-end gap-2">
          <button className="rounded border px-3 py-1 text-sm" onClick={onClose}>
            Annulla
          </button>
          <button
            disabled={!canSave}
            onClick={onSave}
            className={`rounded px-3 py-1 text-sm text-white ${canSave ? "bg-gray-900" : "bg-gray-400"}`}
          >
            {saving ? "Salvo..." : "Salva cifrata"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeedPasswordModal;
