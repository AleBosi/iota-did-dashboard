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
      type: "give",
      description: `Azienda creata: ${newAzienda.name}`,
      aziendaId: newAzienda.id,
      aziendaName: newAzienda.name
    };
    setCreditHistory(prev => [transaction, ...prev]);
  };

  // Gestione aggiornamento azienda
  const handleUpdateAzienda = (updatedAzienda: Azienda) => {
    setAziende(prev => prev.map(a => a.id === updatedAzienda.id ? updatedAzienda : a));
    setSelectedAzienda(null);
  };

  // Gestione eliminazione azienda
  const handleDeleteAzienda = (aziendaId: string) => {
    const azienda = aziende.find(a => a.id === aziendaId);
    if (azienda && window.confirm(`Sei sicuro di voler eliminare l'azienda ${azienda.name}?`)) {
      setAziende(prev => prev.filter(a => a.id !== aziendaId));
      setSelectedAzienda(null);
      
      // Aggiungi transazione di eliminazione
      const transaction: CreditTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount: 0,
        type: "give",
        description: `Azienda eliminata: ${azienda.name}`,
        aziendaId: azienda.id,
        aziendaName: azienda.name
      };
      setCreditHistory(prev => [transaction, ...prev]);
    }
  };

  // Gestione invio crediti
  const handleSendCredits = () => {
    if (!selectedAziendaForCredits || creditsToGive <= 0) {
      alert("Seleziona un'azienda e inserisci un importo valido");
      return;
    }

    if (creditsToGive > systemCredits) {
      alert("Crediti insufficienti nel sistema");
      return;
    }

    const azienda = aziende.find(a => a.id === selectedAziendaForCredits);
    if (!azienda) return;

    // Aggiorna crediti azienda
    const updatedAzienda = { ...azienda, credits: (azienda.credits || 0) + creditsToGive };
    setAziende(prev => prev.map(a => a.id === selectedAziendaForCredits ? updatedAzienda : a));
    
    // Aggiorna crediti sistema
    setSystemCredits(prev => prev - creditsToGive);
    
    // Aggiungi transazione
    const transaction: CreditTransaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: creditsToGive,
      type: "give",
      description: `Crediti inviati a ${azienda.name}`,
      aziendaId: azienda.id,
      aziendaName: azienda.name
    };
    setCreditHistory(prev => [transaction, ...prev]);
    
    // Reset form
    setCreditsToGive(0);
    setSelectedAziendaForCredits("");
    
    alert(`${creditsToGive} crediti inviati a ${azienda.name}`);
  };

  // Gestione ricarica sistema
  const handleRechargeSystem = () => {
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
      description: `Ricarica sistema: +${rechargeAmount} crediti`
    };
    setCreditHistory(prev => [transaction, ...prev]);
    
    setRechargeAmount(0);
    alert(`Sistema ricaricato con ${rechargeAmount} crediti`);
  };

  // Gestione backup
  const handleExportData = () => {
    const dataToExport: AdminState = {
      aziende,
      systemCredits,
      creditHistory,
      totalSystemMovements: creditHistory.length
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData: AdminState = JSON.parse(e.target?.result as string);
        setBackupData(importedData);
      } catch (error) {
        alert('Errore nel caricamento del file');
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreData = () => {
    if (!backupData) return;
    
    if (window.confirm('Sei sicuro di voler ripristinare i dati? Tutti i dati attuali verranno sovrascritti.')) {
      setAziende(backupData.aziende || []);
      setSystemCredits(backupData.systemCredits || 50000);
      setCreditHistory(backupData.creditHistory || []);
      setBackupData(null);
      alert('Dati ripristinati con successo');
    }
  };

  const sidebarItems = [
    { id: "aziende", label: "Aziende", icon: "🏢" },
    { id: "crediti", label: "Crediti sistema", icon: "💰" },
    { id: "backup", label: "Import/Export", icon: "📁" }
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar
        title="DPP IOTA"
        subtitle={`Admin ${session?.username || 'Sistema'}`}
        items={sidebarItems}
        activeItem={activeTab}
        onItemClick={(id) => setActiveTab(id as any)}
        onLogout={logout}
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Dashboard Admin"
          subtitle="Gestione completa del sistema IOTA DID"
        />
        
        <main className="flex-1 p-6">
          {activeTab === "aziende" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gestione Aziende</h2>
                <button
                  onClick={() => setShowAziendaForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + Nuova Azienda
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
                    onUpdate={handleUpdateAzienda}
                    onDelete={() => handleDeleteAzienda(selectedAzienda.id)}
                  />
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-4">Lista Aziende ({aziende.length})</h3>
                  <AziendaList
                    aziende={aziende}
                    onSelect={setSelectedAzienda}
                    onDelete={handleDeleteAzienda}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "crediti" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Gestione Crediti Sistema</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Stato Sistema */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-4">Stato Sistema</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Crediti Disponibili:</span>
                      <span className="font-bold text-green-600">{systemCredits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aziende Registrate:</span>
                      <span className="font-bold">{aziende.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transazioni Totali:</span>
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
                      <label className="block text-sm font-medium mb-1">Azienda:</label>
                      <select
                        value={selectedAziendaForCredits}
                        onChange={(e) => setSelectedAziendaForCredits(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Seleziona azienda...</option>
                        {aziende.map(azienda => (
                          <option key={azienda.id} value={azienda.id}>
                            {azienda.name} (Crediti: {azienda.credits || 0})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Importo:</label>
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

          {activeTab === "backup" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Import/Export Dati</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Export */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-4">Esporta Dati</h3>
                  <p className="text-gray-600 mb-4">
                    Scarica un backup completo di tutti i dati del sistema.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    📁 Esporta Backup
                  </button>
                </div>

                {/* Import */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-4">Importa Dati</h3>
                  <p className="text-gray-600 mb-4">
                    Carica un file di backup per ripristinare i dati.
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="w-full mb-4 p-2 border rounded"
                  />
                  {backupData && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm">
                        File caricato: {backupData.aziende?.length || 0} aziende, 
                        {backupData.creditHistory?.length || 0} transazioni
                      </p>
                      <button
                        onClick={handleRestoreData}
                        className="mt-2 bg-yellow-600 text-white px-4 py-1 rounded text-sm hover:bg-yellow-700"
                      >
                        Ripristina Dati
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistiche Sistema */}
              <div className="mt-6 bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Statistiche Sistema</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{aziende.length}</div>
                    <div className="text-sm text-gray-600">Aziende</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{systemCredits.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Crediti Sistema</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{creditHistory.length}</div>
                    <div className="text-sm text-gray-600">Transazioni</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {aziende.reduce((sum, a) => sum + (a.credits || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Crediti Distribuiti</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
