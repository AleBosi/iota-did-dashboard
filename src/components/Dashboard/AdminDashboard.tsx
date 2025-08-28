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

type AdminTab = "bi" | "aziende" | "crediti" | "backup";

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
    actors,
    products,
    events,
    vcs,
    addAzienda,
    updateAzienda,
    removeAzienda,
    credits,
    grantToAzienda,
    rechargeAdmin,
  } = useData();

  const [activeTab, setActiveTab] = useState<AdminTab>("bi");

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
      { id: "bi", label: "Overview BI", icon: "📊" },
      { id: "aziende", label: "Aziende", icon: "🏢" },
      { id: "crediti", label: "Crediti sistema", icon: "💰" },
      { id: "backup", label: "Import/Export", icon: "📁" },
    ],
    []
  );

  // --- CRUD aziende (robusto rispetto al form esterno) ---
  function normalizeAziendaInput(aziendaData: Partial<Azienda> | any): Azienda {
    const newDid = (typeof generateDID === "function" && generateDID()) || `did:iota:evm:${uid(10)}`;
    const newSeed = (typeof generateSeed === "function" && generateSeed()) || `SEED_${uid(12)}`;

    const name =
      aziendaData?.name ||
      aziendaData?.ragioneSociale ||
      aziendaData?.companyName ||
      "Nuova Azienda";

    const legalInfo = {
      vat: aziendaData?.vat || aziendaData?.legalInfo?.vat || "",
      lei: aziendaData?.lei || aziendaData?.legalInfo?.lei || "",
      address: aziendaData?.address || aziendaData?.legalInfo?.address || "",
      email: aziendaData?.email || aziendaData?.legalInfo?.email || "",
      country: aziendaData?.country || aziendaData?.legalInfo?.country || "IT",
    };

    const nuova: any = {
      id: aziendaData?.id || newDid, // DID come id coerente
      did: aziendaData?.did || newDid,
      seed: aziendaData?.seed || newSeed,
      name,
      createdAt: aziendaData?.createdAt || new Date().toISOString(),
      status: aziendaData?.status || "active",
      legalInfo,
      creators: aziendaData?.creators || [],
      operatori: aziendaData?.operatori || [],
      macchinari: aziendaData?.macchinari || [],
    };
    return nuova as Azienda;
  }

  const handleCreateAzienda = (raw: Partial<Azienda> | any) => {
    const nuova = normalizeAziendaInput(raw || {});
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
    if (window.confirm(`Eliminare l'azienda ${azienda.name}?`)) {
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
    if (rechargeAmount <= 0) return alert("Inserisci un importo valido");
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

  // --- BI: aggregazioni leggere ---
  const kpi = useMemo(() => {
    const byRole = (actors || []).reduce(
      (acc: any, a: any) => {
        const r = a?.role || "unknown";
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const productsByStatus = (products || []).reduce((acc: any, p: any) => {
      const s = p?.status || "unknown";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByKind = (events || []).reduce((acc: any, e: any) => {
      const k = e?.kind || e?.type || "unknown";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const vcsByStatus = (vcs || []).reduce((acc: any, v: any) => {
      const s = v?.status || "unknown";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalDistributedToAziende = Object.values(credits?.byAzienda || {}).reduce(
      (sum, n) => sum + (n || 0),
      0
    );

    // Top 5 aziende per saldo
    const topAziende = Object.entries(credits?.byAzienda || {})
      .map(([id, bal]) => {
        const a = (aziende || []).find((z: any) => z.id === id);
        return { id, name: a?.name || id, balance: bal as number };
      })
      .sort((a, b) => (b.balance || 0) - (a.balance || 0))
      .slice(0, 5);

    return {
      companies: aziende?.length || 0,
      actors: (actors || []).length || 0,
      products: (products || []).length || 0,
      events: (events || []).length || 0,
      vcs: (vcs || []).length || 0,
      byRole,
      productsByStatus,
      eventsByKind,
      vcsByStatus,
      totalDistributedToAziende,
      topAziende,
    };
  }, [aziende, actors, products, events, vcs, credits?.byAzienda]);

  return (
    <div className="admin-scope min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* Scope locale: mappa utility legacy -> palette shadcn */}
      <style>{`
        .admin-scope .bg-white { background-color: hsl(var(--card)) !important; }
        .admin-scope .bg-gray-50 { background-color: hsl(var(--muted)) !important; }
        .admin-scope .text-gray-900 { color: hsl(var(--foreground)) !important; }
        .admin-scope .text-gray-500,
        .admin-scope .text-gray-600,
        .admin-scope .text-gray-700 { color: hsl(var(--muted-foreground)) !important; }
        .admin-scope .border-gray-100,
        .admin-scope .border-gray-200,
        .admin-scope .border-gray-300 { border-color: hsl(var(--border)) !important; }
        .admin-scope input, .admin-scope select, .admin-scope textarea {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
          border-color: hsl(var(--border));
        }
      `}</style>

      <div className="flex min-h-screen w-full">
        <aside className="shrink-0">
          <Sidebar
            title="TRUSTUP"
            subtitle={`Admin ${session?.username || "Sistema"}`}
            items={sidebarItems}
            activeItem={activeTab}
            onItemClick={(id) => setActiveTab(id as AdminTab)}
            onLogout={() => {
              logout?.();
              window.location.href = "/login?reset=1";
            }}
          />
        </aside>

        <section className="flex-1 min-w-0 flex flex-col">
          <Header
            title="Dashboard Admin"
            subtitle="Gestione completa del sistema IOTA DID"
            rightActions={
              <div className="rounded-full border border-border bg-muted px-3 py-1 text-sm">
                <span className="opacity-70 mr-1">Crediti Admin:</span>
                <span className="font-medium">{Number(systemCredits).toLocaleString()}</span>
              </div>
            }
          />

          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            {/* ====== TAB: BI ====== */}
            {activeTab === "bi" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <KpiCard label="Aziende" value={kpi.companies} />
                  <KpiCard label="Attori" value={kpi.actors} />
                  <KpiCard label="Prodotti" value={kpi.products} />
                  <KpiCard label="Eventi" value={kpi.events} />
                  <KpiCard label="VC/DPP" value={kpi.vcs} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <StatTable
                    title="Team per ruolo"
                    rows={Object.entries(kpi.byRole).map(([role, n]) => ({ k: role, v: String(n) }))}
                    empty="Nessun attore"
                  />
                  <StatTable
                    title="Prodotti per stato"
                    rows={Object.entries(kpi.productsByStatus).map(([st, n]) => ({ k: st, v: String(n) }))}
                    empty="Nessun prodotto"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <StatTable
                    title="Eventi per kind"
                    rows={Object.entries(kpi.eventsByKind).map(([k, n]) => ({ k, v: String(n) }))}
                    empty="Nessun evento"
                  />
                  <StatTable
                    title="VC per stato"
                    rows={Object.entries(kpi.vcsByStatus).map(([st, n]) => ({ k: st, v: String(n) }))}
                    empty="Nessuna VC"
                  />
                </div>

                <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                  <h3 className="font-semibold mb-3">Crediti distribuiti</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Admin pool</div>
                      <div className="text-2xl font-bold">{Number(credits?.admin || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Distribuiti alle aziende</div>
                      <div className="text-2xl font-bold">{Number(kpi.totalDistributedToAziende).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Aziende</div>
                      <div className="text-2xl font-bold">{aziendeCount}</div>
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-2 pr-4">Top Aziende</th>
                          <th className="py-2 pr-4">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpi.topAziende.length === 0 ? (
                          <tr><td className="py-2 pr-4 text-gray-500" colSpan={2}>Nessun dato</td></tr>
                        ) : (
                          kpi.topAziende.map((z) => (
                            <tr key={z.id} className="border-t border-gray-100">
                              <td className="py-2 pr-4">{z.name}</td>
                              <td className="py-2 pr-4">{Number(z.balance).toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ====== TAB: AZIENDE ====== */}
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
                  <div className="bg-white p-6 rounded-xl shadow border border-gray-200 mb-6">
                    <h3 className="text-xl font-semibold mb-4">Crea Nuova Azienda</h3>

                    {/* Supporto a più firme di callback per compat bilaterale */}
                    <AziendaForm
                      onSubmit={handleCreateAzienda as any}
                      onSave={handleCreateAzienda as any}
                      onCreate={handleCreateAzienda as any}
                      onCancel={() => setShowAziendaForm(false)}
                    />

                    {/* Fallback inline (se il form esterno non invoca) */}
                    <QuickAziendaForm onCreate={handleCreateAzienda} />
                  </div>
                )}

                {selectedAzienda ? (
                  <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
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
                      showSecrets
                    />
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
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

            {/* ====== TAB: CREDITI ====== */}
            {activeTab === "crediti" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Gestione Crediti Sistema</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Stato Sistema */}
                  <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4">Stato Sistema</h3>
                    <div className="space-y-3">
                      <Row label="Crediti Admin disponibili" value={systemCredits.toLocaleString()} />
                      <Row label="Aziende registrate" value={String(aziendeCount)} />
                      <Row label="Transazioni locali" value={String(creditHistory.length)} />
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
                  <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4">Invia Crediti a un’Azienda</h3>
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
                <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                  <h3 className="text-xl font-semibold mb-4">Storico Transazioni (locale)</h3>
                  {/* Il componente supporta sia `history` che `transactions` in diverse viste.
                      Manteniamo `transactions` come in altri punti della codebase Admin. */}
                  <UserCreditsHistory transactions={creditHistory} />
                </div>
              </div>
            )}

            {/* ====== TAB: BACKUP ====== */}
            {activeTab === "backup" && (
              <AdminBackupPanel
                aziende={aziende as any}
                credits={credits as any}
                creditHistory={creditHistory}
                onExport={() => {
                  const snapshot = {
                    aziende,
                    actors,
                    products,
                    events,
                    vcs,
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
                      alert("File importato. Procedura di ripristino completa sarà aggiunta nella prossima iterazione.");
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
        </section>
      </div>
    </div>
  );
}

/* ======================= COMPONENTI INTERNE ======================= */

function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function StatTable({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { k: string; v: string }[];
  empty: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 pr-4">Chiave</th>
              <th className="py-2 pr-4">Valore</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="py-2 pr-4 text-gray-500" colSpan={2}>
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.k} className="border-t border-gray-100">
                  <td className="py-2 pr-4 capitalize">{r.k}</td>
                  <td className="py-2 pr-4">{r.v}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Esporta Dati</h3>
          <p className="text-gray-600 mb-4">
            Scarica un backup completo (aziende, attori, prodotti, eventi, VC e ledger crediti).
          </p>
          <button
            onClick={onExport}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            📁 Esporta Backup
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Importa Dati</h3>
          <p className="text-gray-600 mb-4">Seleziona un file di backup per simulare il ripristino.</p>
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

      <div className="mt-6 bg-white p-6 rounded-xl shadow border border-gray-200">
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
            <div className="text-2xl font-bold text-purple-600">{creditHistory.length}</div>
            <div className="text-sm text-gray-600">Transazioni (locali)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Object.values(credits?.byAzienda || {})
                .reduce((s: number, n: number) => s + (n || 0), 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Crediti Distribuiti</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Fallback creator semplice se il form esterno non invoca il submit */
function QuickAziendaForm({ onCreate }: { onCreate: (data: Partial<Azienda>) => void }) {
  const [name, setName] = useState("");
  const [vat, setVat] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <h4 className="font-semibold mb-2">Oppure creala velocemente qui</h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          className="border rounded px-3 py-2 md:col-span-2"
          placeholder="Ragione sociale"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="P.IVA"
          value={vat}
          onChange={(e) => setVat(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="md:col-span-4">
          <button
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
            onClick={() =>
              onCreate({
                name: name.trim() || "Nuova Azienda",
                legalInfo: { vat, email, country: "IT" } as any,
              })
            }
          >
            Crea Azienda
          </button>
        </div>
      </div>
    </div>
  );
}
