import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { Actor } from "../../models/actor";
import { Event } from "../../models/event";
import { VerifiableCredential } from "../../models/vc";
import MacchinarioDetails from "../Actors/Macchinari/MacchinarioDetails";
import EventList from "../Events/EventList";
import EventDetails from "../Events/EventDetails";
import EventHistory from "../Events/EventHistory";
import EventAction from "../Events/EventAction";
import VCList from "../VC/VCList";
import VCViewer from "../VC/VCViewer";
import VCVerifier from "../VC/VCVerifier";
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
  events: Event[];
  machineVCs: VerifiableCredential[];
  telemetryHistory: TelemetryData[];
  credits: number;
  creditHistory: CreditTransaction[];
  currentTelemetry: TelemetryData;
}

export default function MacchinarioDashboard({ macchinario }: { macchinario: Actor }) {
  const { logout } = useUser();
  const [activeTab, setActiveTab] = useState<"stato" | "tasks" | "eventi" | "vc" | "crediti">("stato");

  // Stati per gestione stato macchina
  const [currentTelemetry, setCurrentTelemetry] = useState<TelemetryData>({
    timestamp: new Date().toISOString(),
    temperature: 45.2,
    pressure: 2.1,
    vibration: 0.3,
    speed: 1200,
    powerConsumption: 85.5,
    efficiency: 92.3,
    status: "operational"
  });
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);

  // Stati per gestione task
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Stati per gestione eventi
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Stati per gestione VC
  const [machineVCs, setMachineVCs] = useState<VerifiableCredential[]>([]);
  const [selectedVC, setSelectedVC] = useState<VerifiableCredential | null>(null);

  // Stati per gestione crediti
  const [credits, setCredits] = useState<number>(macchinario.credits || 0);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);

  // Carica dati macchinario
  useEffect(() => {
    const savedData = localStorage.getItem(`macchinario-${macchinario.id}-data`);
    if (savedData) {
      try {
        const data: MacchinarioState = JSON.parse(savedData);
        setAssignedTasks(data.assignedTasks || []);
        setCompletedTasks(data.completedTasks || []);
        setEvents(data.events || []);
        setMachineVCs(data.machineVCs || []);
        setTelemetryHistory(data.telemetryHistory || []);
        setCredits(data.credits || macchinario.credits || 0);
        setCreditHistory(data.creditHistory || []);
        if (data.currentTelemetry) {
          setCurrentTelemetry(data.currentTelemetry);
        }
      } catch (error) {
        console.error('Errore nel caricamento dati macchinario:', error);
      }
    }

    // Simula alcuni task assegnati per demo
    if (assignedTasks.length === 0) {
      const demoTasks: Task[] = [
        {
          id: "1",
          title: "Lavorazione Automatica Lotto A",
          description: "Eseguire lavorazione automatica del lotto A secondo specifiche",
          productId: "prod-1",
          productName: "Componente Meccanico A",
          assignedBy: "creator-1",
          assignedAt: new Date().toISOString(),
          status: "assigned",
          priority: "high",
          automationLevel: "full_auto",
          instructions: "Lavorazione completamente automatizzata"
        },
        {
          id: "2",
          title: "Controllo Qualità Semi-Automatico",
          description: "Controllo qualità con supervisione operatore",
          assignedBy: "creator-1",
          assignedAt: new Date(Date.now() - 86400000).toISOString(),
          status: "in_progress",
          priority: "medium",
          automationLevel: "semi_auto",
          instructions: "Richiede supervisione per parametri critici"
        }
      ];
      setAssignedTasks(demoTasks);
    }
  }, [macchinario.id, assignedTasks.length]);

  // Simula aggiornamento telemetria in tempo reale
  useEffect(() => {
    const interval = setInterval(() => {
      const newTelemetry: TelemetryData = {
        timestamp: new Date().toISOString(),
        temperature: 40 + Math.random() * 20,
        pressure: 1.8 + Math.random() * 0.6,
        vibration: 0.1 + Math.random() * 0.4,
        speed: 1100 + Math.random() * 200,
        powerConsumption: 80 + Math.random() * 20,
        efficiency: 88 + Math.random() * 8,
        status: Math.random() > 0.95 ? "maintenance" : "operational"
      };
      
      setCurrentTelemetry(newTelemetry);
      setTelemetryHistory(prev => [...prev.slice(-99), newTelemetry]); // Mantieni solo gli ultimi 100 record
    }, 5000); // Aggiorna ogni 5 secondi

    return () => clearInterval(interval);
  }, []);

  // Salva dati automaticamente
  useEffect(() => {
    const dataToSave: MacchinarioState = {
      assignedTasks,
      completedTasks,
      events,
      machineVCs,
      telemetryHistory,
      credits,
      creditHistory,
      currentTelemetry
    };
    localStorage.setItem(`macchinario-${macchinario.id}-data`, JSON.stringify(dataToSave));
  }, [assignedTasks, completedTasks, events, machineVCs, telemetryHistory, credits, creditHistory, currentTelemetry, macchinario.id]);

  // Gestione esecuzione automatica task
  const handleExecuteTask = (taskId: string) => {
    const task = assignedTasks.find(t => t.id === taskId);
    if (!task) return;

    // Simula esecuzione automatica
    setAssignedTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, status: "in_progress" as const }
        : t
    ));

    // Crea evento di inizio
    const startEvent: Event = {
      id: Date.now().toString(),
      type: "machine_start",
      title: "Task avviato automaticamente",
      description: `Task ${task.title} avviato dal macchinario`,
      createdBy: macchinario.id,
      timestamp: new Date().toISOString(),
      status: "active"
    };
    setEvents(prev => [...prev, startEvent]);

    // Simula completamento automatico dopo un delay
    if (task.automationLevel === "full_auto") {
      setTimeout(() => {
        handleCompleteTask(taskId);
      }, 3000);
    }
  };

  // Gestione completamento task
  const handleCompleteTask = (taskId: string) => {
    const task = assignedTasks.find(t => t.id === taskId);
    if (!task) return;

    const completedTask: Task = {
      ...task,
      status: "completed"
    };

    setAssignedTasks(prev => prev.filter(t => t.id !== taskId));
    setCompletedTasks(prev => [...prev, completedTask]);

    // Crea evento di completamento
    const completeEvent: Event = {
      id: Date.now().toString(),
      type: "machine_complete",
      title: "Task completato automaticamente",
      description: `Task ${task.title} completato dal macchinario`,
      createdBy: macchinario.id,
      timestamp: new Date().toISOString(),
      status: "active"
    };
    setEvents(prev => [...prev, completeEvent]);

    // Simula consumo crediti per task automatico
    const creditCost = 5;
    if (credits >= creditCost) {
      setCredits(prev => prev - creditCost);
      const creditTransaction: CreditTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount: creditCost,
        type: "spend",
        description: `Crediti consumati per task automatico: ${task.title}`
      };
      setCreditHistory(prev => [...prev, creditTransaction]);
    }
  };

  // Gestione generazione eventi automatici
  const handleGenerateEvent = (eventType: "start" | "stop" | "error" | "maintenance") => {
    const eventTitles = {
      start: "Macchina avviata",
      stop: "Macchina fermata",
      error: "Errore rilevato",
      maintenance: "Manutenzione richiesta"
    };

    const newEvent: Event = {
      id: Date.now().toString(),
      type: `machine_${eventType}`,
      title: eventTitles[eventType],
      description: `Evento ${eventType} generato automaticamente dal macchinario`,
      createdBy: macchinario.id,
      timestamp: new Date().toISOString(),
      status: "active"
    };

    setEvents(prev => [...prev, newEvent]);

    // Aggiorna stato telemetria se necessario
    if (eventType === "error") {
      setCurrentTelemetry(prev => ({
        ...prev,
        status: "error",
        errorCode: "E001",
        errorMessage: "Errore generico rilevato"
      }));
    } else if (eventType === "maintenance") {
      setCurrentTelemetry(prev => ({
        ...prev,
        status: "maintenance"
      }));
    }
  };

  // Render tab stato macchina
  const renderStatoTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Stato Macchina e Telemetria</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Informazioni Macchinario</h3>
        <MacchinarioDetails macchinario={macchinario} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Telemetria in Tempo Reale</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{currentTelemetry.temperature.toFixed(1)}°C</div>
            <div className="text-sm text-gray-600">Temperatura</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{currentTelemetry.pressure.toFixed(1)} bar</div>
            <div className="text-sm text-gray-600">Pressione</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{currentTelemetry.vibration.toFixed(2)} mm/s</div>
            <div className="text-sm text-gray-600">Vibrazione</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{currentTelemetry.speed} rpm</div>
            <div className="text-sm text-gray-600">Velocità</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{currentTelemetry.powerConsumption.toFixed(1)} kW</div>
            <div className="text-sm text-gray-600">Consumo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">{currentTelemetry.efficiency.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Efficienza</div>
          </div>
          <div className="text-center col-span-2">
            <div className={`text-2xl font-bold ${
              currentTelemetry.status === "operational" ? "text-green-600" :
              currentTelemetry.status === "maintenance" ? "text-yellow-600" :
              currentTelemetry.status === "error" ? "text-red-600" :
              "text-gray-600"
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
          Ultimo aggiornamento: {new Date(currentTelemetry.timestamp).toLocaleString()}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Controlli Manuali</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleGenerateEvent("start")}
            className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
          >
            Avvia Macchina
          </button>
          <button
            onClick={() => handleGenerateEvent("stop")}
            className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
          >
            Ferma Macchina
          </button>
          <button
            onClick={() => handleGenerateEvent("error")}
            className="bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700"
          >
            Simula Errore
          </button>
          <button
            onClick={() => handleGenerateEvent("maintenance")}
            className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
          >
            Richiedi Manutenzione
          </button>
        </div>
      </div>
    </div>
  );

  // Render tab task
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
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      {task.productName && (
                        <p className="text-xs text-blue-600 mt-1">Prodotto: {task.productName}</p>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Assegnato: {new Date(task.assignedAt).toLocaleDateString()}</span>
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

              <div className="text-sm">
                <p><span className="font-medium">Livello automazione:</span> {selectedTask.automationLevel}</p>
                <p><span className="font-medium">Priorità:</span> {selectedTask.priority}</p>
              </div>

              {selectedTask.status === "assigned" && (
                <button
                  onClick={() => handleExecuteTask(selectedTask.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {selectedTask.automationLevel === "full_auto" ? "Esegui Automaticamente" : "Avvia Task"}
                </button>
              )}

              {selectedTask.status === "in_progress" && selectedTask.automationLevel !== "full_auto" && (
                <button
                  onClick={() => handleCompleteTask(selectedTask.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Completa Task
                </button>
              )}
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
                  <span>Completato: {new Date(task.assignedAt).toLocaleDateString()}</span>
                  <span className="ml-4">Automazione: {task.automationLevel}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  // Render tab eventi
  const renderEventiTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Eventi Macchina</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Eventi Recenti ({events.length})</h3>
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

  // Render tab VC
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
              <VCVerifier vc={selectedVC} />
              <VerifyFlag vc={selectedVC} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render tab crediti
  const renderCreditiTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Gestione Crediti Macchina</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Saldo Crediti</h3>
        <CreditsDashboard credits={credits} onBuyCredits={() => {}} />
        <p className="text-sm text-gray-600 mt-2">
          I crediti vengono ricevuti dall'azienda e consumati per attività automatiche.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Storico Movimenti</h3>
        <UserCreditsHistory history={creditHistory} />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="macchinario" />
      <div className="flex-1 flex flex-col">
        <Header 
          user={{ 
            username: macchinario.name, 
            role: "macchinario" 
          }} 
          onLogout={logout} 
        />
        
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Macchinario</h1>
            <p className="text-gray-600">{macchinario.name} - Vista digitale del macchinario</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: "stato", label: "Stato & Telemetria" },
                { id: "tasks", label: "Task Assegnati" },
                { id: "eventi", label: "Eventi" },
                { id: "vc", label: "Verifiable Credentials" },
                { id: "crediti", label: "Crediti" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === "stato" && renderStatoTab()}
            {activeTab === "tasks" && renderTasksTab()}
            {activeTab === "eventi" && renderEventiTab()}
            {activeTab === "vc" && renderVCTab()}
            {activeTab === "crediti" && renderCreditiTab()}
          </div>
        </div>
      </div>
    </div>
  );
}

