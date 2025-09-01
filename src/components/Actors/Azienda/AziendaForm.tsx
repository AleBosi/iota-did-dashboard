import { useState } from "react";
import { Azienda } from "../../../models/azienda";
import { generateMnemonic24, deriveMockAccount } from "@/utils/cryptoUtils";
import SeedPasswordModal from "@/components/Common/SeedPasswordModal";
import { registerIdentity } from "@/utils/identityRegistry";

interface Props {
  onCreate: (azienda: Azienda) => void;
}

export default function AziendaForm({ onCreate }: Props) {
  const [name, setName] = useState("");
  const [vat, setVat] = useState("");
  const [lei, setLei] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // stato per modale + azienda pending
  const [seedModal, setSeedModal] = useState<{
    open: boolean;
    id?: string;
    name?: string;
    mnemonic?: string;
    pending?: Azienda | null;
  }>({ open: false, pending: null });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const nameTrim = name.trim();
    if (!nameTrim) return;

    // 1) genera mnemonic e derivazione mock (stessa pipeline usata dal login)
    const mnemonic = generateMnemonic24();
    const acc = deriveMockAccount(mnemonic);
    const didIota = `did:iota:evm:${acc.address}`;

    // 2) prepara l'oggetto azienda (seed NON in chiaro; la salviamo cifrata via modale)
    const pending: Azienda = {
      id: didIota,
      did: didIota,
      evmAddress: acc.address,      // ✅ teniamo anche l’address per UI/consistenza
      name: nameTrim,
      seed: "",                     // compat: niente seed in chiaro nel record
      legalInfo: {
        vat: vat.trim(),
        lei: lei.trim(),
        address: address.trim(),
        email: email.trim(),
        country: country.trim(),
      },
      creators: [],
      operatori: [],
      macchinari: [],
      vcIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3) apri la modale: dopo "onSaved" persisteremo
    setSubmitting(true);
    setSeedModal({ open: true, id: pending.id, name: pending.name, mnemonic, pending });
  };

  const afterSaved = () => {
    // chiamato dalla modale quando ha cifrato e salvato la seed
    if (seedModal.pending) {
      const az = seedModal.pending;
      onCreate(az);

      // ✅ registra l’identità nel registry locale per il login da seed
      registerIdentity({
        did: az.did,
        type: "azienda",
        id: az.id,
        label: az.name,
        createdAt: az.createdAt,
      });
    }
    // reset form e chiudi modale
    setName(""); setVat(""); setLei(""); setAddress(""); setEmail(""); setCountry("");
    setSeedModal({ open: false, pending: null });
    setSubmitting(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input placeholder="Ragione sociale" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="Partita IVA" value={vat} onChange={e => setVat(e.target.value)} />
        <input placeholder="LEI" value={lei} onChange={e => setLei(e.target.value)} />
        <input placeholder="Indirizzo" value={address} onChange={e => setAddress(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Nazione" value={country} onChange={e => setCountry(e.target.value)} />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-60" disabled={submitting}>
          {submitting ? "In corso..." : "Crea azienda"}
        </button>
      </form>

      <SeedPasswordModal
        open={seedModal.open}
        onClose={() => setSeedModal(s => ({ ...s, open: false }))}
        entityType="company"
        entityId={seedModal.id ?? ""}
        entityName={seedModal.name}
        mnemonic={seedModal.mnemonic ?? ""}
        onSaved={afterSaved}   // 🔹 persiste l’azienda SOLO dopo salvataggio seed
      />
    </>
  );
}
