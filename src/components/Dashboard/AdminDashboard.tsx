import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { Azienda } from "../../models/azienda";
import AziendaForm from "../Actors/Azienda/AziendaForm";
import AziendaList from "../Actors/Azienda/AziendaList";
import AziendaDetails from "../Actors/Azienda/AziendaDetails";
import CreditsDashboard from "../Credits/CreditsDashboard";
import UserCreditsHistory from "../Credits/UserCreditsHistory";
import ImportExportBox from "../Common/ImportExportBox";
import CopyJsonBox from "../Common/CopyJsonBox";
import Header from "../Common/Header";
import Sidebar from "../Common/Sidebar";
import { generateSeed, generateDID } from "../../utils/cryptoUtils";

interface CreditTransaction {
  id: string;
  date: string;
  amount: number;
  type: "give" | "receive" | "recharge";
  description: string;
  aziendaId?: string;
  aziendaName?: string;
}

interface AdminState {
  aziende: Azienda[];
  systemCredits: number;
  creditHistory: CreditTransaction[];
  totalSystemMovements: number;
}

export default function AdminDashboard() {
  const { session, logout } = useUser();
  const [activeTab, setActiveTab] = useState<"aziende" | "crediti" | "backup">("aziende");
  
  // Stati per gestione aziende
  const [aziende, setAziende] = useState<Azienda[]>([]);
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);
  const [showAziendaForm, setShowAziendaForm] = useState(false);
  
  // Stati per gestione crediti
  const [systemCredits, setSystemCredits] = useState(50000);
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
  const [creditsToGive, setCreditsToGive] = useState(0);
  const [selectedAziendaForCredits, setSelectedAziendaForCredits] = useState<string>("");
  const [rechargeAmount, setRechargeAmount] = useState(0);
  
  // Stati per backup/restore
  const [backupData, setBackupData] = useState<AdminState | null>(null);

  // Carica dati iniziali (simulazione)
  useEffect(() => {
    // Simula caricamento dati dal localStorage o API
    const savedData = localStorage.getItem('admin-dashboard-data');
    if (savedData) {
      try {
        const data: AdminState = JSON.parse(savedData);
        setAziende(data.aziende || []);
        setSystemCredits(data.systemCredits || 50000);
        setCreditHistory(data.creditHistory || []);
      } catch (error) {
        console.error('Errore nel caricamento dati:', error);
      }
    }
  }, []);

  // Salva dati automaticamente
  useEffect(() => {
    const dataToSave: AdminState = {
      aziende,
      systemCredits,
      creditHistory,
      totalSystemMovements: creditHistory.length
    };
    localStorage.setItem('admin-dashboard-data', JSON.stringify(dataToSave));
  }, [aziende, systemCredits, creditHistory]);

  // Gestione creazione azienda
  const handleCreateAzienda = (aziendaData: Partial<Azienda>) => {
    const newAzienda: Azienda = {
      id: Date.now().toString(),
      name: aziendaData.name || "",
      email: aziendaData.email || "",
      address: aziendaData.address || "",
      phone: aziendaData.phone || "",
      seed: generateSeed(),
      did: generateDID(),
      credits: 0,
      createdAt: new Date().toISOString(),
      status: "active"
    };
    
    setAziende(prev => [...prev, newAzienda]);
    setShowAziendaForm(false);
    
    // Aggiungi transazione di creazione
    const transaction: CreditTransaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: 0,
      type: "receive",
      description: `Azienda ${newAzienda.name} creata`,
      aziendaId: newAzienda.id,
      aziendaName: newAzienda.name
    };
    setCreditHistory(prev => [...prev, transaction]);
  };

  // Gestione erogazione crediti
  const handleGiveCredits = () => {
    if (!selectedAziendaForCredits || creditsToGive <= 0 || creditsToGive > systemCredits) {
      alert("Seleziona un'azienda e inserisci un importo valido");
      return;
    }

    const azienda = aziende.find(a => a.id === selectedAziendaForCredits);
    if (!azienda) return;

    // Aggiorna crediti sistema
    setSystemCredits(prev => prev - creditsToGive);
    
    // Aggiorna crediti azienda
    setAziende(prev => prev.map(a => 
      a.id === selectedAziendaForCredits 
        ? { ...a, credits: (a.credits || 0) + creditsToGive }
        : a
    ));

    // Aggiungi transazione
    const transaction: CreditTransaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: creditsToGive,
      type: "give",
      description: `Crediti erogati a ${azienda.name}`,
      aziendaId: azienda.id,
      aziendaName: azienda.name
    };
    setCreditHistory(prev => [...prev, transaction]);

    // Reset form
    setCreditsToGive(0);
    setSelectedAziendaForCredits("");
  };

  // Gestione ricarica crediti sistema
  const handleRechargeSystemCredits = () => {
    if (rechargeAmount <= 0) {
      alert("Inserisci un importo valido");
      return;
    }

    setSystemCredits(prev => prev + rechargeAmount);
    
    const transaction: CreditTransaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: rechargeAmount,
      type: "recharge",
      description: `Ricarica crediti sistema`
    };
    setCreditHistory(prev => [...prev, transaction]);
    setRechargeAmount(0);
  };

  // Gestione export dati
  const handleExportData = () => {
    const exportData: AdminState = {
      aziende,
      systemCredits,
      creditHistory,
      totalSystemMovements: creditHistory.length
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Gestione import dati
  const handleImportData = (jsonData: any) => {
    try {
      if (jsonData.aziende) setAziende(jsonData.aziende);
      if (jsonData.systemCredits !== undefined) setSystemCredits(jsonData.systemCredits);
      if (jsonData.creditHistory) setCreditHistory(jsonData.creditHistory);
      alert("Dati importati con successo!");
    } catch (error) {
      alert("Errore nell'importazione dei dati");
      console.error(error);
    }
  };

  // Render tab aziende
  const renderAziendeTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestione Aziende</h2>
        <button
          onClick={() => setShowAziendaForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Crea Nuova Azienda
        </button>
      </div>

      {showAziendaForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Nuova Azienda</h3>
            <button
              onClick={() => setShowAziendaForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <AziendaForm onCreate={handleCreateAzienda} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Lista Aziende ({aziende.length})</h3>
          <AziendaList aziende={aziende} onSelect={setSelectedAzienda} />
        </div>

        {selectedAzienda && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Dettagli Azienda</h3>
            <AziendaDetails azienda={selectedAzienda} />
          </div>
        )}
      </div>
    </div>
  );

  // Render tab crediti
  const renderCreditiTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Gestione Crediti Sistema</h2>
      
      {/* Saldo sistema */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Saldo Sistema</h3>
        <CreditsDashboard 
          credits={systemCredits} 
          onBuyCredits={() => {}} 
        />
        
        <div className="mt-4 flex items-center gap-4">
          <input
            type="number"
            value={rechargeAmount}
            onChange={(e) => setRechargeAmount(Number(e.target.value))}
            placeholder="Importo ricarica"
            className="border border-gray-300 px-3 py-2 rounded-lg"
            min="1"
          />
          <button
            onClick={handleRechargeSystemCredits}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Ricarica Sistema
          </button>
        </div>
      </div>

      {/* Erogazione crediti */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Eroga Crediti ad Aziende</h3>
        <div className="flex items-center gap-4 mb-4">
          <select
            value={selectedAziendaForCredits}
            onChange={(e) => setSelectedAziendaForCredits(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg flex-1"
          >
            <option value="">Seleziona azienda</option>
            {aziende.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} (Crediti: {a.credits || 0})
              </option>
            ))}
          </select>
          <input
            type="number"
            value={creditsToGive}
            onChange={(e) => setCreditsToGive(Number(e.target.value))}
            placeholder="Crediti da erogare"
            className="border border-gray-300 px-3 py-2 rounded-lg"
            min="1"
            max={systemCredits}
          />
          <button
            onClick={handleGiveCredits}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            disabled={!selectedAziendaForCredits || creditsToGive <= 0}
          >
            Eroga
          </button>
        </div>
      </div>

      {/* Storico movimenti */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Storico Movimenti</h3>
        <UserCreditsHistory history={creditHistory} />
      </div>
    </div>
  );

  // Render tab backup
  const renderBackupTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Backup e Restore Sistema</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Export/Import Dati</h3>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={handleExportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mr-4"
            >
              Esporta Tutti i Dati
            </button>
            <span className="text-sm text-gray-600">
              Esporta aziende, crediti e movimenti in formato JSON
            </span>
          </div>

          <ImportExportBox 
            label="Importa Backup Sistema" 
            onImport={handleImportData} 
            exportData={{
              aziende,
              systemCredits,
              creditHistory,
              totalSystemMovements: creditHistory.length
            }} 
          />

          <CopyJsonBox 
            label="Visualizza Dati JSON" 
            json={{
              aziende: aziende.length,
              systemCredits,
              totalMovements: creditHistory.length,
              lastUpdate: new Date().toISOString()
            }} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Header 
          user={{ 
            username: session.data?.name || "Admin", 
            role: "admin" 
          }} 
          onLogout={logout} 
        />
        
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Amministratore</h1>
            <p className="text-gray-600">Gestione completa del sistema IOTA DID</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: "aziende", label: "Gestione Aziende" },
                { id: "crediti", label: "Crediti Sistema" },
                { id: "backup", label: "Backup & Restore" }
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
            {activeTab === "aziende" && renderAziendeTab()}
            {activeTab === "crediti" && renderCreditiTab()}
            {activeTab === "backup" && renderBackupTab()}
          </div>
        </div>
      </div>
    </div>
  );
}

