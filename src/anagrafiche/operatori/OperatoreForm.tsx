import React, { useState } from "react";
import { Operatore } from "./OperatoreType";

type Props = {
  initial?: Operatore;
  onSave: (o: Operatore) => void;
  onCancel: () => void;
};

export default function OperatoreForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Operatore>(
    initial || {
      id: "",
      did: "",
      nome: "",
      cognome: "",
      matricola: "",
      reparto: "",
      squadra: "",
      stabilimento: "",
      ruolo: "Operatore",
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
      <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" required />
      <input name="cognome" value={form.cognome} onChange={handleChange} placeholder="Cognome" required />
      <input name="matricola" value={form.matricola} onChange={handleChange} placeholder="Matricola" required />
      <input name="reparto" value={form.reparto} onChange={handleChange} placeholder="Reparto" />
      <input name="squadra" value={form.squadra} onChange={handleChange} placeholder="Squadra" />
      <input name="stabilimento" value={form.stabilimento} onChange={handleChange} placeholder="Stabilimento" />
      <select name="ruolo" value={form.ruolo} onChange={handleChange}>
        <option value="Operatore">Operatore</option>
        <option value="Supervisore">Supervisore</option>
      </select>
      <div className="space-x-3">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Salva</button>
        <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onCancel}>Annulla</button>
      </div>
    </form>
  );
}
