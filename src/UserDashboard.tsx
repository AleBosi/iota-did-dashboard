import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import HistoryTable from "./HistoryTable";
import ImportPage from "./ImportPage";
import UserCreditsHistory from "./UserCreditsHistory";
import { getUserCredits, consumeCredit } from "./creditUtils";

// --- Helpers per tipologie/prodotti configurate dal Creator
function loadTypes(companyDid: string) {
  try { return JSON.parse(localStorage.getItem(`creator_types_${companyDid}`) || "[]"); } catch { return []; }
}
function loadBOM(companyDid: string) {
  try { return JSON.parse(localStorage.getItem(`creator_bom_${companyDid}`) || "[]"); } catch { return []; }
}

interface UserDashboardProps {
  azienda: any;
  utente: any;
  logout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ azienda, utente, logout }) => {
  const [page, setPage] = useState<"vc" | "history" | "import" | "events" | "credits">("vc");
  const [vcHistory, setVcHistory] = useState<any[]>([]);
  const [crediti, setCrediti] = useState<number>(0);

  // === Load tipologie permessi e BOM
  const [types, setTypes] = useState<any[]>([]);
  const [bom, setBOM] = useState<any[]>([]);

  useEffect(() => {
    setTypes(loadTypes(azienda.companyDid));
    setBOM(loadBOM(azienda.companyDid));
  }, [azienda.companyDid]);

  // Carica storico VC e saldo crediti all’avvio o al cambio utente
  useEffect(() => {
    const userDid = utente?.did;
    if (userDid) {
      try {
        const raw = localStorage.getItem(`vc_history_${userDid}`);
        let arr = raw ? JSON.parse(raw) : [];
        arr.forEach(vc => { if (!vc._uid) vc._uid = Math.random().toString(36).substring(2) + Date.now().toString(36); });
        setVcHistory(arr);
      } catch {
        setVcHistory([]);
      }
      setCrediti(getUserCredits(userDid)?.saldo ?? 0);
    }
  }, [utente]);

  // Aggiorna storico VC in localStorage e stato
  const saveHistory = (arr: any[]) => {
    localStorage.setItem(`vc_history_${utente.did}`, JSON.stringify(arr));
    setVcHistory(arr);
  };

  // --- Permessi: ricava tipologie abilitate per l'utente/macchina ---
  const myTypes = types.filter(t => t.allowedMembers?.includes(utente.did));

  // Crea nuovo prodotto (con form guidato da tipologia/campi Creator)
  const handleCreateProduct = async (product: any) => {
    const did = utente.did;
    try {
      consumeCredit(did, "Emissione nuovo prodotto DPP");
      setCrediti(getUserCredits(did)?.saldo ?? 0);
    } catch (e: any) {
      alert(e.message || "Crediti esauriti.");
      return false;
    }
    // Aggiungi alla storia VC
    const arr = [
      ...vcHistory,
      {
        ...product,
        _uid: Math.random().toString(36).substring(2) + Date.now().toString(36),
        createdBy: did,
        createdAt: new Date().toISOString(),
      },
    ];
    saveHistory(arr);
    return true;
  };

  // Import VC
  const handleImportVC = async (vc: any) => {
    const arr = [...vcHistory, { ...vc, _uid: Math.random().toString(36).substring(2) + Date.now().toString(36) }];
    saveHistory(arr);
  };

  // Aggiorna VC (per evento prodotto, consuma credito se serve)
  const handleUpdateItem = (idx: number, updatedVc: any, consume?: boolean) => {
    const did = utente.did;
    if (consume) {
      try {
        consumeCredit(did, "Evento su prodotto");
        setCrediti(getUserCredits(did)?.saldo ?? 0);
      } catch (e: any) {
        alert(e.message || "Crediti esauriti.");
        return;
      }
    }
    const arr = [...vcHistory];
    arr[idx] = updatedVc;
    saveHistory(arr);
  };

  // --- Header dashboard (Tailwind!) ---
  const header = (
    <div className="p-6 border-b border-gray-200 mb-5 bg-white">
      <h1 className="mb-2.5 text-2xl font-bold text-blue-900">
        Dashboard operatore/macchinario
      </h1>
      <div className="mb-1">
        <b>Azienda:</b> {azienda?.companyName}
      </div>
      <div className="mb-1">
        <b>DID azienda:</b> <span className="font-mono">{azienda?.companyDid}</span>
      </div>
      <div>
        <b>Utente/macchinario:</b> {utente?.name || utente?.matricola}
        <span className="bg-blue-200 text-blue-900 px-2 py-0.5 rounded-md font-semibold ml-2 text-base">
          {utente?.role && `(${utente.role})`}
        </span>
        <br />
        <span className="font-mono text-blue-400 text-sm">{utente?.did}</span>
      </div>
    </div>
  );

  // --- Render contenuto pagina ---
  let content = null;
  if (page === "vc") {
    content = (
      <ProductCreatorForm
        tipologie={myTypes}
        onCreate={handleCreateProduct}
      />
    );
  } else if (page === "history") {
    content = (
      <HistoryTable
        items={vcHistory}
        setHistory={saveHistory}
        fullHistory={vcHistory}
        did={utente.did}
      />
    );
  } else if (page === "import") {
    content = <ImportPage onImport={handleImportVC} did={utente.did} />;
  } else if (page === "events") {
    content = (
      <EventsPageCustom
        items={vcHistory}
        onUpdateItem={handleUpdateItem}
        tipologie={types}
      />
    );
  } else if (page === "credits") {
    content = <UserCreditsHistory did={utente.did} />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar
        page={page}
        setPage={setPage}
        did={utente.did}
        onLogout={logout}
        crediti={crediti}
      />
      <div className="ml-72 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          {header}
          <div className="p-8">{content}</div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

// === FORM CREAZIONE PRODOTTO DINAMICO ===
function ProductCreatorForm({ tipologie, onCreate }) {
  const [typeId, setTypeId] = useState("");
  const [fields, setFields] = useState({});
  const type = tipologie.find(t => t.id === typeId);

  function handleChange(fieldId, value) {
    setFields(f => ({ ...f, [fieldId]: value }));
  }

  function handleTableChange(fieldId, rowIdx, colId, value) {
    setFields(f => {
      const table = Array.isArray(f[fieldId]) ? [...f[fieldId]] : [];
      if (!table[rowIdx]) table[rowIdx] = {};
      table[rowIdx][colId] = value;
      return { ...f, [fieldId]: table };
    });
  }

  function addTableRow(fieldId, columns) {
    setFields(f => {
      const table = Array.isArray(f[fieldId]) ? [...f[fieldId]] : [];
      // Row with empty fields for each column
      const row = {};
      columns.forEach(col => { row[col.id] = ""; });
      return { ...f, [fieldId]: [...table, row] };
    });
  }
  function removeTableRow(fieldId, idx) {
    setFields(f => {
      const table = Array.isArray(f[fieldId]) ? [...f[fieldId]] : [];
      table.splice(idx, 1);
      return { ...f, [fieldId]: table };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!typeId) return alert("Seleziona una tipologia!");
    for (let f of type.fields) {
      if (f.type === "table") {
        // Opzionale: almeno una riga
      } else if (!fields[f.id]) {
        return alert(`Compila il campo ${f.label}`);
      }
    }
    onCreate({
      typeId,
      typeName: type.name,
      fieldValues: fields,
    });
    setTypeId("");
    setFields({});
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-md max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-4">Crea nuovo prodotto</h2>
      <select
        className="mb-4 w-full border px-3 py-2 rounded"
        value={typeId}
        onChange={e => { setTypeId(e.target.value); setFields({}); }}
        required
      >
        <option value="">Seleziona tipologia prodotto...</option>
        {tipologie.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      {type && type.fields.map(f => (
        <div key={f.id} className="mb-3">
          <label className="block mb-1">{f.label}</label>
          {f.type === "table" && f.columns ? (
            <TableInput
              columns={f.columns}
              value={fields[f.id] || []}
              onChange={(rowIdx, colId, value) => handleTableChange(f.id, rowIdx, colId, value)}
              onAddRow={() => addTableRow(f.id, f.columns)}
              onRemoveRow={idx => removeTableRow(f.id, idx)}
            />
          ) : (
            <input
              className="w-full border px-2 py-1 rounded"
              type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
              value={fields[f.id] || ""}
              onChange={e => handleChange(f.id, e.target.value)}
              required
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="bg-green-700 text-white px-5 py-2 rounded font-bold mt-4"
      >
        Salva prodotto
      </button>
    </form>
  );
}

// === TABLE INPUT (usato per i campi tabellari) ===
function TableInput({ columns, value, onChange, onAddRow, onRemoveRow }) {
  return (
    <div className="mb-2">
      <table className="w-full border bg-gray-50 rounded">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.id} className="p-1 text-left text-xs font-bold">{col.label}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(value || []).map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td key={col.id}>
                  <input
                    type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
                    className="w-full border px-2 py-1 rounded"
                    value={row[col.id] || ""}
                    onChange={e => onChange(i, col.id, e.target.value)}
                  />
                </td>
              ))}
              <td>
                <button type="button" className="text-red-600 text-xl font-bold" onClick={() => onRemoveRow(i)}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        className="mt-2 text-green-700 font-semibold"
        onClick={onAddRow}
      >+ Aggiungi riga</button>
    </div>
  );
}

// === EVENTI PERSONALIZZATI ===
function EventsPageCustom({ items, onUpdateItem, tipologie }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [desc, setDesc] = useState("");
  const [eventFields, setEventFields] = useState({});
  const [rows, setRows] = useState<{ [key: string]: any[] }>({});

  // Trova la tipologia del prodotto selezionato
  const selectedItem = selectedIdx !== null ? items[selectedIdx] : null;
  const productType = selectedItem ? tipologie.find(t => t.id === selectedItem.typeId) : null;

  function handleChangeField(fieldId, value) {
    setEventFields(f => ({ ...f, [fieldId]: value }));
  }

  function handleTableChange(fieldId, rowIdx, colId, value) {
    setRows(prevRows => {
      const table = Array.isArray(prevRows[fieldId]) ? [...prevRows[fieldId]] : [];
      if (!table[rowIdx]) table[rowIdx] = {};
      table[rowIdx][colId] = value;
      return { ...prevRows, [fieldId]: table };
    });
  }
  function addTableRow(fieldId, columns) {
    setRows(prevRows => {
      const table = Array.isArray(prevRows[fieldId]) ? [...prevRows[fieldId]] : [];
      const row = {};
      columns.forEach(col => { row[col.id] = ""; });
      return { ...prevRows, [fieldId]: [...table, row] };
    });
  }
  function removeTableRow(fieldId, idx) {
    setRows(prevRows => {
      const table = Array.isArray(prevRows[fieldId]) ? [...prevRows[fieldId]] : [];
      table.splice(idx, 1);
      return { ...prevRows, [fieldId]: table };
    });
  }

  function handleAddEvent() {
    if (!desc && (!productType || !productType.eventFields.some(f =>
      (f.type === "table" && rows[f.id]?.length > 0) ||
      (f.type !== "table" && eventFields[f.id])
    ))) {
      alert("Compila almeno una descrizione o un campo evento!");
      return;
    }
    const prod = { ...items[selectedIdx] };
    const eventData: any = {
      descrizione: desc,
      data: new Date().toISOString(),
      fields: { ...eventFields },
      tableFields: { ...rows }
    };
    prod.eventHistory = Array.isArray(prod.eventHistory) ? [...prod.eventHistory] : [];
    prod.eventHistory.push(eventData);
    onUpdateItem(selectedIdx, prod, true);
    setDesc("");
    setEventFields({});
    setRows({});
  }

  function handleBack() {
    setSelectedIdx(null);
    setDesc("");
    setEventFields({});
    setRows({});
  }

  const events = selectedItem?.eventHistory || [];

  if (selectedIdx === null) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Eventi sui prodotti</h1>
        <div className="mb-4 text-gray-600">
          Seleziona un prodotto per aggiungere eventi descrittivi o tabellari.
        </div>
        <ul className="pl-0">
          {items.map((prod, idx) => (
            <li
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className="flex items-center gap-3 cursor-pointer py-2 border-b border-gray-200 list-none text-gray-800 font-medium hover:bg-gray-50 transition"
            >
              <span className="font-mono">{prod.typeName}</span>
              <span className="opacity-60 ml-2">{Object.values(prod.fieldValues)[0]}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleBack} className="mb-4">← Indietro</button>
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        Eventi per prodotto:{" "}
        <span className="font-mono">{selectedItem.typeName}</span>
      </h2>
      <div className="mb-6">
        <textarea
          placeholder="Descrizione evento"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full min-h-[48px] mt-2 mb-3 rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-vertical"
        />
        {productType && productType.eventFields.map(f => (
          <div key={f.id} className="mb-3">
            <label className="block mb-1">{f.label}</label>
            {f.type === "table" && f.columns ? (
              <TableInput
                columns={f.columns}
                value={rows[f.id] || []}
                onChange={(rowIdx, colId, value) => handleTableChange(f.id, rowIdx, colId, value)}
                onAddRow={() => addTableRow(f.id, f.columns)}
                onRemoveRow={idx => removeTableRow(f.id, idx)}
              />
            ) : (
              <input
                className="w-full border px-2 py-1 rounded"
                type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                value={eventFields[f.id] || ""}
                onChange={e => handleChangeField(f.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleAddEvent}
        className="mb-6 bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded font-bold"
      >
        Aggiungi evento
      </button>
      <h3 className="text-lg font-semibold mb-2">Storico eventi</h3>
      {events.length === 0 && <div className="text-gray-500 mb-3">Nessun evento.</div>}
      <ul>
        {events.map((e, i) => (
          <li key={i} className="bg-gray-100 rounded-lg p-4 mb-3">
            <div className="font-mono text-xs mb-1 text-gray-600">{e.data.split("T")[0]}</div>
            {e.descrizione && <div>{e.descrizione}</div>}
            {/* Visualizza campi evento */}
            {e.fields && Object.entries(e.fields).length > 0 && (
              <div className="mt-1">
                <b>Campi evento:</b>
                <ul>
                  {Object.entries(e.fields).map(([key, val]) => (
                    <li key={key} className="text-xs">{key}: {val}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Visualizza campi tabellari */}
            {e.tableFields && Object.entries(e.tableFields).map(([key, rows]) => rows.length > 0 && (
              <div key={key} className="mt-2">
                <b>Tabella {key}:</b>
                <table className="w-full border mt-1 bg-white text-xs">
                  <thead>
                    <tr>
                      {rows[0] && Object.keys(rows[0]).map(col => <th key={col} className="p-1">{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri}>
                        {Object.values(row).map((cell, ci) => <td key={ci} className="p-1">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
