import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import { generateDID } from "./utils/cryptoUtils";

const adminUser = { username: "admin", password: "admin123" };

export default function LoginPage() {
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [seed, setSeed] = useState("");
  const [seedError, setSeedError] = useState("");
  const [selectedRole, setSelectedRole] = useState<"azienda" | "creator" | "operatore" | "macchinario">("azienda");
  const navigate = useNavigate();
  const { login } = useUser();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    
    if (adminUsername === adminUser.username && adminPassword === adminUser.password) {
      login("admin", { username: adminUsername, id: "admin-001" });
      navigate("/admin");
    } else {
      setAdminError("Credenziali admin non corrette.");
    }
  };

  const handleSeedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSeedError("");
    
    if (!seed.trim()) {
      setSeedError("Inserisci una seed valida!");
      return;
    }

    const generatedDID = generateDID();
    const userData = {
      id: generatedDID,
      name: `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} ${seed.substring(0, 8)}`,
      seed: seed,
      role: selectedRole,
      credits: 1000,
      aziendaId: selectedRole !== "azienda" ? "did:iota:evm:0xACME123" : undefined
    };

    login(selectedRole, userData);
    
    switch (selectedRole) {
      case "azienda": navigate("/azienda"); break;
      case "creator": navigate("/creator"); break;
      case "operatore": navigate("/operatore"); break;
      case "macchinario": navigate("/macchinario"); break;
      default: setSeedError("Ruolo non riconosciuto.");
    }
  };

  const generateRandomSeed = () => {
    const randomSeed = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setSeed(randomSeed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ padding: '2rem' }}>
      <div className="bg-white" style={{ maxWidth: '800px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>TRUSTUP</h1>
          <p>IOTA DID Dashboard - Sistema di Identità Decentralizzata</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Login Admin */}
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>🔐 Login Admin</h2>
            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                placeholder="Username"
                value={adminUsername}
                onChange={e => setAdminUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
              />
              <button type="submit">Accedi come Admin</button>
              {adminError && <div style={{ color: 'red', fontSize: '0.875rem' }}>{adminError}</div>}
            </form>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
              <strong>Demo:</strong> admin / admin123
            </div>
          </div>

          {/* Login Seed */}
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>🌱 Login tramite Seed</h2>
            <form onSubmit={handleSeedLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ruolo:</label>
                <select value={selectedRole} onChange={e => setSelectedRole(e.target.value as any)}>
                  <option value="azienda">🏢 Azienda</option>
                  <option value="creator">👨‍💼 Creator</option>
                  <option value="operatore">👷‍♂️ Operatore</option>
                  <option value="macchinario">🤖 Macchinario</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Seed:</label>
                <input
                  placeholder="Inserisci o genera una seed..."
                  value={seed}
                  onChange={e => setSeed(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={generateRandomSeed} style={{ flex: '1' }}>🎲 Genera</button>
                <button type="submit" style={{ flex: '2' }}>🚀 Accedi</button>
              </div>
              {seedError && <div style={{ color: 'red', fontSize: '0.875rem' }}>{seedError}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}