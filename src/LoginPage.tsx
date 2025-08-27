import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser, routeByRole, UserRole } from "./contexts/UserContext";

type RoleOption = { value: UserRole; label: string };

const ROLES: RoleOption[] = [
  { value: "admin", label: "Admin" },
  { value: "azienda", label: "Azienda" },
  { value: "creator", label: "Creator" },
  { value: "operatore", label: "Operatore" },
  { value: "macchinario", label: "Macchinario" },
];

function normalizeDid(didInput: string | undefined): string | null {
  const d = (didInput || "").trim();
  return d.length ? d : null;
}

export default function LoginPage() {
  const { session, login, logout } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<UserRole>("admin");
  const [seed, setSeed] = useState<string>("");
  const [did, setDid] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const forceReset = searchParams.get("reset") === "1";

  const targetPath = useMemo(() => {
    if (!session.role) return "/login";
    return routeByRole[session.role] || "/login";
  }, [session.role]);

  // Se arrivi con ?reset=1, azzera la sessione e mostra il form.
  useEffect(() => {
    if (forceReset) {
      logout();
      return;
    }
    if (session.role) {
      navigate(targetPath, { replace: true });
    }
  }, [forceReset, session.role, targetPath, navigate, logout]);

  function handleDemoAdmin() {
    setError(null);
    login("admin", { seed: "DEMO_ADMIN_SEED", did: null });
    navigate("/admin", { replace: true });
  }

  function handleSeedLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (role !== "admin" && !seed.trim()) {
      setError("Inserisci un seed valido per il ruolo selezionato.");
      return;
    }

    const didNorm = normalizeDid(did);
    login(role, {
      seed: seed.trim() || null,
      did: didNorm,
    });

    navigate(routeByRole[role] || "/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">TRUSTUP · Login</h1>
          <a
            href="/login?reset=1"
            className="text-sm underline text-gray-600 hover:text-gray-800"
          >
            Torna alla seed login
          </a>
        </div>

        <div className="mb-8 rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold mb-2">Accesso rapido (Demo Admin)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Esegue il login come <strong>Admin</strong> demo (sponsored tx, nessun wallet).
          </p>
          <button
            onClick={handleDemoAdmin}
            className="w-full rounded-xl px-4 py-2 bg-black text-white hover:opacity-90"
          >
            Entra come Admin demo
          </button>
        </div>

        <form onSubmit={handleSeedLogin} className="space-y-4">
          <h2 className="font-semibold">Login con Seed + Ruolo</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-sm text-gray-700 mb-1">Ruolo</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Seed</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Incolla il seed dell'attore (es. azienda/creator/operatore/macchinario)"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">DID (opzionale)</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="did:iota:... (se già assegnato all'attore)"
              value={did}
              onChange={(e) => setDid(e.target.value)}
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            Accedi
          </button>
        </form>

        <p className="text-[12px] text-gray-500 mt-6">
          Privacy: on-chain pubblichiamo solo hash/URI (no PII). Il payload VC/DPP resta off-chain
          (IPFS/S3 o equivalente). Le azioni firmate consumano crediti e non richiedono wallet
          utente (sponsored tx via Gas Station).
        </p>
      </div>
    </div>
  );
}
