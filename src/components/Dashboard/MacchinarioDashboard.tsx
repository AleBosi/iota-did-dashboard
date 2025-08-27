import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useData } from "../../state/DataContext";

import { Actor } from "../../models/actor";
import { Event as UiEvent } from "../../models/event";
import { VerifiableCredential } from "../../models/vc";

import EventList from "../Events/EventList";
import EventDetails from "../Events/EventDetails";
import EventHistory from "../Events/EventHistory";
import VCList from "../VC/VCList";
import VCViewer from "../VC/VCViewer";
import VerifyFlag from "../VC/VerifyFlag";
import CreditsDashboard from "../Credits/CreditsDashboard";
import UserCreditsHistory from "../Credits/UserCreditsHistory";

import Sidebar from "../Common/Sidebar";
import Header from "../Common/Header";

interface Task {
  id: string;
  title: string;
  description: string;
  productId?: string;
  productName?: string;
  assignedBy: string;
  assignedAt: string;
  dueDate?: string;
  status: "assigned" | "in_progress" | "completed" | "error";
  priority: "low" | "medium" | "high";
  instructions?: string;
  automationLevel: "manual" | "semi_auto" | "full_auto";
}
interface TelemetryData {
  timestamp: string;
  temperature: number;
  pressure: number;
  vibration: number;
  speed: number;
  powerConsumption: number;
  efficiency: number;
  status: "operational" | "maintenance" | "error" | "offline";
  errorCode?: string;
  errorMessage?: string;
}
interface CreditTransaction {
  id: string;
  date: string;
  amount: number;
  type: "receive" | "spend";
  description: string;
  fromAzienda?: string;
}
interface MacchinarioState {
  assignedTasks: Task[];
  completedTasks: Task[];
  events: UiEvent[];
  machineVCs: VerifiableCredential[];
  telemetryHistory: TelemetryData[];
  credits: number;
  creditHistory: CreditTransaction[];
  currentTelemetry: TelemetryData;
}

const TELEMETRY_COST = 1;
const AUTO_TASK_COST = 5;

type Tab = "stato" | "tasks" | "eventi" | "vc" | "crediti";

export default function MacchinarioDashboard() {
  const { session, logout } = useUser();
  const data = (useData() as any) ?? {};
  const { actors = [], credits, events: allEvents = [], addEvent, spendFromActor } = data;

  // logout robusto
  const handleLogout = () => {
    try {
      logout?.();
    } finally {
      localStorage.removeItem("lastMachineDid");
      window.location.href = "/login?reset=1";
    }
  };

  // risoluzione macchina corrente
  const machines: Actor[] = useMemo(
    () => (actors || []).filter((a: any) => a?.role === "macchinario"),
    [actors]
  );

  const resolvedDid = useMemo(() => {
    const qs = new URLSearchParams(window.location.search).get("did") || "";
    const sess = session?.role === "macchinario" && session?.did ? session.did : "";
    const cached = localStorage.getItem("lastMachineDid") || "";
    const first = machines[0]?.id || "";
    const did = qs || sess || cached || first || "";
    if (did) localStorage.setItem("lastMachineDid", did);
    return did;
  }, [session?.role, session?.did, machines]);

  const me: Actor | null = useMemo(() => {
    if (!resolvedDid) return null;
    const found = (actors || []).find((a: any) => a.id === resolvedDid);
    if (found) return found as Actor;
    return { id: resolvedDid, name: session?.username || "Macchinario", seed: "", credits: 0, role: "macchinario" } as Actor;
  }, [actors, resolvedDid, session?.username]);

  if (!machines.length && !me?.id) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold">Nessun macchinario configurato</div>
          <p className="text-gray-600 mt-2">Crea un membro con ruolo “macchinario” dalla dashboard Azienda.</p>
          <a href="/login?reset=1" className="mt-3 inline-block px-3 py-2 border rounded">Torna al login</a>
        </div>
      </div>
    );
  }
  if (!me?.id) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold">Nessun macchinario selezionato</div>
          <p className="text-gray-600 mt-2">Apri con <code>?did=&lt;DID-macchina&gt;</code> o fai login come macchinario.</p>
          <a href="/login?reset=1" className="mt-3 inline-block px-3 py-2 border rounded">Torna al login</a>
        </div>
      </div>
    );
  }

  const machineDid = me.id;
  const machineCreditsGlobal = (credits?.byActor?.[machineDid] ?? 0) as number;

  // state UI
  const [activeTab, setActiveTab] = useState<Tab>("stato");

  const [currentTelemetry, setCurrentTelemetry] = useState<TelemetryData>({
    timestamp: new Date().toISOString(),
    temperature: 45.2,
    pressure: 2.1,
    vibration: 0.3,
    speed: 1200,
    powerConsumption: 85.5,
    efficiency: 92.3,
    status: "operational",
  });
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);

  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [events, setEvents] = useState<UiEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<UiEvent | null>(null);

  const [machineVCs, setMachineVCs] = useState<VerifiableCredential[]>([]);
  const [selectedVC, setSelectedVC] = useState<VerifiableCredential | null>(null);

  const [creditsLocal, setCreditsLocal] = useState<number>(me.credits || 0);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);

  // load persistente
  useEffect(() => {
    const saved = localStorage.getItem(`macchinario-${machineDid}-data`);
    if (saved) {
      try {
        const d: MacchinarioState = JSON.parse(saved);
        setAssignedTasks(d.assignedTasks || []);
        setCompletedTasks(d.completedTasks || []);
        setEvents(d.events || []);
        setMachineVCs(d.machineVCs || []);
        setTelemetryHistory(d.telemetryHistory || []);
        setCreditsLocal(typeof d.credits === "number" ? d.credits : me.credits || 0);
        setCreditHistory(d.creditHistory || []);
        if (d.currentTelemetry) setCurrentTelemetry(d.currentTelemetry);
      } catch (e) {
        console.error("Errore nel caricamento dati macchinario:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineDid]);

  // merge assegnazioni -> tasks
  const assignmentsForMe = useMemo(() => {
    const list = (allEvents || []) as any[];
    return list.filter((e) => {
      const k = e?.kind || e?.type;
      const toMe =
        e?.assignedMachineDid === machineDid ||
        e?.machineDid === machineDid ||
        e?.assignedToDid === machineDid;
      return k === "assignment" && toMe;
    });
  }, [allEvents, machineDid]);

  useEffect(() => {
    if (!assignmentsForMe.length) return;
    const mapped: Task[] = assignmentsForMe.map((ev: any) => ({
      id: String(ev.id || ev.eventId || `assign-${ev.productId || ""}-${ev.createdAt || Date.now()}`),
      title: ev.title || ev.message || "Task Macchina",
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
      automationLevel: ev.automationLevel || "full_auto",
    }));
    setAssignedTasks((prev) => mergeTasks(prev, mapped));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(assignmentsForMe)]);

  // save persistente
  useEffect(() => {
    const toSave: MacchinarioState = {
      assignedTasks,
      completedTasks,
      events,
      machineVCs,
      telemetryHistory,
      credits: creditsLocal,
      creditHistory,
      currentTelemetry,
    };
    localStorage.setItem(`macchinario-${machineDid}-data`, JSON.stringify(toSave));
  }, [assignedTasks, completedTasks, events, machineVCs, telemetryHistory, creditsLocal, creditHistory, currentTelemetry, machineDid]);

  // telemetria “live”
  useEffect(() => {
    const id = setInterval(() => {
      const t: TelemetryData = {
        timestamp: new Date().toISOString(),
        temperature: 40 + Math.random() * 20,
        pressure: 1.8 + Math.random() * 0.6,
        vibration: 0.1 + Math.random() * 0.4,
        speed: 1100 + Math.random() * 200,
        powerConsumption: 80 + Math.random() * 20,
        efficiency: 88 + Math.random() * 8,
        status: Math.random() > 0.95 ? "maintenance" : "operational",
      };
      setCurrentTelemetry(t);
      setTelemetryHistory((prev) => [...prev.slice(-99), t]);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // helpers eventi globali
  function appendStatus(task: Task, status: "active" | "completed") {
    if (!addEvent) return;
    addEvent({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      kind: "status",
      parentEventId: task.id,
      status,
      performedByDid: machineDid,
      machineDid,
      productId: task.productId,
      createdAt: new Date().toISOString(),
    });
  }
  function appendTelemetrySnapshot(job?: Task) {
    if (!addEvent) return;
    const payload = {
      temperature: currentTelemetry.temperature,
      pressure: currentTelemetry.pressure,
      vibration: currentTelemetry.vibration,
      speed: currentTelemetry.speed,
      energy: Number(currentTelemetry.powerConsumption.toFixed(2)),
      efficiency: currentTelemetry.efficiency,
      status: currentTelemetry.status,
      errorCode: currentTelemetry.errorCode,
      errorMessage: currentTelemetry.errorMessage,
    };
    addEvent({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      kind: "telemetry",
      parentEventId: job?.id,
      payload,
      performedByDid: machineDid,
      machineDid,
      createdAt: new Date().toISOString(),
      productId: job?.productId,
    });
    if (spendFromActor) spendFromActor(machineDid, TELEMETRY_COST, `Telemetria${job ? ` su task ${job.id}` : ""}`);
    setCreditsLocal((c) => c - TELEMETRY_COST);
    setCreditHistory((h) => [
      ...h,
      { id: `${Date.now()}-telemetry`, date: new Date().toISOString(), amount: TELEMETRY_COST, type: "spend", description: `Invio telemetria${job ? ` (task ${job.title})` : ""}` },
    ]);
  }

  // actions task
  const handleExecuteTask = (taskId: string) => {
    const task = assignedTasks.find((t) => t.id === taskId);
    if (!task) return;
    setAssignedTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "in_progress" } : t)));
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "machine_start",
        title: "Task avviato automaticamente",
        description: `Task ${task.title} avviato dal macchinario`,
        createdBy: machineDid,
        timestamp: new Date().toISOString(),
        status: "active",
      } as any,
    ]);
    appendStatus(task, "active");
    if ((task.automationLevel || "full_auto") === "full_auto") {
      setTimeout(() => handleCompleteTask(taskId), 3000);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    const task = assignedTasks.find((t) => t.id === taskId);
    if (!task) return;
    const done: Task = { ...task, status: "completed" };
    setAssignedTasks((prev) => prev.filter((t) => t.id !== taskId));
    setCompletedTasks((prev) => [...prev, done]);
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "machine_complete",
        title: "Task completato automaticamente",
        description: `Task ${task.title} completato dal macchinario`,
        createdBy: machineDid,
        timestamp: new Date().toISOString(),
        status: "active",
      } as any,
    ]);
    appendStatus(task, "completed");
    if (spendFromActor) spendFromActor(machineDid, AUTO_TASK_COST, `Task automatico: ${task.title}`);
    setCreditsLocal((c) => c - AUTO_TASK_COST);
    setCreditHistory((h) => [
      ...h,
      { id: `${Date.now()}-auto-task`, date: new Date().toISOString(), amount: AUTO_TASK_COST, type: "spend", description: `Crediti consumati per task automatico: ${task.title}` },
    ]);
  };

  // tabs content
  const renderStatoTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Stato Macchina e Telemetria</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
          <h3 className="text-lg font-medium mb-4">Identità Macchinario</h3>
          <div className="text-sm text-gray-600">Nome</div>
          <div className="mb-2 break-all">{me?.name || "-"}</div>
          <div className="text-sm text-gray-600">DID</div>
          <div className="break-all text-xs mb-2">{machineDid}</div>
          <button className="px-3 py-1 text-sm border rounded" onClick={() => navigator.clipboard.writeText(machineDid)}>
            Copia DID
          </button>
          <div className="mt-4 text-sm text-gray-600">Seed</div>
          <div className="break-all text-xs mb-2">{(me as any)?.seed || "-"}</div>
          <button className="px-3 py-1 text-sm border rounded" onClick={() => navigator.clipboard.writeText((me as any)?.seed || "")}>
            Copia seed
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Crediti</h3>
          <div className="text-sm text-gray-600">Saldo globale (DataContext)</div>
          <div className="text-2xl font-bold">{machineCreditsGlobal}</div>
          <div className="mt-3 text-sm text-gray-600">Saldo locale (UI)</div>
          <div className="text-xl">{creditsLocal}</div>
          <ul className="text-sm mt-3 list-disc ml-5">
            <li>Telemetria: {TELEMETRY_COST}</li>
            <li>Task automatico: {AUTO_TASK_COST}</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Azioni</h3>
          <button
            className="px-3 py-2 border rounded disabled:opacity-50"
            disabled={machineCreditsGlobal < TELEMETRY_COST && creditsLocal < TELEMETRY_COST}
            onClick={() => appendTelemetrySnapshot(undefined)}
          >
            Invia snapshot telemetria (costo {TELEMETRY_COST})
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Telemetria in Tempo Reale</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric label="Temperatura" value={`${currentTelemetry.temperature.toFixed(1)}°C`} />
          <Metric label="Pressione" value={`${currentTelemetry.pressure.toFixed(1)} bar`} />
          <Metric label="Vibrazione" value={`${currentTelemetry.vibration.toFixed(2)} mm/s`} />
          <Metric label="Velocità" value={`${currentTelemetry.speed} rpm`} />
          <Metric label="Consumo" value={`${currentTelemetry.powerConsumption.toFixed(1)} kW`} />
          <Metric label="Efficienza" value={`${currentTelemetry.efficiency.toFixed(1)}%`} />
          <div className="text-center col-span-2">
            <div className={`text-2xl font-bold ${
              currentTelemetry.status === "operational" ? "text-green-600" :
              currentTelemetry.status === "maintenance" ? "text-yellow-600" :
              currentTelemetry.status === "error" ? "text-red-600" : "text-gray-600"
            }`}>
              {currentTelemetry.status.toUpperCase()}
            </div>
            <div className="text-sm text-gray-600">Stato Operativo</div>
          </div>
        </div>

        {currentTelemetry.errorCode && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <div className="font-medium text-red-800">Errore: {currentTelemetry.errorCode}</div>
            <div className="text-sm text-red-600">{currentTelemetry.errorMessage}</div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          Ultimo aggiornamento: {new Date(currentTelemetry.timestamp).toLocaleString("it-IT")}
        </div>
      </div>
    </div>
  );

  const renderTasksTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Task Assegnati alla Macchina</h2>

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
                        <span className="ml-4">Automazione: {task.automationLevel}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === "assigned" ? "bg-yellow-100 text-yellow-800" :
                        task.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                        task.status === "completed" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.priority === "high" ? "bg-red-100 text-red-800" :
                        task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
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
              <div>
                <h4 className="font-medium">{selectedTask.title}</h4>
                <p className="text-gray-600 mt-1">{selectedTask.description}</p>
              </div>
              {selectedTask.instructions && (
                <div>
                  <h5 className="font-medium text-sm">Istruzioni:</h5>
                  <p className="text-sm text-gray-600">{selectedTask.instructions}</p>
                </div>
              )}

              {selectedTask.status === "assigned" && (
                <button onClick={() => handleExecuteTask(selectedTask.id)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {selectedTask.automationLevel === "full_auto" ? "Esegui Automaticamente" : "Avvia Task"}
                </button>
              )}

              {selectedTask.status === "in_progress" && selectedTask.automationLevel !== "full_auto" && (
                <button onClick={() => handleCompleteTask(selectedTask.id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Completa Task
                </button>
              )}

              <div className="pt-2">
                <button
                  className="px-3 py-2 border rounded disabled:opacity-50"
                  disabled={machineCreditsGlobal < TELEMETRY_COST && creditsLocal < TELEMETRY_COST}
                  onClick={() => appendTelemetrySnapshot(selectedTask)}
                >
                  Invia telemetria per questo task (costo {TELEMETRY_COST})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Task Completati ({completedTasks.length})</h3>
        <div className="space-y-3">
          {completedTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nessun task completato</p>
          ) : (
            completedTasks.map((task) => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-sm">{task.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  <span>Completato: {new Date(task.assignedAt).toLocaleDateString("it-IT")}</span>
                  <span className="ml-4">Automazione: {task.automationLevel}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderEventiTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Eventi Macchina</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Eventi Recenti (UI) ({events.length})</h3>
          <EventList events={events} onSelect={setSelectedEvent} />
        </div>

        {selectedEvent && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dettagli Evento</h3>
            <EventDetails event={selectedEvent} />
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Storico Eventi Completo</h3>
        <EventHistory events={events} />
      </div>
    </div>
  );

  const renderVCTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Verifiable Credentials Macchina</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">VC Associati ({machineVCs.length})</h3>
          {machineVCs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nessun VC associato</p>
          ) : (
            <VCList vcs={machineVCs} onSelect={setSelectedVC} />
          )}
        </div>

        {selectedVC && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dettagli VC</h3>
            <VCViewer vc={selectedVC} />
            <div className="mt-4">
              <VerifyFlag vc={selectedVC} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCreditiTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Gestione Crediti Macchina</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Saldo Crediti</h3>
        <CreditsDashboard credits={creditsLocal} onBuyCredits={() => {}} />
        <p className="text-sm text-gray-600 mt-2">
          Il saldo qui sopra è <b>locale</b>. Il saldo globale (DataContext) è: <b>{machineCreditsGlobal}</b>.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Storico Movimenti</h3>
        <UserCreditsHistory history={creditHistory} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">
      <div className="flex min-h-screen w-full">
        <aside className="shrink-0">
          <Sidebar
            title="TRUSTUP"
            subtitle={`Macchina ${me.name || ""}`}
            items={[
              { id: "stato", label: "📟 Stato & Telemetria" },
              { id: "tasks", label: "🛠️ Task Assegnati" },
              { id: "eventi", label: "📡 Eventi" },
              { id: "vc", label: "🎫 Verifiable Credentials" },
              { id: "crediti", label: "🪙 Crediti" },
            ]}
            activeItem={activeTab}
            onItemClick={(id) => setActiveTab(id as Tab)}
            onLogout={handleLogout}
          />
        </aside>

        <section className="flex-1 min-w-0 flex flex-col">
          <Header user={{ username: me.name, role: "macchinario" }} onLogout={handleLogout} />

          <div className="flex-1">
            <div className="max-w-7xl mx-auto w-full p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Macchinario</h1>
                <p className="text-gray-600">{me.name} — Vista digitale del macchinario</p>
              </div>

              <div className="flex-1 min-w-0">
                {activeTab === "stato" && renderStatoTab()}
                {activeTab === "tasks" && renderTasksTab()}
                {activeTab === "eventi" && renderEventiTab()}
                {activeTab === "vc" && renderVCTab()}
                {activeTab === "crediti" && renderCreditiTab()}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  function Metric({ label, value }: { label: string; value: string }) {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    );
  }
}

// util
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
