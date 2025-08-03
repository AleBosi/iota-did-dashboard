import React, { useState } from "react";
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
import { useUser } from "../../contexts/UserContext";

export default function AdminDashboard() {
  const [aziende, setAziende] = useState<Azienda[]>([]);
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);
  const [systemCredits, setSystemCredits] = useState(10000);
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [creditsToGive, setCreditsToGive] = useState(0);
  const { logout } = useUser();

  const handleCreateAzienda = (azienda: Azienda) => setAziende(prev => [...prev, azienda]);

  const handleGiveCredits = () => {
    if (!selectedAzienda || creditsToGive <= 0 || creditsToGive > systemCredits) return;
    setSystemCredits(c => c - creditsToGive);
    setCreditHistory(h => [
      ...h,
      { id: Date.now().toString(), date: new Date().toISOString(), amount: creditsToGive, type: "give", description: `Erogati a ${selectedAzienda.name}` }
    ]);
    selectedAzienda.credits = (selectedAzienda.credits || 0) + creditsToGive;
    setAziende(prev => prev.map(a => a.id === selectedAzienda.id ? { ...a, credits: selectedAzienda.credits } : a));
    setCreditsToGive(0);
  };

  const exportData = { aziende, systemCredits, creditHistory };
  const handleImport = (json: any) => {
    if (json.aziende) setAziende(json.aziende);
    if (json.systemCredits) setSystemCredits(json.systemCredits);
    if (json.creditHistory) setCreditHistory(json.creditHistory);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col">
        <Header user={{ username: "Admin", role: "admin" }} onLogout={logout} />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard Amministratore</h1>
          <div className="mb-6">
            <AziendaForm onCreate={handleCreateAzienda} />
            <AziendaList aziende={aziende} onSelect={setSelectedAzienda} />
            {selectedAzienda && <AziendaDetails azienda={selectedAzienda} />}
          </div>
          <div className="mb-6">
            <h2 className="font-bold mb-2">Gestione crediti sistema</h2>
            <CreditsDashboard credits={systemCredits} onBuyCredits={() => {}} />
            <div className="flex items-center gap-2 mb-2">
              <span>Eroga crediti a:</span>
              <select onChange={e => {
                const azienda = aziende.find(a => a.id === e.target.value);
                setSelectedAzienda(azienda || null);
              }}>
                <option value="">Seleziona azienda</option>
                {aziende.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <input type="number" value={creditsToGive} min={1} max={systemCredits}
                onChange={e => setCreditsToGive(Number(e.target.value))}
                className="border px-2 py-1 rounded mx-2" />
              <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={handleGiveCredits}>
                Eroga
              </button>
            </div>
            <UserCreditsHistory history={creditHistory} />
          </div>
          <div className="mb-6">
            <ImportExportBox label="admin" onImport={handleImport} exportData={exportData} />
            <CopyJsonBox label="Export dati" json={exportData} />
          </div>
        </div>
      </div>
    </div>
  );
}
