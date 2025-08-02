import React, { useState } from "react";
import {
  getCompanies,
  addMemberToCompany,
  saveCompanies,
  getCompanies as fetchCompanies,
} from "./identityStorage";
import { decryptSeed } from "./seedUtils";
import { getUserCredits } from "./creditUtils";

export default function AziendaDashboard({ company, logout }) {
  const [azienda, setAzienda] = useState(company);
  const [showSeed, setShowSeed] = useState(null);

  function reload() {
    const fullCompany = fetchCompanies().find(
      (c) => c.companyDid === azienda.companyDid
    );
    setAzienda(fullCompany);
  }

  function handleAddMember(memberData) {
    const { member, seed } = addMemberToCompany(
      azienda.companyDid,
      memberData
    );
    reload();
    setShowSeed({ name: member.name || member.matricola, seed });
    setTimeout(() => setShowSeed(null), 6000);
  }

  function handleDeleteMember(memberDid) {
    if (!window.confirm("Sei sicuro di voler cancellare questo utente?"))
      return;
    const companies = getCompanies();
    const idx = companies.findIndex((c) => c.companyDid === azienda.companyDid);
    if (idx >= 0) {
      companies[idx].members = companies[idx].members.filter(
        (m) => m.did !== memberDid
      );
      saveCompanies(companies);
      reload();
    }
  }

  async function handleShowSeed(member) {
    try {
      const dec = await decryptSeed(member.encryptedSeed);
      setShowSeed({ name: member.name || member.matricola, seed: dec });
      setTimeout(() => setShowSeed(null), 6000);
    } catch {
      alert("Errore decifratura seed");
    }
  }

  function handleDeleteCompany() {
    if (
      !window.confirm(
        "ATTENZIONE: Questa azione è irreversibile. Vuoi davvero cancellare l’azienda?"
      )
    )
      return;
    let companies = getCompanies();
    companies = companies.filter((c) => c.companyDid !== azienda.companyDid);
    saveCompanies(companies);
    logout();
  }

  if (!azienda) return <div>Caricamento azienda...</div>;

  // Suddivisione membri per ruolo
  const operatori = azienda.members.filter((m) => m.role === "Operatore");
  const macchinari = azienda.members.filter((m) => m.role === "Macchinario");
  const creator = azienda.members.filter((m) => m.role === "Creator");

  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl relative">
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Dashboard Azienda</h1>

      <div className="text-gray-700 mb-4">
        <p>
          <b>Nome azienda:</b> {azienda.companyName}
        </p>
        <p>
          <b>DID aziendale:</b>{" "}
          <span className="font-mono text-sm text-blue-700">{azienda.companyDid}</span>
        </p>
        <p>
          <b>Utenti/macchinari:</b> {azienda.members.length}
        </p>
      </div>

      <button
        onClick={logout}
        className="absolute top-6 right-6 bg-gray-200 text-gray-800 px-4 py-1.5 rounded-md font-semibold hover:bg-gray-300"
      >
        Logout
      </button>

      <h2 className="text-xl font-semibold mt-8 mb-3">Crea nuovo membro (Operatore, Macchinario, Creator)</h2>
      <CreateMember onCreate={handleAddMember} />

      {/* CREATOR */}
      <h2 className="text-xl font-semibold mt-10 mb-3">
        Creator ({creator.length})
      </h2>
      {creator.length === 0 && (
        <div className="text-gray-500 mb-4">Nessun creator presente.</div>
      )}
      <ul className="space-y-3">
        {creator.map((member) => (
          <li
            key={member.did}
            className="bg-purple-50 rounded-lg p-4 flex flex-col"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full">
              <div>
                <div className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                  {member.name}
                  <span className="text-purple-700 font-medium ml-2">(Creator)</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-xl font-semibold text-base">
                  Crediti: {getUserCredits(member.did)?.saldo ?? 0}
                </span>
                <button
                  onClick={() => handleShowSeed(member)}
                  className="bg-green-100 text-green-800 font-semibold rounded-xl px-6 py-2 text-base hover:bg-green-200 text-center"
                >
                  Mostra seed
                </button>
                <button
                  onClick={() => handleDeleteMember(member.did)}
                  className="bg-red-100 text-red-700 font-semibold rounded-xl px-6 py-2 text-base hover:bg-red-200 text-center"
                >
                  Elimina
                </button>
              </div>
            </div>
            <div className="font-mono text-xs text-gray-500 mt-4 break-all">
              {member.did}
            </div>
          </li>
        ))}
      </ul>

      {/* OPERATORI */}
      <h2 className="text-xl font-semibold mt-10 mb-3">
        Operatori ({operatori.length})
      </h2>
      {operatori.length === 0 && (
        <div className="text-gray-500 mb-4">Nessun operatore presente.</div>
      )}
      <ul className="space-y-3">
        {operatori.map((member) => (
          <li
            key={member.did}
            className="bg-blue-50 rounded-lg p-4 flex flex-col"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full">
              <div>
                <div className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                  {member.name}
                  <span className="text-green-700 font-medium ml-2">(Operatore)</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-semibold text-base">
                  Crediti: {getUserCredits(member.did)?.saldo ?? 0}
                </span>
                <button
                  onClick={() => handleShowSeed(member)}
                  className="bg-green-100 text-green-800 font-semibold rounded-xl px-6 py-2 text-base hover:bg-green-200 text-center"
                >
                  Mostra seed
                </button>
                <button
                  onClick={() => handleDeleteMember(member.did)}
                  className="bg-red-100 text-red-700 font-semibold rounded-xl px-6 py-2 text-base hover:bg-red-200 text-center"
                >
                  Elimina
                </button>
              </div>
            </div>
            <div className="font-mono text-xs text-gray-500 mt-4 break-all">
              {member.did}
            </div>
          </li>
        ))}
      </ul>

      {/* MACCHINARI */}
      <h2 className="text-xl font-semibold mt-10 mb-3">
        Macchinari ({macchinari.length})
      </h2>
      {macchinari.length === 0 && (
        <div className="text-gray-500 mb-4">Nessun macchinario presente.</div>
      )}
      <ul className="space-y-3">
        {macchinari.map((member) => (
          <li
            key={member.did}
            className="bg-blue-50 rounded-lg p-4 flex flex-col"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full">
              <div>
                <div className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                  {member.matricola}
                  <span className="text-blue-700 font-medium ml-2">(Macchinario)</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-semibold text-base">
                  Crediti: {getUserCredits(member.did)?.saldo ?? 0}
                </span>
                <button
                  onClick={() => handleShowSeed(member)}
                  className="bg-green-100 text-green-800 font-semibold rounded-xl px-6 py-2 text-base hover:bg-green-200 text-center"
                >
                  Mostra seed
                </button>
                <button
                  onClick={() => handleDeleteMember(member.did)}
                  className="bg-red-100 text-red-700 font-semibold rounded-xl px-6 py-2 text-base hover:bg-red-200 text-center"
                >
                  Elimina
                </button>
              </div>
            </div>
            <div className="font-mono text-xs text-gray-500 mt-4 break-all">
              {member.did}
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={handleDeleteCompany}
        className="bg-red-600 text-white font-bold mt-10 px-6 py-3 rounded-lg text-lg hover:bg-red-700"
      >
        Cancella azienda
      </button>

      {showSeed && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-yellow-200 text-yellow-900 px-6 py-4 rounded-xl shadow-xl font-mono z-50">
          <b>Seed {showSeed.name}:</b>
          <br />
          <span className="text-base">{showSeed.seed}</span>
        </div>
      )}
    </div>
  );
}

// --- FORM CREAZIONE NUOVO MEMBRO ---
function CreateMember({ onCreate }) {
  const [role, setRole] = useState("Operatore");
  const [name, setName] = useState("");
  const [matricola, setMatricola] = useState("");

  function handleSubmit(e) {
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
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg"
    >
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="px-3 py-2 rounded-md border border-gray-300"
      >
        <option value="Operatore">Operatore</option>
        <option value="Macchinario">Macchinario</option>
        <option value="Creator">Creator</option>
      </select>
      {(role === "Operatore" || role === "Creator") ? (
        <input
          placeholder={role === "Creator" ? "Nome Creator" : "Nome e Cognome"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex-1 px-3 py-2 rounded-md border border-gray-300"
        />
      ) : (
        <input
          placeholder="Matricola"
          value={matricola}
          onChange={(e) => setMatricola(e.target.value)}
          required
          className="flex-1 px-3 py-2 rounded-md border border-gray-300"
        />
      )}
      <button
        type="submit"
        className="bg-green-600 text-white px-5 py-2 rounded-md font-bold hover:bg-green-700"
      >
        + Aggiungi
      </button>
    </form>
  );
}
