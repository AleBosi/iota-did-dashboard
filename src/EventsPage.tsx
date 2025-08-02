import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VerifyFlag from "./VerifyFlag"; // Deve ritornare un'icona ✅ o ❌

export default function EventsPage({
  items,
  onUpdateItem,
}: {
  items: any[];
  onUpdateItem: (idx: number, prod: any, decrementa: boolean) => void;
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [desc, setDesc] = useState("");
  const [table, setTable] = useState([{ campo: "", valore: "" }]);
  const [serialFilter, setSerialFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [validFilter, setValidFilter] = useState<"all" | "valid" | "invalid">("all");

  // --- Funzione di validazione (usa la stessa di VerifyFlag se puoi)
  function isValid(vc: any) {
    // Se usi una logica custom per la verifica della validità, mettila qui.
    // Ad esempio, se la VC ha già un campo _isValid (popolato da VerifyFlag)
    if (typeof vc._isValid === "boolean") return vc._isValid;
    // Fallback: se manca il campo, considera valido (o aggiungi la tua logica di hash qui)
    return true;
  }

  // Ordina per ultimi prima (reverse) e applica tutti i filtri, inclusa validità
  const filteredItems = items
    .slice()
    .reverse()
    .filter((item) => {
      const serial = item.credentialSubject.id?.split(":").pop()?.toLowerCase() || "";
      const model = item.credentialSubject.model?.toLowerCase() || "";
      // Filtro validità
      const valid = isValid(item);
      if (validFilter === "valid" && !valid) return false;
      if (validFilter === "invalid" && valid) return false;
      // Filtro seriale/modello
      return (
        serial.includes(serialFilter.toLowerCase()) &&
        model.includes(modelFilter.toLowerCase())
      );
    });

  if (selectedIdx === null) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Eventi sui prodotti</h1>
        <div className="mb-4 text-gray-600">
          Seleziona un prodotto per aggiungere eventi descrittivi o tabellari.
        </div>

        {/* FILTRI */}
        <div className="flex gap-4 mb-4 items-center">
          <Input
            placeholder="Filtra per seriale"
            value={serialFilter}
            onChange={(e) => setSerialFilter(e.target.value)}
          />
          <Input
            placeholder="Filtra per modello"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
          />
          <select
            value={validFilter}
            onChange={(e) => setValidFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700"
            style={{ minWidth: 130 }}
          >
            <option value="all">Tutti</option>
            <option value="valid">✅ Validi</option>
            <option value="invalid">❌ Non validi</option>
          </select>
        </div>

        {/* LISTA FILTRATA CON VERIFYFLAG */}
        <ul className="pl-0">
          {filteredItems.map((vc, idx) => (
            <li
              key={idx}
              onClick={() => setSelectedIdx(items.indexOf(vc))}
              className="flex items-center gap-3 cursor-pointer py-2 border-b border-gray-200 list-none text-gray-800 font-medium hover:bg-gray-50 transition"
            >
              <VerifyFlag vc={vc} />
              <span className="font-mono">
                {vc.credentialSubject.id?.split(":").pop()}
              </span>
              <span className="opacity-60 ml-2">#{vc.credentialSubject.model}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function handleAddEvent() {
    if (!desc && table.every((row) => !row.campo || !row.valore)) {
      alert("Compila almeno un campo evento!");
      return;
    }
    const prod = { ...items[selectedIdx] };
    const newEvent = {
      descrizione: desc,
      tabella: table.filter((row) => row.campo && row.valore),
      data: new Date().toISOString(),
    };
    prod.eventHistory = Array.isArray(prod.eventHistory) ? [...prod.eventHistory] : [];
    prod.eventHistory.push(newEvent);
    onUpdateItem(selectedIdx, prod, true);
    setDesc("");
    setTable([{ campo: "", valore: "" }]);
  }

  function handleTableChange(i: number, key: string, value: string) {
    setTable((tbl) => tbl.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));
  }

  function handleAddRow() {
    setTable((tbl) => [...tbl, { campo: "", valore: "" }]);
  }

  function handleBack() {
    setSelectedIdx(null);
    setDesc("");
    setTable([{ campo: "", valore: "" }]);
  }

  const events = items[selectedIdx]?.eventHistory || [];

  return (
    <div>
      <Button
        onClick={handleBack}
        variant="outline"
        className="mb-4"
      >
        ← Indietro
      </Button>

      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Eventi per prodotto:{" "}
        <span className="font-mono">
          {items[selectedIdx].credentialSubject.id?.split(":").pop()}
        </span>{" "}
        <span className="opacity-60">
          #{items[selectedIdx].credentialSubject.model}
        </span>
      </h2>

      {/* FORM INSERIMENTO EVENTO */}
      <div className="mb-6">
        <textarea
          placeholder="Descrizione evento"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full min-h-[48px] mt-2 mb-3 rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-vertical"
        />
        <p className="font-semibold mb-2">Tabella campi evento:</p>
        {table.map((row, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <Input
              placeholder="Campo"
              value={row.campo}
              onChange={(e) => handleTableChange(i, "campo", e.target.value)}
            />
            <Input
              placeholder="Valore"
              value={row.valore}
              onChange={(e) => handleTableChange(i, "valore", e.target.value)}
            />
          </div>
        ))}
        <Button
          onClick={handleAddRow}
          variant="default"
          size="sm"
          className="mt-2 mb-4"
        >
          + Riga
        </Button>
      </div>

      <Button
        onClick={handleAddEvent}
        variant="default"
        className="mb-6 bg-green-700 hover:bg-green-800"
      >
        Aggiungi evento
      </Button>

      {/* STORICO EVENTI */}
      <h3 className="text-lg font-bold mb-1">Storico eventi</h3>
      {events.length === 0 && (
        <div className="text-gray-400">Nessun evento.</div>
      )}
      <ul>
        {events.map((e: any, i: number) => (
          <li
            key={i}
            className="bg-gray-50 rounded-xl p-4 my-2 border border-gray-200"
          >
            <b>{e.data.split("T")[0]}</b>: {e.descrizione}
            {e.tabella && e.tabella.length > 0 && (
              <table className="mt-2 w-full bg-white rounded shadow border border-gray-200">
                <tbody>
                  {e.tabella.map((row: any, j: number) => (
                    <tr key={j}>
                      <td className="border border-gray-200 p-2">{row.campo}</td>
                      <td className="border border-gray-200 p-2">{row.valore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
