import React from "react";
import { Macchinario } from "./TipoMacchinario";

type Props = {
  macchinari: Macchinario[];
  onEdit: (m: Macchinario) => void;
  onDelete: (id: string) => void;
  onAggiungiVC: (m: Macchinario) => void;
};

export default function MacchinarioList({ macchinari, onEdit, onDelete, onAggiungiVC }: Props) {
  return (
    <table className="min-w-full">
      <thead>
        <tr>
          <th>Matricola</th>
          <th>Nome</th>
          <th>Linea</th>
          <th>Reparto</th>
          <th>Stabilimento</th>
          <th>Stato</th>
          <th>DID</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {macchinari.map(m => (
          <tr key={m.id}>
            <td>{m.matricola}</td>
            <td>{m.nome}</td>
            <td>{m.linea}</td>
            <td>{m.reparto}</td>
            <td>{m.stabilimento}</td>
            <td>{m.stato}</td>
            <td style={{maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis'}} className="font-mono text-xs">{m.did}</td>
            <td>
              <button onClick={() => onEdit(m)} className="mr-2 text-blue-700">Modifica</button>
              <button onClick={() => onDelete(m.id)} className="mr-2 text-red-700">Elimina</button>
              <button onClick={() => onAggiungiVC(m)} className="ml-2 text-indigo-700">+ VC</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
