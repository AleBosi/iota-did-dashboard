import React, { useMemo, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useData } from "../../state/DataContext";
import Header from "../Common/Header";
import Sidebar from "../Common/Sidebar";
import { uid } from "../../utils/storage";
import { generateDID, generateSeed } from "../../utils/cryptoUtils";

// Tipi ruoli attori lato azienda
type ActorRole = "creator" | "operatore" | "macchinario";

type Tab = "panoramica" | "team" | "prodotti" | "eventi" | "crediti";

export default function AziendaDashboard() {
  const { session, logout } = useUser();
  const {
    aziende,
    actors,
    products,
    events,
    credits,
    addActor,
    updateActor,
    removeActor,
    grantToActor,
  } = useData();

  // ---- Individua l'azienda corrente dalla sessione o fallback alla prima ----
  const currentAzienda = useMemo(() => {
    if (session?.role === "azienda" && session?.did) {
      return aziende.find((a: any) => a.id === session.did) || aziende[0];
    }
    // fallback quando si entra come admin o altro e si visita questa dashboard
    return aziende[0];
  }, [session?.role, session?.did, aziende]);

  const [tab, setTab] = useState<Tab>("panoramica");

  // ---- Liste filtrate per azienda corrente (con fallback robusto) ----
  const aziendaDid = currentAzienda?.id;
  const team = useMemo(
    () =>
      (actors || []).filter(
        (a: any) => a?.owner === aziendaDid || a?.aziendaDid === aziendaDid
      ),
    [actors, aziendaDid]
  );

  const productList = useMemo(
    () =>
      (products || []).filter((p: any) => {
        const owner = p?.owner || p?.ownerDid || p?.aziendaDid;
        return !aziendaDid || owner === aziendaDid;
      }),
    [products, aziendaDid]
  );

  const eventList = useMemo(
    () =>
      (events || []).filter((e: any) => {
        const owner =
          e?.aziendaDid ||
          e?.ownerDid ||
          e?.actorOwnerDid ||
          e?.productOwnerDid;
        // se non c'è campo di owner, mostra tutto (viewer generale)
        return owner ? owner === aziendaDid : true;
      }),
    [events, aziendaDid]
  );

  // ---- Helpers crediti ----
  const aziendaCredits =
    (aziendaDid && credits?.byAzienda?.[aziendaDid]) || 0;
  const actorBalance = (actorDid: string) =>
    (credits?.byActor?.[actorDid] as number) || 0;

  // ---- Creazione/gestione membri/macchine ----
  const [newMemberRole, setNewMemberRole] = useState<ActorRole>("operatore");
  const [newMemberName, setNewMemberName] = useState("");
  const [allocAmounts, setAllocAmounts] = useState<Record<string, number>>({});

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAzienda?.id) {
      alert("Nessuna azienda selezionata");
      return;
    }
    if (!newMemberName.trim()) {
      alert("Inserisci un nome");
      return;
    }
    const did = generateDID?.() || `did:iota:evm:${uid(10)}`;
    const seed = generateSeed?.() || `SEED_${uid(12)}`;

    addActor({
      id: did,
      did,
      seed,
      role: newMemberRole,
      name: newMemberName.trim(),
      owner: currentAzienda.id, // importante per il filtro
      createdAt: new Date().toISOString(),
      status: "active",
    } as any);

    setNewMemberName("");
  };

  const handleRemoveMember = (actorId: string) => {
    if (!actorId) return;
    if (window.confirm("Eliminare il membro/macchina selezionato?")) {
      removeActor(actorId);
    }
  };

  const handleGrantToActor = (actorId: string) => {
    const amount = Number(allocAmounts[actorId] || 0);
    if (amount <= 0) {
      alert("Importo non valido");
      return;
    }
    // NB: la verifica sul saldo azienda è fatta in Creator/Admin quando distribuiscono,
    // qui supponiamo che l'azienda possa sempre allocare dai propri crediti.
    grantToActor(actorId, amount);
    setAllocAmounts((s) => ({ ...s, [actorId]: 0 }));
  };

  const copy = (txt: string) => {
    try {
      navigator.clipboard.writeText(txt);
      alert("Copiato negli appunti");
    } catch {}
  };

  // ---- UI ----
  const sidebarItems = [
    { id: "panoramica", label: "Panoramica", icon: "🏠" },
    { id: "team", label: "Team & Macchine", icon: "👥" },
    { id: "prodotti", label: "Prodotti", icon: "📦" },
    { id: "eventi", label: "Eventi", icon: "🗓️" },
    { id: "crediti", label: "Crediti", icon: "💳" },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar
        title="TRUSTUP"
        subtitle={currentAzienda ? currentAzienda.name : "Azienda"}
        items={sidebarItems}
        activeItem={tab}
        onItemClick={(id) => setTab(id as Tab)}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col">
        <Header
          title="Dashboard Azienda"
          subtitle="Gestione team, crediti e recap"
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
          {/* PANORAMICA */}
          {tab === "panoramica" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Anagrafica</h2>
                {currentAzienda ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div>
                        <strong>Ragione sociale:</strong> {currentAzienda.name}
                      </div>
                      <div>
                        <strong>DID:</strong>{" "}
                        <code className="text-xs">{currentAzienda.id}</code>{" "}
                        <button
                          className="text-blue-600 underline"
                          onClick={() => copy(currentAzienda.id)}
                        >
                          Copia
                        </button>
                      </div>
                      {currentAzienda.seed && (
                        <div>
                          <strong>Seed:</strong>{" "}
                          <code className="text-xs">{currentAzienda.seed}</code>{" "}
                          <button
                            className="text-blue-600 underline"
                            onClick={() => copy(currentAzienda.seed)}
                          >
                            Copia
                          </button>
                        </div>
                      )}
                      <div>
                        <strong>P.IVA:</strong>{" "}
                        {(currentAzienda as any)?.legalInfo?.vat || "-"}
                      </div>
                      <div>
                        <strong>Email:</strong>{" "}
                        {(currentAzienda as any)?.legalInfo?.email || "-"}
                      </div>
                      <div>
                        <strong>Creato il:</strong>{" "}
                        {currentAzienda.createdAt || "-"}
                      </div>
                    </div>
                    <div>
                      <div>
                        <strong>Crediti azienda:</strong>{" "}
                        {aziendaCredits.toLocaleString()}
                      </div>
                      <div>
                        <strong>Membri/macchine:</strong> {team.length}
                      </div>
                      <div>
                        <strong>Prodotti:</strong> {productList.length}
                      </div>
                      <div>
                        <strong>Eventi (visibili):</strong> {eventList.length}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Nessuna azienda selezionata.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TEAM & MACCHINE */}
          {tab === "team" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Team & Macchine</h2>
              </div>

              <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <h3 className="font-semibold mb-3">Crea nuovo membro/macchina</h3>
                <form onSubmit={handleCreateMember} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select
                    className="border rounded px-3 py-2"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as ActorRole)}
                  >
                    <option value="creator">Creator</option>
                    <option value="operatore">Operatore</option>
                    <option value="macchinario">Macchinario</option>
                  </select>
                  <input
                    className="border rounded px-3 py-2 md:col-span-2"
                    placeholder="Nome/Descrizione"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
                  >
                    Crea
                  </button>
                </form>
              </div>

              <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <h3 className="font-semibold mb-4">
                  Elenco membri/macchine ({team.length})
                </h3>
                {team.length === 0 ? (
                  <div className="text-sm text-gray-500">Nessun membro/macchina.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-2 pr-4">Ruolo</th>
                          <th className="py-2 pr-4">Nome</th>
                          <th className="py-2 pr-4">DID</th>
                          <th className="py-2 pr-4">Seed</th>
                          <th className="py-2 pr-4">Crediti</th>
                          <th className="py-2 pr-4">Allocazione</th>
                          <th className="py-2 pr-4">Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.map((m: any) => (
                          <tr key={m.id} className="border-t border-gray-100">
                            <td className="py-2 pr-4 capitalize">{m.role}</td>
                            <td className="py-2 pr-4">{m.name || "-"}</td>
                            <td className="py-2 pr-4">
                              <code className="text-xs">{m.id}</code>{" "}
                              <button className="text-blue-600 underline" onClick={() => copy(m.id)}>
                                Copia
                              </button>
                            </td>
                            <td className="py-2 pr-4">
                              {m.seed ? (
                                <>
                                  <code className="text-xs">{m.seed}</code>{" "}
                                  <button className="text-blue-600 underline" onClick={() => copy(m.seed)}>
                                    Copia
                                  </button>
                                </>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="py-2 pr-4">{actorBalance(m.id).toLocaleString()}</td>
                            <td className="py-2 pr-4">
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  className="w-28 border rounded px-2 py-1"
                                  placeholder="Importo"
                                  value={allocAmounts[m.id] || ""}
                                  onChange={(e) =>
                                    setAllocAmounts((s) => ({
                                      ...s,
                                      [m.id]: Number(e.target.value),
                                    }))
                                  }
                                />
                                <button
                                  className="border rounded px-3 py-1 hover:bg-gray-100"
                                  onClick={() => handleGrantToActor(m.id)}
                                >
                                  Assegna
                                </button>
                              </div>
                            </td>
                            <td className="py-2 pr-4">
                              <button
                                className="border rounded px-3 py-1 border-red-300 text-red-700 hover:bg-red-50"
                                onClick={() => handleRemoveMember(m.id)}
                              >
                                Elimina
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRODOTTI (VIEWER) */}
          {tab === "prodotti" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Prodotti (viewer)</h2>
              <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                {productList.length === 0 ? (
                  <div className="text-sm text-gray-500">Nessun prodotto disponibile.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-2 pr-4">Prodotto</th>
                          <th className="py-2 pr-4">Tipo</th>
                          <th className="py-2 pr-4">Owner</th>
                          <th className="py-2 pr-4">Stato</th>
                          <th className="py-2 pr-4">Creato il</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productList.map((p: any) => (
                          <tr key={p.productId || p.id} className="border-t border-gray-100">
                            <td className="py-2 pr-4">{p.name || p.productName || "-"}</td>
                            <td className="py-2 pr-4">{p.typeName || p.productTypeId || "-"}</td>
                            <td className="py-2 pr-4">
                              <code className="text-xs">{p.owner || p.ownerDid || p.aziendaDid || "-"}</code>
                            </td>
                            <td className="py-2 pr-4">{p.status || "-"}</td>
                            <td className="py-2 pr-4">{p.createdAt || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EVENTI (VIEWER) */}
          {tab === "eventi" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Eventi (viewer)</h2>
              <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                {eventList.length === 0 ? (
                  <div className="text-sm text-gray-500">Nessun evento disponibile.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-2 pr-4">Quando</th>
                          <th className="py-2 pr-4">Tipo</th>
                          <th className="py-2 pr-4">Riferimento</th>
                          <th className="py-2 pr-4">Attore</th>
                          <th className="py-2 pr-4">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventList
                          .slice()
                          .sort((a: any, b: any) =>
                            String(b?.createdAt || b?.time || "").localeCompare(
                              String(a?.createdAt || a?.time || "")
                            )
                          )
                          .map((ev: any, idx: number) => (
                            <tr key={ev.id || idx} className="border-t border-gray-100">
                              <td className="py-2 pr-4">{ev.createdAt || ev.time || "-"}</td>
                              <td className="py-2 pr-4">{ev.type || ev.category || "-"}</td>
                              <td className="py-2 pr-4">
                                {ev.productId || ev.jobId || ev.machineId || "-"}
                              </td>
                              <td className="py-2 pr-4">
                                <code className="text-xs">{ev.actorDid || ev.sourceDid || "-"}</code>
                              </td>
                              <td className="py-2 pr-4">{ev.note || ev.message || "-"}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CREDITI */}
          {tab === "crediti" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Crediti</h2>

              <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Saldo azienda</div>
                    <div className="text-2xl font-bold">{aziendaCredits.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <h3 className="font-semibold mb-4">Allocazioni ai membri/macchine</h3>
                {team.length === 0 ? (
                  <div className="text-sm text-gray-500">Nessun membro/macchina.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="py-2 pr-4">Nome</th>
                          <th className="py-2 pr-4">Ruolo</th>
                          <th className="py-2 pr-4">DID</th>
                          <th className="py-2 pr-4">Saldo</th>
                          <th className="py-2 pr-4">Assegna</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.map((m: any) => (
                          <tr key={m.id} className="border-t border-gray-100">
                            <td className="py-2 pr-4">{m.name || "-"}</td>
                            <td className="py-2 pr-4 capitalize">{m.role}</td>
                            <td className="py-2 pr-4">
                              <code className="text-xs">{m.id}</code>
                            </td>
                            <td className="py-2 pr-4">{actorBalance(m.id).toLocaleString()}</td>
                            <td className="py-2 pr-4">
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  className="w-28 border rounded px-2 py-1"
                                  placeholder="Importo"
                                  value={allocAmounts[m.id] || ""}
                                  onChange={(e) =>
                                    setAllocAmounts((s) => ({
                                      ...s,
                                      [m.id]: Number(e.target.value),
                                    }))
                                  }
                                />
                                <button
                                  className="border rounded px-3 py-1 hover:bg-gray-100"
                                  onClick={() => handleGrantToActor(m.id)}
                                >
                                  Assegna
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
