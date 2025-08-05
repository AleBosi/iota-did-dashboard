import { Azienda } from "../../../models/azienda";

type Props = {
  aziende: Azienda[];
  onSelect?: (azienda: Azienda) => void;
  onDelete?: (id: string) => void;
};

const AziendaList = ({ aziende, onSelect, onDelete }: Props) => {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Lista Aziende</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2">Nome</th>
            <th className="text-left py-2">P.IVA</th>
            <th className="text-left py-2">DID</th>
            <th className="text-left py-2">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {aziende.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                Nessuna azienda presente
              </td>
            </tr>
          )}
          {aziende.map(az => (
            <tr key={az.id} className="border-t hover:bg-gray-50">
              <td className="py-2 font-semibold">{az.name}</td>
              <td className="py-2 text-xs text-gray-500">{az.legalInfo?.vat || "-"}</td>
              <td className="py-2 text-xs text-gray-400">{az.did ?? az.id}</td>
              <td className="py-2 flex gap-2">
                {onSelect && (
                  <button
                    className="px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                    onClick={() => onSelect(az)}
                  >
                    Dettagli
                  </button>
                )}
                {onDelete && (
                  <button
                    className="px-2 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                    onClick={() => onDelete(az.id)}
                  >
                    Elimina
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AziendaList;
