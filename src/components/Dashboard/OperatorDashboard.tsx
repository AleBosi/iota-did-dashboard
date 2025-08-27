import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useData } from "../../state/DataContext";

import { Actor } from "../../models/actor";
import { Product } from "../../models/product";
import { Event, AssignmentStatus, effectiveStatus } from "../../models/event";
import { VerifiableCredential } from "../../models/vc";

import EventList from "../Events/EventList";
import EventDetails from "../Events/EventDetails";
import EventHistory from "../Events/EventHistory";
import VCList from "../VC/VCList";
import VCViewer from "../VC/VCViewer";
import VerifyFlag from "../VC/VerifyFlag";
import UserCreditsHistory from "../Credits/UserCreditsHistory";
import CreditsDashboard from "../Credits/CreditsDashboard";

import Sidebar from "../Common/Sidebar";
import Header from "../Common/Header";

import SectionCard from "../Common/SectionCard";
import EmptyState from "../Common/EmptyState";
import StatusBadge from "../Common/StatusBadge";

// Shim toast (se hai già un Toaster, sostituisci con il tuo hook)
function useToast() {
  return {
    toast: ({ title, description }: { title?: string; description?: string }) =>
      console.log("[toast]", title || "", description || ""),
  };
}

type Tab = "tasks" | "storico" | "prodotti" | "vc" | "crediti" | "json";

// Costi coerenti con la policy
const NOTE_COST = 1;
const COMPLETE_COST = 1;

interface Task {
  id: string;
  title: string;
  description: string;
  productId?: string;
  productName?: string;
  assignedBy: string;
  assignedAt: string;
  dueDate?: string;
  status: "assigned" | "in_progress" | "completed" | "paused";
  priority: "low" | "medium" | "high";
  instructions?: string;
  notes?: string;
}

export default function OperatorDashboard() {
  const { session, logout } = useUser();
  const data = (useData() as any) ?? {};
  const { actors = [], events: allEvents = [] } = data;

  const { toast } = useToast();

  // ===== Logout robusto
  const handleLogout = () => {
    try {
      logout?.();
    } finally {
      localStorage.removeItem("lastOperatorDid");
      window.location.href = "/login?reset=1";
    }
  };

  // ===== Risoluzione Operatore corrente
  const operators: Actor[] = useMemo(
    () => (actors || []).filter((a: any) => a?.role === "operatore"),
    [actors]
  );

  const resolvedDid = useMemo(() => {
    const qs = new URLSearchParams(window.location.search).get("did") || "";
    const sess = session?.role === "operatore" && (session as any)?.did ? (session as any).did : "";
    const cached = localStorage.getItem("lastOperatorDid") || "";
    const first = operators[0]?.id || "";
    const did = qs || sess || cached || first || "";
    if (did) localStorage.setItem("lastOperatorDid", did);
    return did;
  }, [session?.role, (session as any)?.did, operators]);

  const me: Actor | null = useMemo(() => {
    if (!resolvedDid) return null;
    const found = (actors || []).find((a: any) => a.id === resolvedDid);
    if (found) return found as Actor;
    return { id: resolvedDid, name: (session as any)?.username || "Operatore", seed: "", credits: 0, role: "operatore" } as Actor;
  }, [actors, resolvedDid, (session as any)?.username]);

  if (!operators.length && !me?.id) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="text-xl font-semibold">Nessun operatore configurato</div>
          <p className="text-muted-foreground mt-2">Crea un membro con ruolo “operatore” dalla dashboard Azienda.</p>
          <a href="/login?reset=1" className="mt-3 inline-block px-3 py-2 border rounded border-border">Torna al login</a>
        </div>
      </div>
    );
  }
  if (!me?.id) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="text-xl font-semibold">Nessun operatore selezionato</div>
          <p className="text-muted-foreground mt-2">Apri con <code>?did=&lt;DID-operatore&gt;</code> o fai login come operatore.</p>
          <a href="/login?reset=1" className="mt-3 inline-block px-3 py-2 border rounded border-border">Torna al login</a>
        </div>
      </div>
    );
  }

  // ===== Stato UI
  const [activeTab, setActiveTab] = useState<Tab>("storico"); // default come nello screenshot
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskNotes, setTaskNotes] = useState<string>("");

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedVC, setSelectedVC] = useState<VerifiableCredential | null>(null);

  // ===== Crediti (DataContext first, fallback)
  const getCredits: (did: string) => number =
    data.getCredits || ((did: string) => (data.credits?.byActor?.[did] ?? 0));
  const spendCredits: (did: string, amount: number, reason: string, refId?: string) => void =
    data.spendCredits ||
    ((did: string, amount: number) => {
      const ok = data.spendFromActor?.(did, amount);
      if (!ok) throw new Error("Crediti insufficienti");
    });
  const seedCreditsIfEmpty: (did: string, amount: number) => void =
    data.seedCreditsIfEmpty ||
    ((did: string, amount: number) => {
      const bal = data.credits?.byActor?.[did];
      if (bal === undefined && data.grantToActor) data.grantToActor(did, amount);
    });

  useEffect(() => {
    if (me?.id) seedCreditsIfEmpty(me.id, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  const credits = me?.id ? getCredits(me.id) : 0;

  // ===== Task derivati dalle assegnazioni
  const assignmentsForMe = useMemo(() => {
    if (data.getAssignmentsForOperator) return data.getAssignmentsForOperator(me.id);
    const list = (allEvents || []) as any[];
    return list
      .filter((e) => {
        const k = e?.kind || e?.type;
        const toMe =
          e?.assignedOperatorDid === me.id ||
          e?.operatorDid === me.id ||
          e?.assignedToDid === me.id ||
          e?.operatoreId === me.id;
        return (k === "assignment" || k === "Assegnazione") && toMe;
      })
      .map((ev: any) => ({ ...ev, status: effectiveStatus(ev) }));
  }, [data.getAssignmentsForOperator, allEvents, me.id]);

  const assignedTasks: Task[] = useMemo(() => assignmentsForMe.map(mapAssignmentToTask), [assignmentsForMe]);
  const completedTasks: Task[] = useMemo(
    () => assignmentsForMe.filter((ev: any) => (ev.status as AssignmentStatus) === "done").map(mapAssignmentToTask),
    [assignmentsForMe]
  );

  // ===== Storico eventi per l’operatore
  const myEvents: Event[] = useMemo(() => {
    const list = (allEvents || []) as Event[];
    return list.filter((e: any) => e?.operatoreId === me.id);
  }, [allEvents, me.id]);

  // ===== Mutazioni
  const updateAssignmentStatus: (assignmentId: string, next: AssignmentStatus, performerDid: string) => void =
    data.updateAssignmentStatus || (() => {});
  const addNote: (parentEventId: string, note: string, performedByDid: string) => void =
    data.addNote || (() => {});

  function handleStartTask(task: Task) {
    try {
      if (task.status !== "assigned") throw new Error("Il task non è in stato 'assigned'.");
      updateAssignmentStatus(task.id, "in_progress", me.id);
      toast({ title: "Task avviato", description: `Task ${task.title} in esecuzione.` });
    } catch (e: any) {
      toast({ title: "Errore", description: e.message ?? String(e) });
    }
  }

  function handleCompleteTask(task: Task) {
    try {
      if (task.status !== "in_progress") throw new Error("Il task non è in esecuzione.");
      if (credits < COMPLETE_COST) throw new Error(`Crediti insufficienti (richiede ${COMPLETE_COST}).`);

      spendCredits(me.id, COMPLETE_COST, "operator_execute", task.id);

      const trimmed = taskNotes.trim();
      if (trimmed) {
        if (getCredits(me.id) < NOTE_COST) {
          toast({ title: "Nota non salvata", description: "Credito insufficiente per la nota (richiede 1)." });
        } else {
          spendCredits(me.id, NOTE_COST, "note", task.id);
          addNote(task.id, trimmed, me.id);
        }
      }

      updateAssignmentStatus(task.id, "done", me.id);
      setTaskNotes("");
      setSelectedTask(null);
      toast({ title: "Task completato", description: `Task ${task.title} completato.` });
    } catch (e: any) {
      toast({ title: "Errore", description: e.message ?? String(e) });
    }
  }

  // ===== Sidebar
  const sidebarItems = [
    { id: "tasks", label: "🧰 Task Assegnati" },
    { id: "storico", label: "📜 Storico Attività" },
    { id: "prodotti", label: "📦 Prodotti" },
    { id: "vc", label: "🎫 Verifiable Credentials" },
    { id: "crediti", label: "🪙 Crediti" },
    { id: "json", label: "🧾 JSON Center" },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <div className="flex min-h-screen w-full">
        <aside className="shrink-0">
          <Sidebar
            title="TRUSTUP"
            subtitle={`Operatore ${me.name || ""}`}
            items={sidebarItems}
            activeItem={activeTab}
            onItemClick={(id) => setActiveTab(id as Tab)}
            onLogout={handleLogout}
          />
        </aside>

        <section className="flex-1 min-w-0 flex flex-col">
          <Header user={{ username: me.name || "Operatore", role: "operatore" }} onLogout={handleLogout} />

          <div className="flex-1">
            <div className="max-w-7xl mx-auto w-full p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-1">Dashboard Operatore</h1>
                    <p className="text-muted-foreground">{me.name || "Operatore"} — Esecuzione task operativi</p>
                  </div>
                  <div className="rounded-full border border-border bg-muted px-3 py-1 text-sm">
                    <span className="opacity-70 mr-1">Crediti:</span>
                    <span className="font-medium">{credits}</span>
                  </div>
                </div>
              </div>

              {/* ===== Tasks ===== */}
              {activeTab === "tasks" && (
                <div className="space-y-6">
                  <SectionCard title={`Task Assegnati (${assignedTasks.length})`}>
                    {assignedTasks.length === 0 ? (
                      <EmptyState title="Nessun task assegnato" description="Quando riceverai una nuova assegnazione, la troverai qui." />
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          {assignedTasks.map((task) => (
                            <button
                              key={task.id}
                              onClick={() => setSelectedTask(task)}
                              className={`w-full text-left border border-border rounded-xl p-4 transition-colors bg-card/60 hover:bg-card ${
                                selectedTask?.id === task.id ? "ring-2 ring-primary" : ""
                              }`}
                            >
                              <div className="flex justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{task.title}</div>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    <span>Assegnato: {new Date(task.assignedAt).toLocaleDateString("it-IT")}</span>
                                    {task.dueDate && <span className="ml-4">Scadenza: {new Date(task.dueDate).toLocaleDateString("it-IT")}</span>}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                                    {task.priority}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {task.status}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>

                        {selectedTask ? (
                          <div className="space-y-4">
                            <SectionCard title="Dettagli Task">
                              <div className="space-y-4">
                                <div>
                                  <div className="font-medium">{selectedTask.title}</div>
                                  <p className="text-muted-foreground mt-1">{selectedTask.description}</p>
                                </div>

                                {selectedTask.instructions && (
                                  <div>
                                    <div className="font-medium text-sm">Istruzioni</div>
                                    <p className="text-sm text-muted-foreground">{selectedTask.instructions}</p>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                  {selectedTask.status === "assigned" && (
                                    <button
                                      onClick={() => handleStartTask(selectedTask)}
                                      className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                                    >
                                      Inizia Task
                                    </button>
                                  )}

                                  {selectedTask.status === "in_progress" && (
                                    <>
                                      <button
                                        disabled
                                        className="inline-flex items-center rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground/80 border border-border cursor-not-allowed opacity-70"
                                      >
                                        Pausa
                                      </button>
                                      <button
                                        onClick={() => handleCompleteTask(selectedTask)}
                                        disabled={credits < COMPLETE_COST}
                                        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                                          credits < COMPLETE_COST
                                            ? "bg-muted text-foreground/70 border border-border cursor-not-allowed"
                                            : "bg-primary text-primary-foreground hover:opacity-90"
                                        }`}
                                      >
                                        Completa (−{COMPLETE_COST})
                                      </button>
                                    </>
                                  )}

                                  {selectedTask.status === "paused" && (
                                    <button
                                      onClick={() => handleStartTask(selectedTask)}
                                      className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                                    >
                                      Riprendi
                                    </button>
                                  )}
                                </div>

                                {selectedTask.status === "in_progress" && (
                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      Note (costo {NOTE_COST})
                                    </label>
                                    <textarea
                                      value={taskNotes}
                                      onChange={(e) => setTaskNotes(e.target.value)}
                                      rows={3}
                                      placeholder="Aggiungi note sul lavoro svolto…"
                                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                                    />
                                  </div>
                                )}
                              </div>
                            </SectionCard>
                          </div>
                        ) : (
                          <div className="hidden lg:block">
                            <SectionCard>
                              <EmptyState
                                title="Seleziona un task"
                                description="Clicca su un elemento a sinistra per vedere i dettagli e le azioni."
                              />
                            </SectionCard>
                          </div>
                        )}
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}

              {/* ===== Storico ===== */}
              {activeTab === "storico" && (
                <div className="space-y-6">
                  <SectionCard title={`Task Completati (${completedTasks.length})`}>
                    {completedTasks.length === 0 ? (
                      <EmptyState title="Nessun task completato" description="Completa un task per vederlo qui." />
                    ) : (
                      <div className="space-y-3">
                        {completedTasks.map((task) => (
                          <div key={task.id} className="border border-border rounded-xl p-3 bg-card">
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <div className="font-medium text-sm truncate">{task.title}</div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                                {task.notes && <p className="text-xs text-primary mt-1">Note: {task.notes}</p>}
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600/90 text-white shrink-0">completed</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>

                  <SectionCard title={`Eventi Generati (${myEvents.length})`}>
                    {myEvents.length === 0 ? (
                      <EmptyState title="Nessun evento" description="Gli eventi che generi appariranno qui." />
                    ) : (
                      <EventList events={myEvents as any} onSelect={setSelectedEvent as any} />
                    )}
                  </SectionCard>

                  {selectedEvent && (
                    <SectionCard title="Dettagli Evento">
                      <EventDetails event={selectedEvent as any} />
                    </SectionCard>
                  )}

                  <SectionCard title="Cronologia Completa">
                    <EventHistory events={myEvents as any} />
                  </SectionCard>
                </div>
              )}

              {/* ===== Prodotti ===== */}
              {activeTab === "prodotti" && (
                <div className="space-y-6">
                  <SectionCard title="Prodotti Assegnati">
                    <EmptyState title="Nessun prodotto" description="Non hai prodotti assegnati direttamente." />
                  </SectionCard>
                </div>
              )}

              {/* ===== VC ===== */}
              {activeTab === "vc" && (
                <div className="space-y-6">
                  <SectionCard title="Verifiable Credentials">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <VCList vcs={[]} onSelect={setSelectedVC} />
                      </div>
                      {selectedVC ? (
                        <div>
                          <VCViewer vc={selectedVC} />
                          <div className="mt-4"><VerifyFlag vc={selectedVC} /></div>
                        </div>
                      ) : (
                        <SectionCard>
                          <EmptyState title="Seleziona una VC" description="Scegli un elemento per vederne i dettagli." />
                        </SectionCard>
                      )}
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ===== Crediti ===== */}
              {activeTab === "crediti" && (
                <div className="space-y-6">
                  <SectionCard title="Saldo Personale">
                    <CreditsDashboard credits={credits} onBuyCredits={() => {}} />
                    <p className="text-sm text-muted-foreground mt-2">
                      I crediti sono gestiti dall’azienda e vengono consumati su azioni operative (es. note, completamento).
                    </p>
                  </SectionCard>

                  <SectionCard title="Storico Movimenti">
                    <UserCreditsHistory history={[]} />
                  </SectionCard>
                </div>
              )}

              {/* ===== JSON Center ===== */}
              {activeTab === "json" && <JSONCenterOperator assigned={assignedTasks} completed={completedTasks} events={myEvents} />}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- JSON Center (riutilizzabile) ---------- */
function JSONCenterOperator({
  assigned,
  completed,
  events,
}: {
  assigned: Task[];
  completed: Task[];
  events: Event[];
}) {
  type DatasetKey = "tasks_active" | "tasks_completed" | "events_mine";
  const [ds, setDs] = useState<DatasetKey>("tasks_active");
  const [filter, setFilter] = useState("");

  const data = useMemo(() => {
    let base: any[] = [];
    if (ds === "tasks_active") base = assigned;
    if (ds === "tasks_completed") base = completed;
    if (ds === "events_mine") base = events;

    if (filter.trim()) {
      try {
        const rx = new RegExp(filter.trim(), "i");
        base = base.filter((item) => rx.test(JSON.stringify(item)));
      } catch {
        // ignore invalid regex
      }
    }
    return base;
  }, [ds, filter, assigned, completed, events]);

  function copyJson() {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      console.log("[toast] Copiato JSON");
    } catch {}
  }
  function downloadJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `${ds}.json`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <SectionCard title="JSON Center" subtitle="Esporta o copia i dati filtrati">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-56">
          <label className="text-sm text-muted-foreground block mb-1">Dataset</label>
          <select
            value={ds}
            onChange={(e) => setDs(e.target.value as DatasetKey)}
            className="w-full bg-background border border-border rounded-md px-2 py-2"
          >
            <option value="tasks_active">Task attivi</option>
            <option value="tasks_completed">Task completati</option>
            <option value="events_mine">Eventi operatore</option>
          </select>
        </div>
        <div className="grow min-w-[240px]">
          <label className="text-sm text-muted-foreground block mb-1">Filtro (regex)</label>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
            placeholder="es. PRD-001 | done | TYPE-A"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={copyJson} className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-2 text-sm">
            Copia JSON
          </button>
          <button onClick={downloadJson} className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90">
            Download .json
          </button>
        </div>
      </div>

      <pre className="mt-4 p-3 bg-card border border-border rounded-lg overflow-auto text-xs max-h-[60vh]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </SectionCard>
  );
}

/* ---------- Helpers ---------- */
function mapAssignmentToTask(ev: any): Task {
  const status = (ev.status as AssignmentStatus) ?? "queued";
  return {
    id: String(ev.id || ev.eventId || `assign-${ev.productId || ""}-${ev.createdAt || Date.now()}`),
    title: ev.title || ev.message || "Assegnazione",
    description: ev.description || ev.message || `Prodotto ${ev.productId || "-"} • Tipo ${ev.typeId || ev.policyId || "-"}`,
    productId: ev.productId,
    productName: ev.productName,
    assignedBy: ev.createdByDid || ev.creatorDid || ev.creatorId || "creator",
    assignedAt: ev.createdAt || ev.timestamp || ev.date || new Date().toISOString(),
    status: status === "queued" ? "assigned" : status === "in_progress" ? "in_progress" : status === "done" ? "completed" : "paused",
    priority: (ev.priority as any) || "medium",
    instructions: ev.instructions,
  };
}
