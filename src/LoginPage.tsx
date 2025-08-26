import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, UserRole } from "./contexts/UserContext";

// util mini
function uid() {
  return Math.random().toString(36).slice(2, 8) + "-" + Date.now().toString(36);
}
function genSeed() {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return Array.from(a).map(b => b.toString(16).padStart(2, "0")).join("");
}
function didFor(role: UserRole) {
  return `did:iota:evm:${role}-${uid()}`;
}

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useUser();

  // admin
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  // seed
  const [role, setRole] = useState<UserRole>("azienda");
  const [seed, setSeed] = useState("");

  function onLoginAdmin(e: React.FormEvent) {
    e.preventDefault();
    // demo: admin/admin123
    if (adminUser !== "admin" || adminPass !== "admin123") {
      alert("Credenziali demo: admin / admin123");
      return;
    }
    login("admin", { did: didFor("admin") });
    nav("/admin");
  }

  function onLoginSeed(e: React.FormEvent) {
    e.preventDefault();
    if (!seed.trim()) return alert("Inserisci la seed");
    login(role, { did: didFor(role), seedEnc: btoa(seed) });
    nav("/" + role);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow p-8">
        <h1 className="text-3xl font-extrabold text-center mb-2">TRUSTUP</h1>
        <p className="text-center text-gray-500 mb-8">IOTA DID Dashboard – Sistema di Identità Decentralizzata</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Admin */}
          <div>
            <h2 className="font-semibold mb-3">🔐 Login Admin</h2>
            <form onSubmit={onLoginAdmin} className="space-y-3">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Username"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
              />
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                placeholder="Password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
              />
              <button className="w-full px-4 py-2 rounded bg-blue-600 text-white" type="submit">
                Accedi come Admin
              </button>
              <div className="text-xs text-gray-500">Demo: admin / admin123</div>
            </form>
          </div>

          {/* Login Seed */}
          <div>
            <h2 className="font-semibold mb-3">🌱 Login tramite Seed</h2>
            <form onSubmit={onLoginSeed} className="space-y-3">
              <select
                className="w-full border rounded px-3 py-2"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="azienda">Azienda</option>
                <option value="creator">Creator</option>
                <option value="operatore">Operatore</option>
                <option value="macchinario">Macchinario</option>
              </select>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Seed: inserisci o genera..."
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 rounded border"
                  type="button"
                  onClick={() => setSeed(genSeed())}
                >
                  🎲 Genera
                </button>
                <button className="flex-1 px-3 py-2 rounded bg-blue-600 text-white" type="submit">
                  🚀 Accedi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
