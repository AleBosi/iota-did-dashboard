import React, { useState } from "react";
import { Macchinario } from "./TipoMacchinario";
import { generateDid } from "../../utils/didUtils";

type Props = {
  initial?: Macchinario;
  onSave: (m: Macchinario) => void;
  onCancel: () => void;
};

export default function MacchinarioForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Macchinario>(
    initial || {
      id: "",
      did: generateDid(),
      matricola: "",
      nome: "",
      linea: "",
      reparto: "",
      stabilimento: "",
      stato: "Attivo",
    }
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="font-mono text-xs text-gray-500">DID (auto):<br/>{form.did}</div>
      <input name="matricola" value={form.matricola} onChange={handleChange} placeholder="Matricola" required className="input" />
      <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" required className="input" />
      <input name="linea" value={form.linea} onChange={handleChange} placeholder="Linea" className="input" />
      <input name="reparto" value={form.reparto} onChange={handleChange} placeholder="Reparto" className="input" />
      <input name="stabilimento" value={form.stabilimento} onChange={handleChange} placeholder="Stabilimento" className="input" />
      <select name="stato" value={form.stato} onChange={handleChange} className="input">
        <option value="Attivo">Attivo</option>
        <option value="Manutenzione">Manutenzione</option>
        <option value="Fermo">Fermo</option>
      </select>
      <div className="space-x-3">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Salva</button>
        <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onCancel}>Annulla</button>
      </div>
    </form>
  );
}
