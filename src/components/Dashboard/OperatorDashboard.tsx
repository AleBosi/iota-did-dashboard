import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { Actor } from "../../models/actor";
import { Product } from "../../models/product";
import { Event } from "../../models/event";
import { VerifiableCredential } from "../../models/vc";
import EventList from "../Events/EventList";
import EventDetails from "../Events/EventDetails";
import VCList from "../VC/VCList";
import VCViewer from "../VC/VCViewer";
import UserCreditsHistory from "../Credits/UserCreditsHistory";
import ImportExportBox from "../Common/ImportExportBox";
import CopyJsonBox from "../Common/CopyJsonBox";
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

export default function OperatorDashboard({ operatore }: { operatore: Actor }) {
  const { logout } = useUser();
  const [activeTab, setActiveTab] = useState<"tasks" | "storico" | "prodotti" | "vc" | "crediti">("tasks");

  // Stati per gestione task
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskNotes, setTaskNotes] = useState<string>("");

  // Stati per gestione eventi e storico
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Stati per prodotti e VC assegnati
  const [assignedProducts, setAssignedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [assignedVCs, setAssignedVCs] = useState<VerifiableCredential[]>([]);
  const [selectedVC, setSelectedVC] = useState<VerifiableCredential | null>(null);

  // Stati per gestione crediti
  const [credits, setCredits] = useState<number>(operatore.credits || 0);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);

  // Carica dati operatore
  useEffect(() => {
    const savedData = localStorage.getItem(`operatore-${operatore.id}-data`);
    if (savedData) {
      try {
        const data: OperatorState = JSON.parse(savedData);
        setAssignedTasks(data.assignedTasks || []);
        setCompletedTasks(data.completedTasks || []);
        setEvents(data.events || []);
        setAssignedProducts(data.assignedProducts || []);
        setAssignedVCs(data.assignedVCs || []);
        setCredits(data.credits || operatore.credits || 0);
        setCreditHistory(data.creditHistory || []);
      } catch (error) {
        console.error('Errore nel caricamento dati operatore:', error);
      }
    }

    // Simula alcuni task assegnati per demo
    if (assignedTasks.length === 0) {
      const demoTasks: Task[] = [
        {
          id: "1",
          title: "Assemblaggio Componente A",
          description: "Assemblare il componente A seguendo le specifiche del BOM",
          productId: "prod-1",
          productName: "Prodotto Demo 1",
          assignedBy: "creator-1",
          assignedAt: new Date().toISOString(),
          status: "assigned",
          priority: "high",
          instructions: "Seguire attentamente le istruzioni di assemblaggio"
        },
        {
          id: "2",
          title: "Controllo Qualità",
          description: "Effettuare controllo qualità sui prodotti finiti",
          assignedBy: "creator-1",
          assignedAt: new Date(Date.now() - 86400000).toISOString(),
          status: "in_progress",
          priority: "medium",
          instructions: "Verificare tutti i parametri di qualità"
        }
      ];
      setAssignedTasks(demoTasks);
    }
  }, [operatore.id, assignedTasks.length]);

  // Salva dati automaticamente
  useEffect(() => {
    const dataToSave: OperatorState = {
      assignedTasks,
      completedTasks,
      events,
      assignedProducts,
      assignedVCs,
      credits,
      creditHistory
    };
    localStorage.setItem(`operatore-${operatore.id}-data`, JSON.stringify(dataToSave));
  }, [assignedTasks, completedTasks, events, assignedProducts, assignedVCs, credits, creditHistory, operatore.id]);

  // Gestione inizio task
  const handleStartTask = (taskId: string) => {
    setAssignedTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: "in_progress" as const }
        : task
    ));

    // Crea evento di inizio
    const startEvent: Event = {
      id: Date.now().toString(),
      type: "task_start",
      title: "Task iniziato",
      description: `Task ${selectedTask?.title} iniziato dall'operatore`,
      createdBy: operatore.id,
      timestamp: new Date().toISOString(),
      status: "active"
    };
    setEvents(prev => [...prev, startEvent]);
  };

  // Gestione completamento task
  const handleCompleteTask = (taskId: string) => {
    const task = assignedTasks.find(t => t.id === taskId);
    if (!task) return;

    const completedTask: Task = {
      ...task,
      status: "completed",
      notes: taskNotes
    };

    setAssignedTasks(prev => prev.filter(t => t.id !== taskId));
    setCompletedTasks(prev => [...prev, completedTask]);

    // Crea evento di completamento
    const completeEvent: Event = {
      id: Date.now().toString(),
      type: "task_complete",
      title: "Task completato",
      description: `Task ${task.title} completato dall'operatore`,
      createdBy: operatore.id,
      timestamp: new Date().toISOString(),
      status: "active"
    };
    setEvents(prev => [...prev, completeEvent]);

    // Simula guadagno crediti per task completato
    const creditReward = 10;
    setCredits(prev => prev + creditReward);
    const creditTransaction: CreditTransaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: creditReward,
      type: "receive",
      description: `Crediti ricevuti per completamento task: ${task.title}`
    };
    setCreditHistory(prev => [...prev, creditTransaction]);

    setTaskNotes("");
    setSelectedTask(null);
  };

  // Gestione pausa task
  const handlePauseTask = (taskId: string) => {
    setAssignedTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: "paused" as const }
        : task
    ));

    // Crea evento di pausa
    const pauseEvent: Event = {
      id: Date.now().toString(),
      type: "task_pause",
      title: "Task in pausa",
      description: `Task ${selectedTask?.title} messo in pausa dall'operatore`,
      createdBy: operatore.id,
      timestamp: new Date().toISOString(),
      status: "active"
    };
    setEvents(prev => [...prev, pauseEvent]);
  };

  // Render tab task assegnati
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
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      {task.productName && (
                        <p className="text-xs text-blue-600 mt-1">Prodotto: {task.productName}</p>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Assegnato: {new Date(task.assignedAt).toLocaleDateString()}</span>
                        {task.dueDate && (
                          <span className="ml-4">Scadenza: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === "assigned" ? "bg-yellow-100 text-yellow-800" :
                        task.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                        task.status === "paused" ? "bg-orange-100 text-orange-800" :
                        "bg-gray-100 text-gray-800"
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

              <div className="flex gap-2">
                {selectedTask.status === "assigned" && (
                  <button
                    onClick={() => handleStartTask(selectedTask.id)}
                    className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Inizia Task
                  </button>
                )}
                
                {selectedTask.status === "in_progress" && (
                  <>
                    <button
                      onClick={() => handlePauseTask(selectedTask.id)}
                      className="bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700"
                    >
                      Pausa
                    </button>
                    <button
                      onClick={() => handleCompleteTask(selectedTask.id)}
                      className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                    >
                      Completa
                    </button>
                  </>
                )}

                {selectedTask.status === "paused" && (
                  <button
                    onClick={() => handleStartTask(selectedTask.id)}
                    className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Riprendi
                  </button>
                )}
              </div>

              {selectedTask.status === "in_progress" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Note di completamento:</label>
                  <textarea
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Aggiungi note sul lavoro svolto..."
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render tab storico
  const renderStoricoTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Storico Attività ed Eventi</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  {task.notes && (
                    <p className="text-xs text-blue-600 mt-1">Note: {task.notes}</p>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    <span>Completato: {new Date(task.assignedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Eventi Generati ({events.length})</h3>
          <EventList events={events} onSelect={setSelectedEvent} />
        </div>
      </div>

      {selectedEvent && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Dettagli Evento</h3>
          <EventDetails event={selectedEvent} />
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Cronologia Completa</h3>
        <EventHistory events={events} />
      </div>
    </div>
  );

  // Render tab prodotti
  const renderProdottiTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Prodotti Assegnati</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Lista Prodotti ({assignedProducts.length})</h3>
          {assignedProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nessun prodotto assegnato</p>
          ) : (
            <ProductList products={assignedProducts} onSelect={setSelectedProduct} />
          )}
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

  // Render tab VC
  const renderVCTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Verifiable Credentials Assegnati</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Lista VC ({assignedVCs.length})</h3>
          {assignedVCs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nessun VC assegnato</p>
          ) : (
            <VCList vcs={assignedVCs} onSelect={setSelectedVC} />
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

  // Render tab crediti
  const renderCreditiTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Gestione Crediti Personale</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Saldo Personale</h3>
        <CreditsDashboard credits={credits} onBuyCredits={() => {}} />
        <p className="text-sm text-gray-600 mt-2">
          I crediti vengono ricevuti dall'azienda per i task completati e le attività svolte.
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
      <Sidebar role="operatore" />
      <div className="flex-1 flex flex-col">
        <Header 
          user={{ 
            username: operatore.name, 
            role: "operatore" 
          }} 
          onLogout={logout} 
        />
        
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Operatore</h1>
            <p className="text-gray-600">{operatore.name} - Esecuzione task operativi</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: "tasks", label: "Task Assegnati" },
                { id: "storico", label: "Storico Attività" },
                { id: "prodotti", label: "Prodotti" },
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
            {activeTab === "tasks" && renderTasksTab()}
            {activeTab === "storico" && renderStoricoTab()}
            {activeTab === "prodotti" && renderProdottiTab()}
            {activeTab === "vc" && renderVCTab()}
            {activeTab === "crediti" && renderCreditiTab()}
          </div>
        </div>
      </div>
    </div>
  );
}

