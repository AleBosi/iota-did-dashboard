import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUser, routeByRole, UserRole } from "./contexts/UserContext";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const [role, setRole] = useState<UserRole>("admin");
  const [seed, setSeed] = useState<string>("");
  const [did, setDid] = useState<string>("");

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
    login("admin", { seed: "DEMO_ADMIN_SEED", did: null });
    navigate("/admin", { replace: true });
  }

  function handleSeedLogin(e: React.FormEvent) {
    e.preventDefault();

    if (role !== "admin" && !seed.trim()) {
      toast({
        title: "Seed mancante",
        description: "Inserisci un seed valido per il ruolo selezionato.",
      });
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-xl bg-card">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">TRUSTUP</CardTitle>
          </div>
          <CardDescription>
            Accedi per gestire identità, eventi e DPP.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Blocco demo admin */}
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-muted-foreground mb-3">
              Esegue il login come <span className="font-medium text-foreground">Admin</span>.
            </p>
            <Button className="w-full" size="lg" onClick={handleDemoAdmin}>
              Entra come Admin demo
            </Button>
          </div>

          {/* Form login */}
          <form onSubmit={handleSeedLogin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 space-y-2">
                <Label>Ruolo</Label>
                <Select value={role} onValueChange={(v: UserRole) => setRole(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona ruolo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Seed</Label>
                <Input
                  placeholder="Incolla il seed dell'attore (es. azienda/creator/operatore/macchinario)"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>DID (opzionale)</Label>
              <Input
                placeholder="did:iota:... (se già assegnato all'attore)"
                value={did}
                onChange={(e) => setDid(e.target.value)}
                autoComplete="off"
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Accedi
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            Privacy: on-chain pubblichiamo solo hash/URI (no PII). Il payload VC/DPP resta off-chain
            (IPFS/S3 o equivalente). Le azioni firmate consumano crediti e non richiedono wallet
            utente (sponsored tx via Gas Station).
          </p>
        </CardContent>

        <CardFooter />
      </Card>
    </div>
  );
}
