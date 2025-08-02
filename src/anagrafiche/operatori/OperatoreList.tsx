// src/anagrafiche/operatori/OperatoreList.tsx

import React from "react";
import { createOperatore } from "./OperatoreFactory";

type Operatore = ReturnType<typeof createOperatore>;

type Props = {
  operatori: Operatore[];
  onEdit: (o: Operatore) => void;
  onDelete: (id: string) => void;
};

export default function OperatoreList({ operatori, onEdit, onDelete }: Props) {
  return (
    <table className="min-w-full">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Ruolo</th>
          <th>Email</th>
          <th>Stato</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {operatori.map(o => (
          <tr key={o.id}>
            <td>{o.nome}</td>
            <td>{o.ruolo}</td>
            <td>{o.email}</td>
            <td>{o.stato}</td>
            <td>
              <button onClick={() => onEdit(o)} className="mr-2 text-blue-700">Modifica</button>
              <button onClick={() => onDelete(o.id)} className="mr-2 text-red-700">Elimina</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
