import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useData } from "../../state/DataContext";
import { Azienda } from "../../models/azienda";

import Header from "../Common/Header";
import Sidebar from "../Common/Sidebar";
import AziendaForm from "../Actors/Azienda/AziendaForm";
import AziendaList from "../Actors/Azienda/AziendaList";
import AziendaDetails from "../Actors/Azienda/AziendaDetails";
import UserCreditsHistory from "../Credits/UserCreditsHistory";

import { uid } from "../../utils/storage";
import { generateSeed, generateDID } from "../../utils/cryptoUtils";

type AdminTab = "aziende" | "crediti" | "backup";

interface CreditTransaction {
  id: string;
  date: string;
  amount: number;
  type: "give" | "receive" | "recharge";
  description: string;
  aziendaId?: string;
  aziendaName?: string;
}

const CREDIT_HISTORY_KEY = "iota.trustup.data.creditHistory";

export default function AdminDashboard() {
  const { session, logout } = useUser();
  const {
    aziende,
    addAzienda,
    updateAzienda,
    removeAzienda,
    credits,
    grantToAzienda,
    rechargeAdmin,
  } = useData();

  const [activeTab, setActiveTab] = useState<AdminTab>("aziende");

  // --- Aziende state ---
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);
  const [showAziendaForm, setShowAziendaForm] = useState(false);

  // --- Crediti state ---
  const [creditsToGive, setCreditsToGive] = useState<number>(0);
  const [selectedAziendaForCredits, setSelectedAziendaForCredits] = useState<string>("");
  const [rechargeAmount, setRechargeAmount] = useState<number>(0);

  // --- Storico locale (audit) ---
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>(() => {
    try {
      const raw = localStorage.getItem(CREDIT_HISTORY_KEY);
      return raw ? (JSON.parse(raw) as CreditTransaction[]) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(CREDIT_HISTORY_KEY, JSON.stringify(creditHistory));
    } catch {}
  }, [creditHistory]);

  // --- Derivati / helpers ---
  const systemCredits = credits?.admin ?? 0;
  const aziendeCount = aziende?.length ?? 0;
  const aziendaBalance = (aziendaId: string) => credits?.byAzienda?.[aziendaId] || 0;

  const sidebarItems = useMemo(
    () => [
      { id: "aziende", label: "Aziende", icon: "🏢" },
      { id: "crediti", label: "Crediti sistema", icon: "💰" },
      { id: "backup", label: "Import/Export", icon: "📁" },
    ],
    []
  );

  // --- CRUD aziende ---
  const handleCreateAzienda = (aziendaData: Partial<Azienda>) => {
    const newDid = generateDID?.() || `did:iota:evm:${uid(10)}`;
    const newSeed = generateSeed?.() || `SEED_${uid(12)}`;

    const nuova: any = {
      id: newDid, // usiamo il DID come id coerente col resto del progetto
      did: newDid,
      seed: newSeed,
      name: aziendaData.name || "Nuova Azienda",
      createdAt: new Date().toISOString(),
      status: (aziendaData as any)?.status || "active",
      // normalizziamo legalInfo per compatibilità con viste esistenti
      legalInfo: {
        vat: (aziendaData as any)?.vat || (aziendaData as any)?.legalInfo?.vat || "",
        lei: (aziendaData as any)?.lei || (aziendaData as any)?.legalInfo?.lei || "",
        address:
          (aziendaData as any)?.address || (aziendaData as any)?.legalInfo?.address || "",
        email:
          (aziendaData as any)?.email || (aziendaData as any)?.legalInfo?.email || "",
        country:
          (aziendaData as any)?.country || (aziendaData as any)?.legalInfo?.country || "IT",
      },
      creators: [],
      operatori: [],
      macchinari: [],
    };

    addAzienda(nuova);
    setShowAziendaForm(false);
    setSelectedAzienda(nuova);

    setCreditHistory((prev) => [
      {
        id: uid(12),
        date: new Date().toISOString(),
        amount: 0,
        type: "give",
        description: `Azienda creata: ${nuova.name}`,
        aziendaId: nuova.id,
        aziendaName: nuova.name,
      },
      ...prev,
    ]);
  };

  const handleUpdateAzienda = (updated: Azienda) => {
    updateAzienda(updated);
    setSelectedAzienda(updated);
  };

  const handleDeleteAzienda = (aziendaId: string) => {
    const azienda = aziende.find((a: any) => a.id === aziendaId);
    if (!azienda) return;
    if (window.confirm(`Sei sicuro di voler eliminare l'azienda ${azienda.name}?`)) {
      removeAzienda(aziendaId);
      setSelectedAzienda(null);
      setCreditHistory((prev) => [
        {
          id: uid(12),
          date: new Date().toISOString(),
          amount: 0,
          type: "give",
          description: `Azienda eliminata: ${azienda.name}`,
          aziendaId: azienda.id,
          aziendaName: azienda.name,
        },
        ...prev,
      ]);
    }
  };

  // --- Crediti ---
  const handleSendCredits = () => {
    if (!selectedAziendaForCredits || creditsToGive <= 0) {
      alert("Seleziona un'azienda e inserisci un importo valido");
      return;
    }
    if (creditsToGive > systemCredits) {
      alert("Crediti insufficienti nel pool Admin");
      return;
    }
    const azienda = aziende.find((a: any) => a.id === selectedAziendaForCredits);
    if (!azienda) return;

    grantToAzienda(selectedAziendaForCredits, creditsToGive);

    setCreditHistory((prev) => [
      {
        id: uid(12),
        date: new Date().toISOString(),
        amount: creditsToGive,
        type: "give",
        description: `Crediti inviati a ${azienda.name}`,
        aziendaId: azienda.id,
        aziendaName: azienda.name,
      },
      ...prev,
    ]);

    setCreditsToGive(0);
    setSelectedAziendaForCredits("");
  };

  const handleRechargeSystem = () => {
    if (rechargeAmount <= 0) {
      alert("Inserisci un importo valido");
      return;
    }
    rechargeAdmin(rechargeAmount);

    setCreditHistory((prev) => [
      {
        id: uid(12),
        date: new Date().toISOString(),
        amount: rechargeAmount,
        type: "recharge",
        description: `Ricarica sistema: +${rechargeAmount} crediti`,
      },
      ...prev,
    ]);

    const val = rechargeAmount;
    setRechargeAmount(0);
    alert(`Sistema ricaricato con ${val} crediti`);
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar
        title="TRUSTUP"
        subtitle={`Admin ${session?.username || "Sistema"}`}
        items={sidebarItems}
        activeItem={activeTab}
        onItemClick={(id) => setActiveTab(id as AdminTab)}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col">
        <Header
          title="Dashboard Admin"
          subtitle="Gestione completa del sistema IOTA DID"
          // molti Header custom accettano rightActions opzionali; se il tuo non le supporta, ignorale.
          rightActions={
            <a
              href="/login?reset=1"
              className="rounded-xl px-3 py-2 border border-gray-300 text-gray-800 hover:bg-gray-100"
              title="Esci e torna alla login"
            >
              Esci
            </a>
          }
        />

        <main className="flex-1 p-6">
          {/* --- TAB AZIENDE --- */}
          {activeTab === "aziende" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestione Aziende</h2>
                <button
                  onClick={() => setShowAziendaForm((s) => !s)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {showAziendaForm ? "Annulla" : "+ Nuova Azienda"}
                </button>
              </div>

              {showAziendaForm && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                  <h3 className="text-xl font-semibold mb-4">Crea Nuova Azienda</h3>
                  <AziendaForm
                    onSubmit={handleCreateAzienda}
                    onCancel={() => setShowAziendaForm(false)}
                  />
                </div>
              )}

              {selectedAzienda ? (
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Dettagli Azienda</h3>
                    <button
                      onClick={() => setSelectedAzienda(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕ Chiudi
                    </button>
                  </div>
                  <AziendaDetails
                    azienda={selectedAzienda}
                    credits={aziendaBalance((selectedAzienda as any).id)}
                    onUpdate={handleUpdateAzienda}
                    onDelete={() => handleDeleteAzienda((selectedAzienda as any).id)}
                    // mostra sempre DID/seed in chiaro + pulsanti copia
                    showSecrets
                  />
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-4">Lista Aziende ({aziendeCount})</h3>
                  <AziendaList
                    aziende={aziende as any}
                    onSelect={setSelectedAzienda}
                    onDelete={(id: string) => handleDeleteAzienda(id)}
                    getCredits={(id: string) => aziendaBalance(id)}
                    showDid
                  />
                </div>
              )}
            </div>
          )}

          {/* --- TAB CREDITI --- */}
          {activeTab === "crediti" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Gestione Crediti Sistema</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Stato Sistema */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-4">Stato Sistema</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Crediti Admin disponibili:</span>
                      <span className="font-bold text-green-600">
                        {systemCredits.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aziende registrate:</span>
                      <span className="font-bold">{aziendeCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transazioni totali:</span>
                      <span className="font-bold">{creditHistory.length}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Ricarica Sistema</h4>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(Number(e.target.value))}
                        placeholder="Importo"
                        className="flex-1 p-2 border rounded"
                      />
                      <button
                        onClick={handleRechargeSystem}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Ricarica
                      </button>
                    </div>
                  </div>
                </div>

                {/* Invio Crediti */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-4">Invia Crediti</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Azienda</label>
                      <select
                        value={selectedAziendaForCredits}
                        onChange={(e) => setSelectedAziendaForCredits(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Seleziona azienda…</option>
                        {aziende.map((a: any) => (
                          <option key={a.id} value={a.id}>
                            {a.name} (Crediti: {aziendaBalance(a.id)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Importo</label>
                      <input
                        type="number"
                        value={creditsToGive}
                        onChange={(e) => setCreditsToGive(Number(e.target.value))}
                        placeholder="Crediti da inviare"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <button
                      onClick={handleSendCredits}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                      Invia Crediti
                    </button>
                  </div>
                </div>
              </div>

              {/* Storico Transazioni */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Storico Transazioni</h3>
                <UserCreditsHistory transactions={creditHistory} />
              </div>
            </div>
          )}

          {/* --- TAB BACKUP --- */}
          {activeTab === "backup" && (
            <AdminBackupPanel
              aziende={aziende as any}
              credits={credits as any}
              creditHistory={creditHistory}
              onExport={() => {
                const snapshot = {
                  aziende,
                  credits,
                  creditHistory,
                  exportedAt: new Date().toISOString(),
                  version: "trustup-admin-v1",
                };
                const dataStr = JSON.stringify(snapshot, null, 2);
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `admin-backup-${new Date().toISOString().split("T")[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              onImport={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    const imported = JSON.parse(String(e.target?.result || "{}"));
                    // non ripristiniamo qui per non complicare: mostriamo suggerimento
                    alert(
                      "File importato. Per un ripristino completo useremo una procedura dedicata nella prossima iterazione (reset + re-inserimento)."
                    );
                    console.log("Imported snapshot", imported);
                  } catch {
                    alert("Errore nel parsing del file");
                  }
                };
                reader.readAsText(file);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/** Pannello backup “leggero” (export immediato, import placeholder) */
function AdminBackupPanel({
  aziende,
  credits,
  creditHistory,
  onExport,
  onImport,
}: {
  aziende: any[];
  credits: any;
  creditHistory: CreditTransaction[];
  onExport: () => void;
  onImport: (file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Import/Export Dati</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Esporta Dati</h3>
          <p className="text-gray-600 mb-4">
            Scarica un backup completo (aziende, ledger crediti e storico locale).
          </p>
          <button
            onClick={onExport}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            📁 Esporta Backup
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Importa Dati</h3>
          <p className="text-gray-600 mb-4">
            Seleziona un file di backup per simulare il ripristino.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full mb-4 p-2 border rounded"
          />
          <button
            onClick={() => file && onImport(file)}
            disabled={!file}
            className="w-full bg-yellow-600 disabled:opacity-50 text-white py-2 rounded hover:bg-yellow-700"
          >
            Importa File
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Statistiche Sistema</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{aziende.length}</div>
            <div className="text-sm text-gray-600">Aziende</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(credits?.admin || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Crediti Sistema</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {creditHistory.length}
            </div>
            <div className="text-sm text-gray-600">Transazioni</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Object.values(credits?.byAzienda || {}).reduce((s: number, n: number) => s + (n || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Crediti Distribuiti</div>
          </div>
        </div>
      </div>
    </div>
  );
}
