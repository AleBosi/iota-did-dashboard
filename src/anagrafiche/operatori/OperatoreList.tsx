import React from "react";
import { Operatore } from "./OperatoreType";

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
          <th>Cognome</th>
          <th>Matricola</th>
          <th>Reparto</th>
          <th>Squadra</th>
          <th>Stabilimento</th>
          <th>Ruolo</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {operatori.map(o => (
          <tr key={o.id}>
            <td>{o.nome}</td>
            <td>{o.cognome}</td>
            <td>{o.matricola}</td>
            <td>{o.reparto}</td>
            <td>{o.squadra}</td>
            <td>{o.stabilimento}</td>
            <td>{o.ruolo}</td>
            <td>
              <button onClick={() => onEdit(o)} className="mr-2 text-blue-700">Modifica</button>
              <button onClick={() => onDelete(o.id)} className="text-red-700">Elimina</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
