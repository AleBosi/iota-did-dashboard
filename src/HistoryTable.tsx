import React, { useState } from "react";
import VerifyFlag from "./VerifyFlag";
import HashDisplay from "./HashDisplay";
import CopyJsonBox from "./CopyJsonBox";
import { ClipboardCopy } from "lucide-react";

export default function HistoryTable({
  items,
  setHistory,
  fullHistory,
  did,
}: {
  items: any[];
  setHistory: (arr: any[]) => void;
  fullHistory: any[];
  did: string;
}) {
  const [expandedIdx, setExpandedIdx] = useState<string | null>(null);
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [filterSerial, setFilterSerial] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [copiedHashIdx, setCopiedHashIdx] = useState<string | null>(null);

  const filteredItems = items.filter(
    (vc) =>
      (filterSerial === "" ||
        (vc.credentialSubject.id ?? "")
          .toLowerCase()
          .includes(filterSerial.toLowerCase())) &&
      (filterModel === "" ||
        (vc.credentialSubject.model ?? "")
          .toLowerCase()
          .includes(filterModel.toLowerCase()))
  );
  const filteredReversed = [...filteredItems].reverse();
  const rowKeys = filteredReversed.map((vc, idx) => vc._uid + "_" + idx);

  function toggleSelect(uid: string, idx: number) {
    const key = uid + "_" + idx;
    setSelectedUids((sel) =>
      sel.includes(key) ? sel.filter((i) => i !== key) : [...sel, key]
    );
  }

  function selectAll() {
    setSelectedUids(rowKeys);
  }

  function unselectAll() {
    setSelectedUids([]);
  }

  function handleDeleteSelected() {
    const selectedUidsSet = new Set(
      selectedUids.map((k) =>
        filteredReversed.find((vc, idx) => vc._uid + "_" + idx === k)?._uid
      )
    );
    setHistory(fullHistory.filter((vc) => !selectedUidsSet.has(vc._uid)));
    setSelectedUids([]);
    setExpandedIdx(null);
  }

  function handleCopyHash(hash: string, key: string) {
    navigator.clipboard.writeText(hash);
    setCopiedHashIdx(key);
    setTimeout(() => setCopiedHashIdx(null), 1300);
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-800">
        Storico prodotti generati
      </h1>
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Filtra per seriale"
          value={filterSerial}
          onChange={(e) => setFilterSerial(e.target.value)}
        />
        <input
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Filtra per modello"
          value={filterModel}
          onChange={(e) => setFilterModel(e.target.value)}
        />
        <button
          onClick={selectAll}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          Seleziona tutto
        </button>
        <button
          onClick={unselectAll}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-lg transition"
        >
          Deseleziona tutto
        </button>
        <button onClick={handleDeleteSelected} className="btn-danger">
          Elimina selezionati
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full rounded-lg overflow-hidden shadow">
          <thead>
            <tr className="bg-green-900">
              <th className="px-3 py-3"></th>
              <th className="px-3 py-3"></th>
              <th className="px-3 py-3 text-white text-lg font-bold">Seriale</th>
              <th className="px-3 py-3 text-white text-lg font-bold">Modello</th>
              <th className="px-3 py-3 text-white text-lg font-bold">Dettagli</th>
              <th className="px-3 py-3 text-white text-lg font-bold">Hash</th>
            </tr>
          </thead>
          <tbody>
            {filteredReversed.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  Nessun prodotto trovato.
                </td>
              </tr>
            )}
            {filteredReversed.map((vc, idx) => {
              const uniqueKey = vc._uid + "_" + idx;
              const isExpanded = expandedIdx === uniqueKey;
              const hash = vc.proof?.jws || vc.hash || "";
              return (
                <React.Fragment key={uniqueKey}>
                  <tr className={isExpanded ? "bg-green-50" : "bg-white"}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedUids.includes(uniqueKey)}
                        onChange={() => toggleSelect(vc._uid, idx)}
                        className="w-5 h-5 accent-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <VerifyFlag vc={vc} />
                    </td>
                    <td className="px-3 py-2 font-mono text-gray-800 font-semibold">
                      {(vc.credentialSubject.id ?? "").split(":").pop()}
                    </td>
                    <td className="px-3 py-2 text-gray-800">
                      {vc.credentialSubject.model}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        className="bg-gray-100 text-gray-800 font-bold px-5 py-2 rounded-lg border hover:bg-gray-200 transition"
                        onClick={() =>
                          setExpandedIdx(isExpanded ? null : uniqueKey)
                        }
                      >
                        {isExpanded ? "Nascondi" : "Dettagli"}
                      </button>
                    </td>
                    <td className="px-3 py-2 font-mono text-[13px] max-w-[260px] overflow-auto whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-100 ${
                          copiedHashIdx === uniqueKey ? "ring-2 ring-green-400" : ""
                        }`}
                      >
                        <button
                          onClick={() => handleCopyHash(hash, uniqueKey)}
                          className={`mr-1 p-1 rounded-md hover:bg-gray-200 transition ${
                            copiedHashIdx === uniqueKey ? "bg-green-200" : ""
                          }`}
                          title="Copia hash"
                          tabIndex={-1}
                        >
                          <ClipboardCopy size={18} />
                        </button>
                        <span className="text-gray-800 select-all">{hash}</span>
                      </span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="relative p-0 bg-white">
                        <div className="rounded-lg m-4 overflow-x-auto bg-white p-2 border border-gray-200">
                          <CopyJsonBox jsonObj={vc} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
