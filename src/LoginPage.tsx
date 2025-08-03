import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";

// MOCK: sostituisci con la tua lookup real storage/database!
const adminUser = { username: "admin", password: "admin123" };
// Esempio mock per seed → ruolo/utente
const seedDatabase = [
  { seed: "SEED-AZIENDA-001", role: "azienda", name: "Demo Azienda S.p.A.", id: "did:iota:evm:0xACME123" },
  { seed: "SEED-CREATOR-001", role: "creator", name: "Carla Creator", id: "did:iota:evm:0xCR1", aziendaId: "did:iota:evm:0xACME123" },
  { seed: "SEED-OPERATORE-001", role: "operatore", name: "Mario Operatore", id: "did:iota:evm:0xOP1", aziendaId: "did:iota:evm:0xACME123" },
  { seed: "SEED-MACCHINA-001", role: "macchinario", name: "Macchina 1", id: "did:iota:evm:0xMAC1", aziendaId: "did:iota:evm:0xACME123" }
];

export default function LoginPage() {
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [seed, setSeed] = useState("");
  const [seedError, setSeedError] = useState("");
  const navigate = useNavigate();
  const { login } = useUser();

  // Login admin (username + password)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      adminUsername === adminUser.username &&
      adminPassword === adminUser.password
    ) {
      login("admin", { username: adminUsername });
      navigate("/admin");
    } else {
      setAdminError("Credenziali admin non corrette.");
    }
  };

  // Login con seed
  const handleSeedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = seedDatabase.find(u => u.seed === seed);
    if (!found) {
      setSeedError("Seed non trovata!");
      return;
    }
    login(found.role, found); // found = { role, ... }
    switch (found.role) {
      case "azienda":
        navigate("/azienda");
        break;
      case "creator":
        navigate("/creator");
        break;
      case "operatore":
        navigate("/operatore");
        break;
      case "macchinario":
        navigate("/macchinario");
        break;
      default:
        setSeedError("Ruolo non riconosciuto.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-xl bg-white rounded shadow p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Login Admin */}
        <form onSubmit={handleAdminLogin} className="flex flex-col gap-4 border-r pr-6">
          <h2 className="font-bold text-lg mb-2 text-blue-800">Login Admin</h2>
          <input
            className="border rounded px-2 py-1"
            placeholder="Username"
            value={adminUsername}
            onChange={e => setAdminUsername(e.target.value)}
            autoFocus
          />
          <input
            className="border rounded px-2 py-1"
            type="password"
            placeholder="Password"
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded px-4 py-1"
          >
            Login Admin
          </button>
          {adminError && <div className="text-red-500 text-sm">{adminError}</div>}
        </form>
        {/* Login Seed */}
        <form onSubmit={handleSeedLogin} className="flex flex-col gap-4 pl-6">
          <h2 className="font-bold text-lg mb-2 text-blue-800">Login tramite Seed</h2>
          <input
            className="border rounded px-2 py-1"
            placeholder="Inserisci la tua seed"
            value={seed}
            onChange={e => setSeed(e.target.value)}
          />
          <button
            type="submit"
            className="bg-green-600 text-white rounded px-4 py-1"
          >
            Login
          </button>
          {seedError && <div className="text-red-500 text-sm">{seedError}</div>}
        </form>
      </div>
      <div className="mt-10 text-xs text-gray-400 text-center">
        Powered by IOTA DPP &bull; Login seed e dashboard automatico
      </div>
    </div>
  );
}
