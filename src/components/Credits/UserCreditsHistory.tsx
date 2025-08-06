export interface CreditHistoryItem {
  id: string;
  date: string; // ISO
  from?: string; // chi ha assegnato
  to?: string;   // destinatario
  qty: number;   // quantità (+/-)
  reason?: string;
}

interface Props {
  history: CreditHistoryItem[];
  did?: string;
}

export default function UserCreditsHistory({ history, did }: Props) {
  return (
    <div>
      {did && (
        <div className="text-xs text-blue-600 mb-1" data-testid="main-did">
          DID: <span className="font-mono">{did}</span>
        </div>
      )}
      {(!history || history.length === 0) ? (
        <div className="text-gray-400">Nessun movimento crediti.</div>
      ) : (
        <>
          <h3 className="font-semibold mb-2">Storico movimenti crediti</h3>
          <ul className="divide-y">
            {history.map(item => (
              <li key={item.id} className="py-2 flex items-center gap-3">
                <span className={`font-mono w-20 ${item.qty > 0 ? "text-green-600" : "text-red-600"}`}>
                  {item.qty > 0 ? "+" : ""}
                  {item.qty}
                </span>
                <span className="text-xs text-gray-500 w-36">{new Date(item.date).toLocaleString()}</span>
                {item.from && (
                  <span className="text-xs text-gray-400">da: <span className="font-mono">{item.from}</span></span>
                )}
                {item.to && (
                  <span className="text-xs text-gray-400">a: <span className="font-mono">{item.to}</span></span>
                )}
                {item.reason && <span className="ml-2">{item.reason}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
