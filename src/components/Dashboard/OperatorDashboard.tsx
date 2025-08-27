import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useData } from "../../state/DataContext";

import { Actor } from "../../models/actor";
import { Product } from "../../models/product";
import { Event } from "../../models/event";
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

// opzionale: se non l'hai ancora, commenta la riga seguente
// import OperatorJsonCenter from "./OperatorJsonCenter";

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
interface CreditTransaction {
  id: string;
  date: string;
  amount: number;
  type: "receive" | "spend";
  description: string;
  fromAzienda?: string;
}
interface OperatorState {
  assignedTasks: Task[];
  completedTasks: Task[];
  events: Event[];
  assignedProducts: Product[];
  assignedVCs: VerifiableCredential[];
  credits: number;
  creditHistory: CreditTransaction[];
}

const NOTE_COST = 1;
const COMPLETE_REWARD = 10;

type Tab = "tasks" | "storico" | "prodotti" | "vc" | "crediti" | "json";

export default function OperatorDashboard() {
  const { session, logout } = useUser();
  const data = (useData() as any) ?? {};
  const { actors = [], events: allEvents = [] } = data;

  // ===== Logout robusto =====
  const handleLogout = () => {
    try {
      logout?.();
    } finally {
      localStorage.removeItem("lastOperatorDid");
      window.location.href = "/login?reset=1";
    }
  };

  // ===== Risoluzione Operatore corrente =====
  const operators: Actor[] = useMemo(
    () => (actors || []).filter((a: any) => a?.role === "operatore"),
    [actors]
  );

  const resolvedDid = useMemo(() => {
    const qs = new URLSearchParams(window.location.search).get("did") || "";
    const sess = session?.role === "operatore" && session?.did ? session.did : "";
    const cached = localStorage.getItem("lastOperatorDid") || "";
    const first = operators[0]?.id || "";
    const did = qs || sess || cached || first || "";
    if (did) localStorage.setItem("lastOperatorDid", did);
    return did;
  }, [session?.role, session?.did, operators]);

  const me: Actor | null = useMemo(() => {
    if (!resolvedDid) return null;
    const found = (actors || []).find((a: any) => a.id === resolvedDid);
    if (found) return found as Actor;
    return { id: resolvedDid, name: session?.username || "Operatore", seed: "", credits: 0, role: "operatore" } as Actor;
  }, [actors, resolvedDid, session?.username]);

  if (!operators.length && !me?.id) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold">Nessun operatore configurato</div>
          <p className="text-gray-600 mt-2">Crea un membro con ruolo “operatore” dalla dashboard Azienda.</p>
          <a href="/login?reset=1" className="mt-3 inline-block px-3 py-2 border rounded">Torna al login</a>
        </div>
      </div>
    );
  }
  if (!me?.id) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold">Nessun operatore selezionato</div>
          <p className="text-gray-600 mt-2">Apri con <code>?did=&lt;DID-operatore&gt;</code> o fai login come operatore.</p>
          <a href="/login?reset=1" className="mt-3 inline-block px-3 py-2 border rounded">Torna al login</a>
        </div>
      </div>
    );
  }

  // ===== Stato UI =====
  const [activeTab, setActiveTab] = useState<Tab>("tasks");
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskNotes, setTaskNotes] = useState<string>("");

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [assignedProducts, setAssignedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [assignedVCs, setAssignedVCs] = useState<VerifiableCredential[]>([]);
  const [selectedVC, setSelectedVC] = useState<VerifiableCredential | null>(null);

  const [credits, setCredits] = useState<number>(me.credits ?? 0);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);

  // ===== Caricamento persistente =====
  useEffect(() => {
    const key = `operatore-${me.id}-data`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const d: OperatorState = JSON.parse(saved);
        setAssignedTasks(d.assignedTasks || []);
        setCompletedTasks(d.completedTasks || []);
        setEvents(d.events || []);
        setAssignedProducts(d.assignedProducts || []);
        setAssignedVCs(d.assignedVCs || []);
        setCredits(typeof d.credits === "number" ? d.credits : me.credits || 0);
        setCreditHistory(d.creditHistory || []);
      } catch (e) {
        console.error("Errore nel parsing dati operatore:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.id]);

  // ===== Merge: assegnazioni dal DataContext -> tasks UI =====
  const assignmentsForMe = useMemo(() => {
    const list = (allEvents || []) as any[];
    return list.filter((e) => {
      const k = e?.kind || e?.type; // fallback
      const toMe =
        e?.assignedOperatorDid === me.id ||
        e?.operatorDid === me.id ||
        e?.assignedToDid === me.id;
      return k === "assignment" && toMe;
    });
  }, [allEvents, me.id]);

  useEffect(() => {
    if (!assignmentsForMe.length) return;
    const mapped: Task[] = assignmentsForMe.map((ev: any) => ({
      id: String(ev.id || ev.eventId || `assign-${ev.productId || ""}-${ev.createdAt || Date.now()}`),
      title: ev.title || ev.message || "Assegnazione",
      description:
        ev.description ||
        ev.message ||
        `Prodotto ${ev.productId || "-"} • Tipo ${ev.typeId || ev.policyId || "-"}`,
      productId: ev.productId,
      productName: ev.productName,
      assignedBy: ev.createdByDid || ev.creatorDid || "creator",
      assignedAt: ev.createdAt || ev.timestamp || new Date().toISOString(),
      status: "assigned",
      priority: (ev.priority as any) || "medium",
      instructions: ev.instructions,
    }));

    setAssignedTasks((prev) => mergeTasks(prev, mapped));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(assignmentsForMe)]);

  // ===== Salvataggio persistente =====
  useEffect(() => {
    const payload: OperatorState = {
      assignedTasks,
      completedTasks,
      events,
      assignedProducts,
      assignedVCs,
      credits,
      creditHistory,
    };
    localStorage.setItem(`operatore-${me.id}-data`, JSON.stringify(payload));
  }, [assignedTasks, completedTasks, events, assignedProducts, assignedVCs, credits, creditHistory, me.id]);

  // ===== Helpers eventi (on-chain/off-chain proxy via DataContext in futuro) =====
  function appendStatus(task: Task, status: "in_progress" | "paused" | "done") {
    if (!data.addEvent) return;
    data.addEvent({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      kind: "status",
      parentEventId: task.id,
      status,
      performedByDid: me.id,
      productId: task.productId,
      createdAt: new Date().toISOString(),
    });
  }
  function appendNote(task: Task, note: string) {
    if (!data.addEvent) return;
    data.addEvent({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      kind: "note",
      parentEventId: task.id,
      note,
      performedByDid: me.id,
      productId: task.productId,
      createdAt: new Date().toISOString(),
    });
  }

  // ===== Actions =====
  const handleStartTask = (taskId: string) => {
    const task = assignedTasks.find((t) => t.id === taskId);
    setAssignedTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "in_progress" } : t)));
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "task_start",
        title: "Task iniziato",
        description: `Task ${task?.title || taskId} iniziato dall'operatore`,
        createdBy: me.id,
        timestamp: new Date().toISOString(),
        status: "active",
      } as any,
    ]);
    if (task) appendStatus(task, "in_progress");
  };

  const handleCompleteTask = (taskId: string) => {
    const task = assignedTasks.find((t) => t.id === taskId);
    if (!task) return;
    const completed: Task = { ...task, status: "completed", notes: taskNotes };
    setAssignedTasks((prev) => prev.filter((t) => t.id !== taskId));
    setCompletedTasks((prev) => [...prev, completed]);
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "task_complete",
        title: "Task completato",
        description: `Task ${task.title} completato dall'operatore`,
        createdBy: me.id,
        timestamp: new Date().toISOString(),
        status: "active",
      } as any,
    ]);
    appendStatus(task, "done");
    if (taskNotes.trim()) {
      appendNote(task, taskNotes.trim());
      if (data.spendFromActor) data.spendFromActor(me.id, NOTE_COST, `Nota su task ${task.id}`);
      setCredits((c) => c - NOTE_COST);
      setCreditHistory((h) => [
        ...h,
        { id: `${Date.now()}-spend`, date: new Date().toISOString(), amount: NOTE_COST, type: "spend", description: `Nota su task: ${task.title}` },
      ]);
    }
    setCredits((c) => c + COMPLETE_REWARD);
    setCreditHistory((h) => [
      ...h,
      { id: `${Date.now()}-reward`, date: new Date().toISOString(), amount: COMPLETE_REWARD, type: "receive", description: `Crediti per completamento task: ${task.title}` },
    ]);
    setTaskNotes("");
    setSelectedTask(null);
  };

  const handlePauseTask = (taskId: string) => {
    const task = assignedTasks.find((t) => t.id === taskId);
    setAssignedTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "paused" } : t)));
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "task_pause",
        title: "Task in pausa",
        description: `Task ${task?.title || taskId} messo in pausa dall'operatore`,
        createdBy: me.id,
        timestamp: new Date().toISOString(),
        status: "active",
      } as any,
    ]);
    if (task) appendStatus(task, "paused");
  };

  // ===== Sidebar items (coerenti con gli altri ruoli) =====
  const sidebarItems = [
    { id: "tasks", label: "🧰 Task Assegnati" },
    { id: "storico", label: "📜 Storico Attività" },
    { id: "prodotti", label: "📦 Prodotti" },
    { id: "vc", label: "🎫 Verifiable Credentials" },
    { id: "crediti", label: "🪙 Crediti" },
    { id: "json", label: "🧾 JSON Center" },
  ];

  // ===== Render dei tab =====
  const renderTasksTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Task Assegnati</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Task Attivi ({assignedTasks.length})</h3>
          <div className="space-y-4">
            {assignedTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nessun task assegnato</p>
            ) : (
              assignedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTask?.id === task.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      {task.productName && <p className="text-xs text-blue-600 mt-1">Prodotto: {task.productName}</p>}
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Assegnato: {new Date(task.assignedAt).toLocaleDateString("it-IT")}</span>
                        {task.dueDate && <span className="ml-4">Scadenza: {new Date(task.dueDate).toLocaleDateString("it-IT")}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === "assigned" ? "bg-yellow-100 text-yellow-800" :
                        task.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                        task.status === "paused" ? "bg-orange-100 text-orange-800" :
                        "bg-gray-100 text-gray-800"}`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.priority === "high" ? "bg-red-100 text-red-800" :
                        task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedTask && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dettagli Task</h3>
            <div className="space-y-4">
              <div><h4 className="font-medium">{selectedTask.title}</h4><p className="text-gray-600 mt-1">{selectedTask.description}</p></div>
              {selectedTask.instructions && (<div><h5 className="font-medium text-sm">Istruzioni:</h5><p className="text-sm text-gray-600">{selectedTask.instructions}</p></div>)}
              <div className="flex gap-2">
                {selectedTask.status === "assigned" && (
                  <button onClick={() => handleStartTask(selectedTask.id)} className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">Inizia Task</button>
                )}
                {selectedTask.status === "in_progress" && (
                  <>
                    <button onClick={() => handlePauseTask(selectedTask.id)} className="bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700">Pausa</button>
                    <button onClick={() => handleCompleteTask(selectedTask.id)} className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">Completa</button>
                  </>
                )}
                {selectedTask.status === "paused" && (
                  <button onClick={() => handleStartTask(selectedTask.id)} className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">Riprendi</button>
                )}
              </div>
              {selectedTask.status === "in_progress" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Note di completamento (costo {NOTE_COST}):</label>
                  <textarea value={taskNotes} onChange={(e) => setTaskNotes(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" rows={3} placeholder="Aggiungi note sul lavoro svolto..." />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStoricoTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Storico Attività ed Eventi</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Task Completati ({completedTasks.length})</h3>
          <div className="space-y-3">
            {completedTasks.length === 0 ? <p className="text-gray-500 text-center py-8">Nessun task completato</p> : completedTasks.map((task) => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-sm">{task.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                {task.notes && (<p className="text-xs text-blue-600 mt-1">Note: {task.notes}</p>)}
                <div className="mt-2 text-xs text-gray-500">
                  <span>Completato: {new Date(task.assignedAt).toLocaleDateString("it-IT")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Eventi Generati ({events.length})</h3>
          <EventList events={events} onSelect={setSelectedEvent} />
        </div>
      </div>
      {selectedEvent && (<div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-medium mb-4">Dettagli Evento</h3><EventDetails event={selectedEvent} /></div>)}
      <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-medium mb-4">Cronologia Completa</h3><EventHistory events={events} /></div>
    </div>
  );

  const renderProdottiTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Prodotti Assegnati</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Lista Prodotti ({assignedProducts.length})</h3>
          {assignedProducts.length === 0 ? <p className="text-gray-500 text-center py-8">Nessun prodotto assegnato</p> : <ProductList products={assignedProducts} onSelect={setSelectedProduct} />}
        </div>
        {selectedProduct && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dettagli Prodotto</h3>
            <ProductDetails product={selectedProduct} />
          </div>
        )}
      </div>
    </div>
  );

  const renderVCTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Verifiable Credentials Assegnati</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Lista VC ({assignedVCs.length})</h3>
          {assignedVCs.length === 0 ? <p className="text-gray-500 text-center py-8">Nessun VC assegnato</p> : <VCList vcs={assignedVCs} onSelect={setSelectedVC} />}
        </div>
        {selectedVC && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dettagli VC</h3>
            <VCViewer vc={selectedVC} />
            <div className="mt-4"><VerifyFlag vc={selectedVC} /></div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCreditiTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Gestione Crediti Personale</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Saldo Personale</h3>
        <CreditsDashboard credits={credits} onBuyCredits={() => {}} />
        <p className="text-sm text-gray-600 mt-2">I crediti vengono ricevuti dall'azienda per i task completati e le attività svolte.</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Storico Movimenti</h3>
        <UserCreditsHistory history={creditHistory} />
      </div>
    </div>
  );

  const renderJsonTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">JSON Center</h2>
      {/* <OperatorJsonCenter /> */}
      <p className="text-gray-600">In arrivo: lista VC, DPP, Eventi e Prodotti in JSON, con filtri.</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">
      <div className="flex min-h-screen w-full">
        <aside className="shrink-0">
          <Sidebar
            title="TRUSTUP"
            subtitle={`Operatore ${me.name || ""}`}
            items={[
              { id: "tasks", label: "🧰 Task Assegnati" },
              { id: "storico", label: "📜 Storico Attività" },
              { id: "prodotti", label: "📦 Prodotti" },
              { id: "vc", label: "🎫 Verifiable Credentials" },
              { id: "crediti", label: "🪙 Crediti" },
              { id: "json", label: "🧾 JSON Center" },
            ]}
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Operatore</h1>
                <p className="text-gray-600">{me.name || "Operatore"} — Esecuzione task operativi</p>
              </div>

              <div className="flex-1 min-w-0">
                {activeTab === "tasks" && renderTasksTab()}
                {activeTab === "storico" && renderStoricoTab()}
                {activeTab === "prodotti" && renderProdottiTab()}
                {activeTab === "vc" && renderVCTab()}
                {activeTab === "crediti" && renderCreditiTab()}
                {activeTab === "json" && renderJsonTab()}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* Fallback minimi Prodotti (se non hai componenti dedicati) */
function ProductList({ products, onSelect }: { products: Product[]; onSelect: (p: Product) => void }) {
  return (
    <ul className="space-y-2">
      {products.map((p) => (
        <li key={(p as any).productId || (p as any).id} className="border rounded p-3 hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(p)}>
          <div className="font-medium">{(p as any).name || (p as any).productName || (p as any).productId}</div>
          <div className="text-xs text-gray-600">Type: {(p as any).typeId || "-"}</div>
        </li>
      ))}
    </ul>
  );
}
function ProductDetails({ product }: { product: Product }) {
  return (
    <div className="text-sm">
      <div className="mb-1"><span className="text-gray-600">ID:</span> <span className="font-mono">{(product as any).productId || (product as any).id}</span></div>
      <div className="mb-1"><span className="text-gray-600">Nome:</span> {(product as any).name || "-"}</div>
      <div className="mb-1"><span className="text-gray-600">Tipo:</span> {(product as any).typeId || "-"}</div>
      <pre className="mt-3 p-2 bg-gray-50 rounded border overflow-auto text-xs">{JSON.stringify(product, null, 2)}</pre>
    </div>
  );
}

// ===== util =====
function mergeTasks(existing: Task[], incoming: Task[]): Task[] {
  const byId = new Map<string, Task>();
  existing.forEach((t) => byId.set(t.id, t));
  incoming.forEach((t) => {
    if (!byId.has(t.id)) {
      byId.set(t.id, t);
    }
  });
  return Array.from(byId.values());
}
