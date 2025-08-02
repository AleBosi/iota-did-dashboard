import React, { useState } from "react";
import { registerCompany, findEntityBySeed } from "./identityStorage";
import { generateSeedPhrase } from "./seedUtils";

export default function SeedLogin({
  onAziendaLogin,
  onUtenteLogin
}: {
  onAziendaLogin: (companyObj: any) => void;
  onUtenteLogin: ({ company, member }: { company: any; member: any }) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [seedInput, setSeedInput] = useState("");
  const [generatedSeed, setGeneratedSeed] = useState<string | null>(null);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  // LOGIN tramite seed (cerca sia azienda che membro)
  async function handleLogin() {
    setLoading(true);
    setTimeout(() => {
      const result = findEntityBySeed(seedInput.trim());
      if (!result) {
        alert("Seed non trovata. Assicurati di aver inserito quella corretta.");
      } else if (result.type === "company") {
        onAziendaLogin(result.company);
      } else {
        onUtenteLogin({ company: result.company, member: result.member });
      }
      setLoading(false);
    }, 500); // mock async
  }

  // INIZIA REGISTRAZIONE NUOVA AZIENDA
  function handleStartNewCompany() {
    setGeneratedSeed(generateSeedPhrase());
    setMode("register");
    setNewCompanyName("");
  }

  // REGISTRAZIONE NUOVA AZIENDA (tramite identityStorage)
  function handleRegisterNewCompany() {
    if (!newCompanyName || !generatedSeed) {
      alert("Compila il nome azienda e genera la seed.");
      return;
    }
    const { company } = registerCompany(newCompanyName, generatedSeed);
    onAziendaLogin(company);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Logo TRUSTUP centrato sopra il box */}
      <div className="w-[500px] flex flex-col items-center mb-6">
        <img
          src="/TRUSTUP.png"
          alt="TRUSTUP Logo"
          className="w-72 mb-2"
          style={{ objectFit: "contain" }}
        />
      </div>
      {/* Box login largo, fondo tenue */}
      <div className="w-[500px] max-w-full bg-blue-50 rounded-2xl p-10 shadow-2xl flex flex-col items-center">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-7">Login</h2>
        {mode === "login" && (
          <>
            <textarea
              placeholder="Inserisci la seed aziendale o utente/macchina"
              value={seedInput}
              onChange={e => setSeedInput(e.target.value)}
              className="w-full min-h-[70px] mb-5 rounded-lg border border-gray-300 p-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
              disabled={loading}
            />
            <div className="flex flex-col gap-4 sm:flex-row w-full">
              <button
                onClick={handleLogin}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-lg text-lg flex-1"
                disabled={loading}
              >
                {loading ? "Verifica..." : "Login"}
              </button>
              <button
                onClick={handleStartNewCompany}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-lg flex-1"
                disabled={loading}
              >
                Crea nuova azienda
              </button>
            </div>
          </>
        )}
        {/* Registrazione nuova azienda */}
        {mode === "register" && generatedSeed && (
          <div className="mt-7 w-full">
            <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-900 font-mono px-5 py-3 rounded-lg mb-7 text-center">
              <b>La tua seed aziendale:</b>
              <br />
              <span className="text-lg">{generatedSeed}</span>
              <br />
              <span className="text-red-600 font-semibold text-sm block mt-1">
                Copia e custodisci questa frase, non sarà più mostrata!
              </span>
            </div>
            <input
              placeholder="Nome azienda"
              value={newCompanyName}
              onChange={e => setNewCompanyName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
            />
            <button
              onClick={handleRegisterNewCompany}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-3 font-bold text-lg mb-3"
            >
              Registra azienda e accedi
            </button>
            <button
              onClick={() => setMode("login")}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-6 py-3 font-medium text-lg"
            >
              Indietro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
