import React, { useState } from "react";
import { Azienda } from "../../../models/azienda";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const azienda: Azienda = {
      id: "did:iota:evm:" + Date.now(), // replace with generateDid()
      name,
      seed: "SEED_" + Date.now(),       // replace with generateSeed()
      legalInfo: {
        vat,
        lei,
        address,
        email,
        country
      },
      creators: [],
      operatori: [],
      macchinari: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onCreate(azienda);
    setName(""); setVat(""); setLei(""); setAddress(""); setEmail(""); setCountry("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input placeholder="Ragione sociale" value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder="Partita IVA" value={vat} onChange={e => setVat(e.target.value)} />
      <input placeholder="LEI" value={lei} onChange={e => setLei(e.target.value)} />
      <input placeholder="Indirizzo" value={address} onChange={e => setAddress(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Nazione" value={country} onChange={e => setCountry(e.target.value)} />
      <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">Crea azienda</button>
    </form>
  );
}
