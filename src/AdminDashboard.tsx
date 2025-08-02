import React, { useState, useEffect } from "react";
import {
  registerCompany,
  addMemberToCompany,
  getCompanies,
  saveCompanies,
  type Company,
  type Member,
} from "./identityStorage";
import { decryptSeed } from "./seedUtils";
import { assignCredits, getUserCredits } from "./creditUtils";

type Props = { onLogout: () => void };

export default function AdminDashboard({ onLogout }: Props) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<{ member: Member; companyIdx: number } | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [showSeed, setShowSeed] = useState<{ name: string; seed: string } | null>(null);

  useEffect(() => {
    setCompanies(getCompanies());
  }, []);

  const updateCompanies = (arr: Company[]) => {
    setCompanies(arr);
    saveCompanies(arr);
  };

  function handleCreateCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;
    const { company, seed } = registerCompany(companyName.trim());
    updateCompanies([...companies, company]);
    setShowSeed({ name: company.companyName, seed });
    setCompanyName("");
    setTimeout(() => setShowSeed(null), 9000);
  }

  function handleDeleteCompany(idx: number) {
    if (!window.confirm("Sicuro di voler eliminare questa azienda?")) return;
    const arr = companies.slice();
    arr.splice(idx, 1);
    updateCompanies(arr);
    if (openIdx === idx) setOpenIdx(null);
  }

  function handleCreateMember(companyIdx: number, memberData: { name?: string; matricola?: string; role: Member["role"] }) {
    const company = companies[companyIdx];
    const { member, seed } = addMemberToCompany(company.companyDid, memberData);
    const arr = getCompanies(); // ricarica dopo modifica
    updateCompanies(arr);
    setShowSeed({ name: member.name || member.matricola || "", seed });
    setTimeout(() => setShowSeed(null), 8000);
  }

  function handleSelectMember(companyIdx: number, member: Member) {
    setSelectedMember({ member, companyIdx });
    setCreditAmount(""); // reset field quando cambi membro
  }

  function handleAssignCredits() {
    if (!selectedMember || !creditAmount) return alert("Seleziona un membro e inserisci l'importo!");
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) return alert("Importo non valido.");
    try {
      assignCredits(selectedMember.member.did, amount, "Assegnazione admin");
      alert("Crediti assegnati correttamente!");
      setCreditAmount("");
      setSelectedMember(null);
    } catch (err: any) {
      alert(err.message || "Errore assegnazione crediti");
    }
  }

  function handleShowSeed(encrypted: string, label: string) {
    try {
      const dec = decryptSeed(encrypted);
      setShowSeed({ name: label, seed: dec });
      setTimeout(() => setShowSeed(null), 8000);
    } catch {
      alert("Errore nella decifratura.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 text-gray-900 shadow-lg mt-12 relative">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-3xl font-bold">Dashboard Amministratore</h2>
        <button
          onClick={onLogout}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-lg shadow"
        >
          Logout
        </button>
      </div>

      {/* Form nuova azienda */}
      <form onSubmit={handleCreateCompany} className="flex gap-4 mb-8">
        <input
          placeholder="Nome nuova azienda"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-3 font-bold text-lg"
        >
          + Crea azienda
        </button>
      </form>

      {/* Lista aziende */}
      <div>
        {companies.length === 0 && (
          <div className="text-gray-400 text-lg">Nessuna azienda presente.</div>
        )}
        {companies.map((company, idx) => (
          <div key={company.companyDid} className="mb-7">
            <button
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className={`w-full flex justify-between items-center px-6 py-4 rounded-xl font-bold text-xl border ${
                openIdx === idx
                  ? "bg-blue-50 border-blue-400 shadow"
                  : "bg-gray-100 border-gray-300 hover:bg-gray-200"
              } transition-colors duration-150`}
            >
              <span>{company.companyName}</span>
              <span className="text-lg">{openIdx === idx ? "▲" : "▼"}</span>
            </button>
            {/* Collapsabile */}
            {openIdx === idx && (
              <div className="pl-2 pt-3 bg-gray-50 rounded-lg mt-1">
                <div className="flex items-center mb-4 flex-wrap gap-2">
                  <span className="text-blue-700 font-mono text-sm">{company.companyDid}</span>
                  <button
                    className="bg-yellow-400 text-gray-900 font-bold px-3 py-1 rounded hover:bg-yellow-300 ml-2"
                    onClick={() => handleShowSeed(company.encryptedSeed, company.companyName)}
                  >
                    Mostra seed azienda
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-1.5 rounded font-semibold ml-3 hover:bg-red-600"
                    onClick={() => handleDeleteCompany(idx)}
                  >
                    Elimina azienda
                  </button>
                </div>
                {/* Membri */}
                {/* --- Mostra prima i Creator, poi Operatore, poi Macchinario --- */}
                <MemberSection
                  company={company}
                  idx={idx}
                  members={company.members.filter(m => m.role === "Creator")}
                  label="Creator"
                  getUserCredits={getUserCredits}
                  handleShowSeed={handleShowSeed}
                  handleSelectMember={handleSelectMember}
                  selectedMember={selectedMember}
                  creditAmount={creditAmount}
                  setCreditAmount={setCreditAmount}
                  handleAssignCredits={handleAssignCredits}
                  setSelectedMember={setSelectedMember}
                />
                <MemberSection
                  company={company}
                  idx={idx}
                  members={company.members.filter(m => m.role === "Operatore")}
                  label="Operatori"
                  getUserCredits={getUserCredits}
                  handleShowSeed={handleShowSeed}
                  handleSelectMember={handleSelectMember}
                  selectedMember={selectedMember}
                  creditAmount={creditAmount}
                  setCreditAmount={setCreditAmount}
                  handleAssignCredits={handleAssignCredits}
                  setSelectedMember={setSelectedMember}
                />
                <MemberSection
                  company={company}
                  idx={idx}
                  members={company.members.filter(m => m.role === "Macchinario")}
                  label="Macchinari"
                  getUserCredits={getUserCredits}
                  handleShowSeed={handleShowSeed}
                  handleSelectMember={handleSelectMember}
                  selectedMember={selectedMember}
                  creditAmount={creditAmount}
                  setCreditAmount={setCreditAmount}
                  handleAssignCredits={handleAssignCredits}
                  setSelectedMember={setSelectedMember}
                />

                {/* Form nuovo membro */}
                <CreateMember onCreate={data => handleCreateMember(idx, data)} />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Visualizzazione seed decifrata */}
      {showSeed && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-yellow-100 border-2 border-yellow-400 text-yellow-900 px-8 py-5 rounded-xl font-mono text-base shadow-2xl z-50">
          <b>Seed {showSeed.name}:</b>
          <br />
          <span className="break-all">{showSeed.seed}</span>
        </div>
      )}
    </div>
  );
}

// Sezione membri per ruolo
function MemberSection({
  company,
  idx,
  members,
  label,
  getUserCredits,
  handleShowSeed,
  handleSelectMember,
  selectedMember,
  creditAmount,
  setCreditAmount,
  handleAssignCredits,
  setSelectedMember,
}) {
  if (!members.length) return null;
  return (
    <>
      <div className="font-bold text-xl mt-6 mb-2">{label} ({members.length})</div>
      {members.map(member => (
        <div
          key={member.did}
          className="flex flex-col gap-2 bg-white border border-gray-200 rounded-lg px-5 py-3 mb-2 shadow-sm"
        >
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-bold text-base">{member.name || member.matricola}</span>
            <span className="text-gray-500 text-xs">({member.role})</span>
            <span className="text-gray-300 text-xs font-mono">{member.did.slice(0, 18)}...</span>
            <span className="text-green-700 text-xs font-bold">
              (crediti: {getUserCredits(member.did)?.saldo ?? 0})
            </span>
            <button
              className="ml-3 text-blue-700 underline text-xs font-semibold hover:text-blue-900"
              onClick={() => handleShowSeed(member.encryptedSeed, member.name || member.matricola || "")}
            >
              Mostra seed
            </button>
            <button
              className="ml-1 bg-blue-600 hover:bg-blue-800 text-white px-3 py-1 rounded text-xs font-semibold"
              onClick={() => handleSelectMember(idx, member)}
            >
              Crediti
            </button>
          </div>
          {/* BOX ASSEGNAZIONE CREDITI */}
          {selectedMember &&
            selectedMember.member.did === member.did &&
            selectedMember.companyIdx === idx && (
              <div className="bg-blue-50 border border-blue-200 px-5 py-3 rounded-xl shadow mb-2 mt-2">
                <div className="font-semibold text-blue-700 mb-1">
                  Azienda: {company.companyName}
                </div>
                <div className="mb-2">
                  <span className="font-bold">{member.name || member.matricola}</span>
                  <span className="ml-2 text-xs text-gray-700">({member.role})</span>
                  <span className="ml-2 text-xs text-gray-400 font-mono">{member.did.slice(0, 18)}...</span>
                  <span className="ml-2 text-green-800 font-bold text-sm">
                    (crediti attuali: {getUserCredits(member.did)?.saldo ?? 0})
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={1}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={creditAmount}
                    onChange={e => setCreditAmount(e.target.value)}
                    placeholder="Crediti"
                  />
                  <button
                    className="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg hover:bg-blue-700"
                    onClick={handleAssignCredits}
                  >
                    Assegna crediti
                  </button>
                  <button
                    className="ml-2 text-red-600 hover:text-red-800 underline text-sm font-semibold"
                    onClick={() => setSelectedMember(null)}
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}
        </div>
      ))}
    </>
  );
}

// Form nuovo membro (AGGIUNGI "Creator" tra i ruoli!)
function CreateMember({ onCreate }: { onCreate: (data: { name?: string; matricola?: string; role: Member["role"] }) => void }) {
  const [role, setRole] = useState<"Operatore" | "Macchinario" | "Creator">("Operatore");
  const [name, setName] = useState("");
  const [matricola, setMatricola] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCreate({
      name: role === "Operatore" || role === "Creator" ? name : undefined,
      matricola: role === "Macchinario" ? matricola : undefined,
      role,
    });
    setName("");
    setMatricola("");
    setRole("Operatore");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-3">
      <select
        value={role}
        onChange={e => setRole(e.target.value as any)}
        className="border border-gray-300 rounded-lg px-2 py-2 bg-gray-100 focus:outline-none"
      >
        <option value="Operatore">Operatore</option>
        <option value="Macchinario">Macchinario</option>
        <option value="Creator">Creator</option>
      </select>
      {(role === "Operatore" || role === "Creator") ? (
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={role === "Creator" ? "Nome Creator" : "Nome"}
          required
          className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
        />
      ) : (
        <input
          value={matricola}
          onChange={e => setMatricola(e.target.value)}
          placeholder="Matricola"
          required
          className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
        />
      )}
      <button
        type="submit"
        className="bg-green-600 text-white rounded-lg px-5 py-2 font-bold hover:bg-green-700"
      >
        + Aggiungi
      </button>
    </form>
  );
}
