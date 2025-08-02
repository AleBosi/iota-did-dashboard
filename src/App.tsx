import React, { useState, useEffect, useRef } from "react";
import SeedLogin from "./SeedLogin";
import AziendaDashboard from "./AziendaDashboard";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import CreatorDashboard from "./CreatorDashboard"; // <--- IMPORT AGGIUNTO
import {
  getUserCredits,
  consumeCredit,
  getUserHistory,
  setUserCredits,
} from "./creditUtils";
import { ethers } from "ethers";

export default function App() {
  // Stato per aziende loggate
  const [azienda, setAzienda] = useState(null);  // oggetto azienda completo
  // Stato per membro utente/macchinario loggato
  const [utente, setUtente] = useState(null);    // oggetto utente/macchina

  // Stato per area amministratore (come già avevi)
  const [adminStep, setAdminStep] = useState<"login" | "dashboard" | null>(null);

  // === PRIORITÀ 1: AREA AMMINISTRATORE ===
  if (adminStep === "login") {
    return (
      <AdminLogin
        onLogin={() => setAdminStep("dashboard")}
        onBack={() => setAdminStep(null)}
      />
    );
  }
  if (adminStep === "dashboard") {
    return <AdminDashboard onLogout={() => setAdminStep(null)} />;
  }

  // === LOGIN INIZIALE: azienda o utente/macchinario ===
  if (!azienda && !utente) {
    return (
      <div>
        <SeedLogin
          // Callback: login azienda (azienda = oggetto completo)
          onAziendaLogin={companyObj => setAzienda(companyObj)}
          // Callback: login membro (ricevi {company, member})
          onUtenteLogin={({ company, member }) => {
            setAzienda(company);
            setUtente(member);
          }}
        />
        {/* Bottone area admin */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            onClick={() => setAdminStep("login")}
            style={{
              background: "#212736",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: 6,
              padding: "6px 24px",
              fontSize: 18
            }}
          >
            Area Riservata Amministratore
          </button>
        </div>
      </div>
    );
  }

  // === LOGGATO COME AZIENDA (non utente) ===
  if (azienda && !utente) {
    return (
      <AziendaDashboard
        company={azienda}
        logout={() => setAzienda(null)}
      />
    );
  }

  // === LOGGATO COME UTENTE/MACCHINA o CREATOR ===
  if (azienda && utente) {
    // Se il ruolo è "Creator", mostra la dashboard dedicata
    if (utente.role === "Creator") {
      return (
        <CreatorDashboard
          azienda={azienda}
          creator={utente}
          logout={() => { setAzienda(null); setUtente(null); }}
        />
      );
    }
    // Altrimenti dashboard operatore/macchina
    return (
      <UserDashboard
        azienda={azienda}
        utente={utente}
        logout={() => { setAzienda(null); setUtente(null); }}
      />
    );
  }
}

// --- SHA-256 hash utility ---
async function sha256(str) {
  const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- UID univoco (NON incluso nell'hash della proof) ---
function genUID() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// --- SERIALIZZAZIONE DETERMINISTICA ---
function deterministicStringify(obj) {
  if (Array.isArray(obj)) {
    return `[${obj.map(deterministicStringify).join(",")}]`;
  } else if (obj && typeof obj === "object") {
    return `{${Object.keys(obj).sort().map(
      key => JSON.stringify(key) + ":" + deterministicStringify(obj[key])
    ).join(",")}}`;
  } else {
    return JSON.stringify(obj);
  }
}

// --- MOCK "FIRMA" SU VC (hash contenuto, proof e _uid ESCLUSI) ---
async function addProofMock(vc, did) {
  // Elimina proof e _uid PRIMA di serializzare!
  const { proof, _uid, ...credential } = vc;
  const hash = await sha256(deterministicStringify(credential));
  return {
    ...credential,
    proof: {
      type: "EcdsaSecp256k1Signature2019",
      jws: hash,
      verificationMethod: did
    },
    // Mantieni l'uid se già presente (import, update), altrimenti omesso
    ...(vc._uid ? { _uid: vc._uid } : {})
  };
}

// --- Helper: crea DID da address ---
function getDid(address) {
  return address ? `did:iota:evm:${address}` : "";
}

// --- VERIFICA PROOF (hash del contenuto, proof e _uid ESCLUSI) ---
async function verifyProof(vc) {
  if (!vc?.proof?.jws || !vc?.proof?.verificationMethod) return false;
  // Elimina proof e _uid PRIMA di serializzare!
  const { proof, _uid, ...credential } = vc;
  const hash = await sha256(deterministicStringify(credential));
  return hash === vc.proof.jws;
}

// --- FLAG GRAFICO VERIFICA ---
function VerifyFlag({ vc }) {
  const [valid, setValid] = React.useState(null);

  useEffect(() => {
    let mounted = true;
    verifyProof(vc).then(res => { if (mounted) setValid(res); });
    return () => { mounted = false; };
  }, [vc]);

  if (valid == null) return <span style={{ fontSize: 18, marginLeft: 10 }}>⏳</span>;
  return (
    <span style={{ fontSize: 18, marginLeft: 10 }}>
      {valid ? "✅" : "❌"}
    </span>
  );
}

// --- LocalStorage STORICO VC ---
function getHistoryKey(did) {
  return `vc_history_${did}`;
}
function loadHistory(did) {
  try {
    const raw = localStorage.getItem(getHistoryKey(did));
    let arr = raw ? JSON.parse(raw) : [];
    // Assegna _uid a ogni oggetto se mancante
    arr.forEach(vc => { if (!vc._uid) vc._uid = genUID(); });
    return arr;
  } catch {
    return [];
  }
}
function saveHistory(did, arr) {
  localStorage.setItem(getHistoryKey(did), JSON.stringify(arr));
}

// --- User Credits History PAGE ---
function UserCreditsHistory({ did }) {
  // Preleva gli eventi e li ordina dal più recente al più antico
  const events = getUserHistory(did).slice().reverse(); // <-- AGGIUNGI .reverse()

  if (!events.length) return <div>Nessun movimento crediti.</div>;
  return (
    <div>
      <h2>Storico crediti</h2>
      <ul style={{ fontFamily: "monospace" }}>
        {events.map((e, i) => (
          <li key={i}>
            [{new Date(e.data).toLocaleString()}] {e.tipo === "assegnazione" ? "➕" : "➖"} {e.descrizione} ({e.delta})
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- SIDEBAR (aggiungi voce storico crediti) ---
function Sidebar({ page, setPage, did, onLogout, crediti }) {
  return (
    <nav style={{
      width: 280,
      background: "#2a2a2aff",
      color: "#fff",
      padding: 0,
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      borderRight: "1px solid #ddd",
      justifyContent: "space-between"
    }}>
      <div>
        <div style={{ padding: "24px 24px 6px", borderBottom: "1px solid #394050" }}>
          <b style={{ fontSize: 36 }}>TRUSTUP</b>
          <div
            style={{
              wordBreak: "break-all",
              fontFamily: "monospace",
              fontWeight: "bold",
              marginTop: 16,
              background: "#2a3140",
              borderRadius: 5,
              padding: 10,
              color: "#c0e7ff",
              fontSize: 14,
            }}
          >
            {did}
          </div>
          {/* CAMPO CREDITI */}
          <div style={{
            marginTop: 10,
            background: "#363636ff",
            borderRadius: 5,
            padding: "8px 10px",
            color: "#b5b5b5ff",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            fontSize: 18
          }}>
            Crediti: <span style={{ marginLeft: 8, fontFamily: "monospace", fontSize: 15 }}>{crediti}</span>
          </div>
        </div>
        <button
          onClick={() => setPage("vc")}
          style={{
            margin: "24px 18px 0 18px",
            padding: 12,
            borderRadius: 8,
            border: 0,
            background: page === "vc" ? "#19883aff" : "#293047",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 16,
            boxShadow: page === "vc" ? "0 2px 8px #387aff40" : undefined,
            width: "calc(100% - 36px)",
          }}
        >+ Crea Nuovo Prodotto</button>
        <button
          onClick={() => setPage("history")}
          style={{
            margin: "16px 18px 0 18px",
            padding: 12,
            borderRadius: 8,
            border: 0,
            background: page === "history" ? "#19883aff" : "#293047",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 16,
            width: "calc(100% - 36px)",
          }}
        >Storico oggetti</button>
        <button
          onClick={() => setPage("import")}
          style={{
            margin: "16px 18px 0 18px",
            padding: 12,
            borderRadius: 8,
            border: 0,
            background: page === "import" ? "#19883aff" : "#293047",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 16,
            width: "calc(100% - 36px)",
          }}
        >Importa VC JSON</button>
        <button
          onClick={() => setPage("events")}
          style={{
            margin: "16px 18px 0 18px",
            padding: 12,
            borderRadius: 8,
            border: 0,
            background: page === "events" ? "#19883aff" : "#293047",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 16,
            width: "calc(100% - 36px)",
          }}
        >Eventi</button>
        <button
          onClick={() => setPage("credits")}
          style={{
            margin: "16px 18px 0 18px",
            padding: 12,
            borderRadius: 8,
            border: 0,
            background: page === "credits" ? "#19883aff" : "#293047",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 16,
            width: "calc(100% - 36px)",
          }}
        >Storico crediti</button>
      </div>
      <button
        onClick={onLogout}
        style={{
          margin: "32px 18px 24px 18px",
          padding: 12,
          borderRadius: 8,
          border: 0,
          background: "#222b44",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: 16,
          width: "calc(100% - 36px)"
        }}
      >Logout</button>
    </nav>
  );
}

function VCCreator({ did, onCreated }) {
  const [vc, setVc] = useState(null);
  const [serial, setSerial] = useState("");
  const [model, setModel] = useState("");
  const [desc, setDesc] = useState("");

  async function createVc() {
    if (!did) {
      alert("DID mancante!");
      return;
    }
    if (!serial || !model || !desc) {
      alert("Compila tutti i campi!");
      return;
    }
    const credential = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", "ProductCertificate"],
      issuer: did,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: `urn:product:${serial}`,
        model,
        description: desc,
      },
    };
    // onCreated ora restituisce true/false!
    const ok = await onCreated(credential);
    if (ok) {
      // solo se credito disponibile mostra il JSON
      const withProof = await addProofMock(credential, did);
      setVc(withProof);
    } else {
      setVc(null);
    }
  }

  function downloadJson(obj, filename = "vc.json") {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(obj, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", filename);
    a.click();
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Digital Product Passport</h1>
      <h2>DID aziendale</h2>
      <div
        style={{
          width: "100%",
          marginBottom: 16,
          background: "#f4f6fa",
          color: "#222",
          fontWeight: "bold",
          border: "1px solid #aaa",
          borderRadius: 4,
          padding: 8,
          letterSpacing: 1,
          wordBreak: "break-all",
          fontFamily: "monospace",
        }}
      >{did}</div>
      <h2>Crea una Verifiable Credential (VC)</h2>
      <input
        placeholder="Seriale Prodotto"
        value={serial}
        onChange={e => setSerial(e.target.value)}
        style={{ display: "block", margin: "8px 0", width: "100%" }}
      />
      <input
        placeholder="Modello"
        value={model}
        onChange={e => setModel(e.target.value)}
        style={{ display: "block", margin: "8px 0", width: "100%" }}
      />
      <input
        placeholder="Descrizione"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        style={{ display: "block", margin: "8px 0", width: "100%" }}
      />
      <button onClick={createVc} style={{ marginTop: 8 }}>
        Crea VC
      </button>
      {vc && (
        <>
          <h2>Step 3: Risultato VC (JSON) <VerifyFlag vc={vc} /></h2>
          <pre style={{ background: "#a4a4a4ff", padding: 12 }}>
            {JSON.stringify(vc, null, 2)}
          </pre>
          <button onClick={() => downloadJson(vc)}>
            Scarica VC come JSON
          </button>
        </>
      )}
    </div>
  );
}

// --- IMPORT VC DA FILE O TESTO ---
// (uguale alla tua versione)
function ImportPage({ onImport, did }) {
  const [text, setText] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef();

  async function handleTextImport() {
    try {
      let json = JSON.parse(text);
      if (!json._uid) json._uid = genUID();
      await onImport(json);
      setText("");
      setFileError("");
      alert("Import riuscito!");
    } catch {
      setFileError("Il testo inserito non è un JSON valido!");
    }
  }

  function handleFileImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function (ev) {
      try {
        let json = JSON.parse(ev.target.result);
        if (!json._uid) json._uid = genUID();
        await onImport(json);
        setText("");
        setFileError("");
        alert("Import riuscito!");
      } catch {
        setFileError("Il file non contiene un JSON valido!");
      }
    };
    reader.readAsText(file);
  }

  function openFileDialog() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Importa Verifiable Credential (VC) JSON</h1>
      <div style={{ marginBottom: 16 }}>
        <b>Importa da file:</b>
        <button
          type="button"
          style={{
            background: "#169c3e",
            color: "#fff",
            fontWeight: "bold",
            padding: "5px 18px",
            border: "2px solid #bfffd8",
            borderRadius: 8,
            fontSize: 17,
            cursor: "pointer",
            marginLeft: 8,
            marginRight: 12,
            marginTop: 0,
            marginBottom: 0
          }}
          onClick={openFileDialog}
        >
          Importa file JSON
        </button>
        <input
          ref={fileInputRef}
          id="json-file"
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={handleFileImport}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <b>Incolla qui il JSON:</b>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Incolla qui il contenuto JSON della tua VC"
          style={{ width: "100%", minHeight: 80, margin: "8px 0", background: "#333", color: "#fff" }}
        />
        <button onClick={handleTextImport} style={{
          marginTop: 8,
          background: "#181818",
          color: "#fff",
          borderRadius: 8,
          fontSize: 18,
          padding: "10px 28px",
          fontWeight: "bold",
          border: "none",
          cursor: "pointer"
        }}>
          Importa da testo
        </button>
      </div>
      {fileError && <div style={{ color: "red" }}>{fileError}</div>}
    </div>
  );
}

// --- HASH DISPLAY (va sopra o sotto, stessa pagina, una volta sola) ---
function HashDisplay({ vc }) {
  const [calc, setCalc] = React.useState("");
  React.useEffect(() => {
    (async () => {
      const { proof, ...data } = vc;
      const h = await sha256(deterministicStringify(data));
      setCalc(h);
    })();
  }, [vc]);
  return (
    <div style={{
      maxWidth: 230,
      overflowX: "auto",
      background: "#333",
      padding: "2px 4px",
      borderRadius: 3,
      color: "#fff"
    }}>
      {calc}
    </div>
  );
}

// --- COPY JSON BOX ---
// Mostra il JSON e aggiunge un pulsante "Copia"
function CopyJsonBox({ jsonObj }) {
  const [copied, setCopied] = React.useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(JSON.stringify(jsonObj, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  return (
    <div style={{ background: "#ffffffff", borderRadius: 6, padding: 14, fontFamily: "monospace", margin: 16 }}>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{JSON.stringify(jsonObj, null, 2)}</pre>
      <button onClick={handleCopy} style={{
        background: "#169c3e",
        color: "#fff",
        fontWeight: "bold",
        border: "none",
        borderRadius: 4,
        padding: "6px 18px",
        marginTop: 8,
        cursor: "pointer"
      }}>
        {copied ? "Copiato!" : "Copia JSON"}
      </button>
    </div>
  );
}

//---STORICO---//
function HistoryTable({ items, setHistory, fullHistory, did }) {
  const [expandedIdx, setExpandedIdx] = React.useState(null); // NOTA: diventa "indice", non più "_uid"
  const [selectedUids, setSelectedUids] = React.useState([]);
  const [filterSerial, setFilterSerial] = React.useState("");
  const [filterModel, setFilterModel] = React.useState("");

  const filteredItems = items.filter(vc =>
    (filterSerial === "" || (vc.credentialSubject.id ?? "").toLowerCase().includes(filterSerial.toLowerCase())) &&
    (filterModel === "" || (vc.credentialSubject.model ?? "").toLowerCase().includes(filterModel.toLowerCase()))
  );

  function toggleSelect(uid, idx) {
    // usa idx per disambiguare VC con stesso _uid!
    const key = uid + "_" + idx;
    setSelectedUids(sel =>
      sel.includes(key) ? sel.filter(i => i !== key) : [...sel, key]
    );
  }

  function selectAll() {
    setSelectedUids(filteredItems.map((vc, idx) => (vc._uid + "_" + idx)));
  }

  function unselectAll() {
    setSelectedUids([]);
  }

  function handleDeleteSelected() {
    setHistory(fullHistory.filter((vc, idx) => !selectedUids.includes(vc._uid + "_" + idx)));
    setSelectedUids([]);
    setExpandedIdx(null);
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Storico prodotti generati</h1>
      {/* ...filtri... */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", background: "#363636ff", borderRadius: 6, overflow: "hidden", minWidth: 850 }}>
          <thead style={{ background: "#ffffffff" }}>
            {/* ...header... */}
          </thead>
          <tbody>
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6}>Nessun prodotto trovato.</td>
              </tr>
            )}
            {filteredItems.map((vc, idx) => {
              const uniqueKey = vc._uid + "_" + idx; // chiave davvero univoca anche tra duplicati!
              const isExpanded = expandedIdx === uniqueKey;
              return (
                <React.Fragment key={uniqueKey}>
                  <tr style={{ background: isExpanded ? "#ffffffff" : "#ffffffff" }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUids.includes(uniqueKey)}
                        onChange={() => toggleSelect(vc._uid, idx)}
                      />
                    </td>
                    <td>
                      <VerifyFlag vc={vc} />
                    </td>
                    <td style={{ fontFamily: "monospace" }}>
                      {(vc.credentialSubject.id ?? "").split(":").pop()}
                    </td>
                    <td>{vc.credentialSubject.model}</td>
                    <td>
                      <button
                        style={{ color: "#223", background: "#e5e5e5", border: "none", borderRadius: 4, padding: "2px 8px", fontWeight: "bold", cursor: "pointer" }}
                        onClick={() => setExpandedIdx(isExpanded ? null : uniqueKey)}
                      >
                        {isExpanded ? "Nascondi" : "Dettagli"}
                      </button>
                    </td>
                    <td style={{
                      fontSize: 13,
                      fontFamily: "monospace",
                      maxWidth: 250,
                      overflow: "auto",
                      whiteSpace: "nowrap"
                    }}>
                      <HashDisplay vc={vc} />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} style={{ position: "relative", padding: 0 }}>
                        <CopyJsonBox jsonObj={vc} />
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

// --- EVENTI ---
// (solo patchata per bug crediti: usa updateItem che ora blocca se credito 0)
function EventsPage({ items, onUpdateItem }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [desc, setDesc] = useState("");
  const [table, setTable] = useState([{ campo: "", valore: "" }]);

  if (selectedIdx === null) {
    return (
      <div>
        <h1 style={{ marginBottom: 24 }}>Eventi sui prodotti</h1>
        <div style={{ marginBottom: 14, color: "#444" }}>
          Seleziona un prodotto per aggiungere eventi descrittivi o tabellari.
        </div>
        <ul style={{ paddingLeft: 0 }}>
          {items.map((vc, idx) => (
            <li
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              style={{
                cursor: "pointer",
                padding: "8px 0",
                borderBottom: "1px solid #ddd",
                listStyle: "none",
                color: "#222",
                fontWeight: 500,
              }}
            >
              <span>{vc.credentialSubject.model}</span>
              <span style={{ opacity: 0.6, marginLeft: 10 }}>#{vc.credentialSubject.id?.split(":").pop()}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function handleAddEvent() {
    if (!desc && table.every(row => !row.campo || !row.valore)) {
      alert("Compila almeno un campo evento!");
      return;
    }
    const prod = { ...items[selectedIdx], credentialSubject: { ...items[selectedIdx].credentialSubject } };
    if (!prod.credentialSubject.events) prod.credentialSubject.events = [];
    prod.credentialSubject.events.push({
      descrizione: desc,
      tabella: table.filter(row => row.campo && row.valore),
      data: new Date().toISOString()
    });
    onUpdateItem(selectedIdx, prod, true); // true: decrementa crediti
    setDesc("");
    setTable([{ campo: "", valore: "" }]);
    // alert già gestito da updateItem se credito 0
  }

  function handleTableChange(i, key, value) {
    setTable(tbl =>
      tbl.map((row, idx) =>
        idx === i ? { ...row, [key]: value } : row
      )
    );
  }
  function handleAddRow() {
    setTable(tbl => [...tbl, { campo: "", valore: "" }]);
  }
  function handleBack() {
    setSelectedIdx(null);
    setDesc("");
    setTable([{ campo: "", valore: "" }]);
  }
  // ** Leggi gli eventi dal posto giusto **
  const events = items[selectedIdx]?.credentialSubject?.events || [];
  return (
    <div>
      <button onClick={handleBack} style={{ marginBottom: 16 }}>← Indietro</button>
      <h2>
        Eventi per prodotto: <b>{items[selectedIdx].credentialSubject.model}</b> <span style={{ opacity: 0.6 }}>#{items[selectedIdx].credentialSubject.id?.split(":").pop()}</span>
      </h2>
      <div style={{ marginBottom: 16 }}>
        <textarea
          placeholder="Descrizione evento"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          style={{ width: "100%", minHeight: 48, margin: "8px 0" }}
        />
        <b>Tabella campi evento:</b>
        {table.map((row, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
            <input
              placeholder="Campo"
              value={row.campo}
              onChange={e => handleTableChange(i, "campo", e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              placeholder="Valore"
              value={row.valore}
              onChange={e => handleTableChange(i, "valore", e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        ))}
        <button onClick={handleAddRow} style={{ margin: "8px 0" }}>+ Riga</button>
      </div>
      <button onClick={handleAddEvent} style={{ marginBottom: 24, background: "#19883a", color: "#fff", fontWeight: "bold", border: "none", borderRadius: 5, padding: "8px 16px", fontSize: 16 }}>
        Aggiungi evento
      </button>
      <h3>Storico eventi</h3>
      {events.length === 0 && <div>Nessun evento.</div>}
      <ul>
        {events.map((e, i) => (
          <li key={i} style={{ background: "#eaeaea", borderRadius: 5, padding: 8, margin: "6px 0" }}>
            <b>{e.data.split("T")[0]}</b>: {e.descrizione}
            {e.tabella && e.tabella.length > 0 && (
              <table style={{ marginTop: 4, width: "100%", background: "#fff" }}>
                <tbody>
                  {e.tabella.map((row, j) => (
                    <tr key={j}>
                      <td style={{ border: "1px solid #ccc", padding: 4 }}>{row.campo}</td>
                      <td style={{ border: "1px solid #ccc", padding: 4 }}>{row.valore}</td>
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