import { useState } from "react";

export interface HistoryRow {
  id: string;
  date: string;
  description: string;
}

interface Props {
  rows: HistoryRow[];
  onSelect?: (row: HistoryRow) => void;
}

export default function HistoryTable({ rows, onSelect }: Props) {
  const [selected, setSelected] = useState<HistoryRow | null>(null);

  return (
    <div className="flex gap-8">
      <table className="w-1/2 border mb-2 text-sm">
        <thead>
          <tr>
            <th className="border px-2">Data</th>
            <th className="border px-2">Descrizione</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={row.id}
              className="cursor-pointer hover:bg-blue-50"
              onClick={() => {
                setSelected(row);
                onSelect?.(row);
              }}
            >
              <td className="border px-2">{row.date}</td>
              <td className="border px-2">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="w-1/2">
        {selected && <HistoryRowDetails row={selected} />}
      </div>
    </div>
  );
}

// HistoryRowDetails (interno):
function HistoryRowDetails({ row }: { row: HistoryRow }) {
  if (!row) return null;
  return (
    <div className="border rounded p-4 bg-gray-50 mb-2">
      <div><b>ID:</b> {row.id}</div>
      <div><b>Data:</b> {row.date}</div>
      <div><b>Descrizione:</b> {row.description}</div>
    </div>
  );
}
