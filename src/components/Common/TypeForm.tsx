import React, { useState } from "react";

type ProductType = {
  id: string;
  name: string;
  fields?: any[];
  eventFields?: any[];
};

export default function TypeForm({
  type,
  onSave,
  onCancel
}: {
  type: ProductType;
  onSave: (t: ProductType) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(type?.name || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return alert("Nome obbligatorio");
    onSave({ ...type, name });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form className="bg-white p-8 rounded-xl w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold mb-4">{type?.id ? "Modifica" : "Nuova"} tipologia</h2>
        <input
          className="border w-full rounded px-2 py-2 mb-4"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome tipologia"
        />
        <div className="flex gap-3">
          <button type="submit" className="bg-blue-700 text-white px-5 py-2 rounded-lg font-bold">Salva</button>
          <button type="button" className="bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-bold" onClick={onCancel}>Annulla</button>
        </div>
      </form>
    </div>
  );
}
