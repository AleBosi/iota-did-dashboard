import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import { generateDID } from "./utils/cryptoUtils";

// MOCK admin user
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

  // Login admin (username + password)
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

  // Login con seed - genera automaticamente DID
  const handleSeedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSeedError("");
    
    if (!seed.trim()) {
      setSeedError("Inserisci una seed valida!");
      return;
    }

    // Genera automaticamente DID dalla seed
    const generatedDID = generateDID();
    
    // Crea utente basato su seed e ruolo selezionato
    const userData = {
      id: generatedDID,
      name: `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} ${seed.substring(0, 8)}`,
      seed: seed,
      role: selectedRole,
      credits: 1000, // Crediti iniziali
      aziendaId: selectedRole !== "azienda" ? "did:iota:evm:0xACME123" : undefined
    };

    login(selectedRole, userData);
    
    // Naviga alla dashboard appropriata
    switch (selectedRole) {
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

  // Genera seed casuale
  const generateRandomSeed = () => {
    const randomSeed = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setSeed(randomSeed);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f3f4f6', 
      padding: '24px' 
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '32px' 
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '8px' 
        }}>
          TRUSTUP
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#6b7280' 
        }}>
          IOTA DID Dashboard - Sistema di Identità Decentralizzata
        </p>
      </div>

      <div style={{ 
        width: '100%', 
        maxWidth: '800px', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
        padding: '32px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px'
      }}>
        
        {/* Login Admin */}
        <div style={{ 
          borderRight: '1px solid #e5e7eb', 
          paddingRight: '24px' 
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1e40af', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            🔐 Login Admin
          </h2>
          
          <form onSubmit={handleAdminLogin} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
          }}>
            <input
              style={{
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Username"
              value={adminUsername}
              onChange={e => setAdminUsername(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
            
            <input
              style={{
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
            
            <button
              type="submit"
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={e => e.target.style.backgroundColor = '#3b82f6'}
            >
              Accedi come Admin
            </button>
            
            {adminError && (
              <div style={{ 
                color: '#dc2626', 
                fontSize: '14px', 
                textAlign: 'center',
                backgroundColor: '#fef2f2',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #fecaca'
              }}>
                {adminError}
              </div>
            )}
          </form>
          
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: '#eff6ff', 
            borderRadius: '6px',
            fontSize: '12px',
            color: '#1e40af'
          }}>
            <strong>Credenziali Demo:</strong><br/>
            Username: admin<br/>
            Password: admin123
          </div>
        </div>

        {/* Login Seed */}
        <div style={{ paddingLeft: '24px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#059669', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            🌱 Login tramite Seed
          </h2>
          
          <form onSubmit={handleSeedLogin} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' 
          }}>
            {/* Selezione Ruolo */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Seleziona Ruolo:
              </label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as any)}
                style={{
                  width: '100%',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                <option value="azienda">🏢 Azienda</option>
                <option value="creator">👨‍💼 Creator</option>
                <option value="operatore">👷‍♂️ Operatore</option>
                <option value="macchinario">🤖 Macchinario</option>
              </select>
            </div>

            {/* Input Seed */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Seed Crittografico:
              </label>
              <input
                style={{
                  width: '100%',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
                placeholder="Inserisci o genera una seed..."
                value={seed}
                onChange={e => setSeed(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Bottoni */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={generateRandomSeed}
                style={{
                  flex: '1',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🎲 Genera Seed
              </button>
              
              <button
                type="submit"
                style={{
                  flex: '2',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseOver={e => e.target.style.backgroundColor = '#059669'}
                onMouseOut={e => e.target.style.backgroundColor = '#10b981'}
              >
                🚀 Accedi
              </button>
            </div>
            
            {seedError && (
              <div style={{ 
                color: '#dc2626', 
                fontSize: '14px', 
                textAlign: 'center',
                backgroundColor: '#fef2f2',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #fecaca'
              }}>
                {seedError}
              </div>
            )}
          </form>
          
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: '#f0fdf4', 
            borderRadius: '6px',
            fontSize: '12px',
            color: '#166534'
          }}>
            <strong>Info:</strong> Inserisci qualsiasi seed per generare automaticamente un DID IOTA e accedere alla dashboard del ruolo selezionato.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '32px', 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#9ca3af' 
      }}>
        Powered by IOTA DPP • Sistema di Identità Digitale Decentralizzata
      </div>
    </div>
  );
}