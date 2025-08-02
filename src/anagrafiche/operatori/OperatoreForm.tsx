// src/anagrafiche/operatori/OperatoreForm.tsx

import React, { useState } from "react";
import { createOperatore } from "./OperatoreFactory";

type Props = {
  initial?: ReturnType<typeof createOperatore>;
  onSave: (o: ReturnType<typeof createOperatore>) => void;
  onCancel: () => void;
};

export default function OperatoreForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState(
    initial || createOperatore()
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
      <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" required className="input" />
      <input name="ruolo" value={form.ruolo} onChange={handleChange} placeholder="Ruolo" required className="input" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required className="input" />
      <select name="stato" value={form.stato} onChange={handleChange} className="input">
        <option value="Attivo">Attivo</option>
        <option value="Sospeso">Sospeso</option>
        <option value="Cessato">Cessato</option>
      </select>
      <div className="space-x-3">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Salva</button>
        <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onCancel}>Annulla</button>
      </div>
    </form>
  );
}
