import React, { useState } from "react";
import { Operatore } from "./OperatoreType";
import { loadOperatori, saveOperatori } from "./operatoreStorage";
import OperatoreForm from "./OperatoreForm";
import OperatoreList from "./OperatoreList";

export default function GestioneOperatori() {
  const [operatori, setOperatori] = useState<Operatore[]>(() => loadOperatori());
  const [editing, setEditing] = useState<Operatore | null>(null);
  const [showForm, setShowForm] = useState(false);

  function handleSave(o: Operatore) {
    let updated: Operatore[];
    if (o.id && operatori.find(x => x.id === o.id)) {
      updated = operatori.map(x => x.id === o.id ? o : x);
    } else {
      o.id = Date.now().toString();
      updated = [...operatori, o];
    }
    setOperatori(updated);
    saveOperatori(updated);
    setEditing(null);
    setShowForm(false);
  }

  function handleEdit(o: Operatore) {
    setEditing(o);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (!window.confirm("Eliminare questo operatore?")) return;
    const updated = operatori.filter(o => o.id !== id);
    setOperatori(updated);
    saveOperatori(updated);
  }

  function handleAdd() {
    setEditing(null);
    setShowForm(true);
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Gestione Operatori</h2>
      <button className="mb-4 bg-green-600 text-white px-4 py-2 rounded" onClick={handleAdd}>+ Nuovo operatore</button>
      {showForm && (
        <OperatoreForm
          initial={editing || undefined}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
      <OperatoreList operatori={operatori} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
