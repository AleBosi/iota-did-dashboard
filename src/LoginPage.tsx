import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser, routeByRole } from "./contexts/UserContext";

import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { useData } from "@/state/DataContext";
import { deriveMockAccount } from "@/utils/cryptoUtils";
import { validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { useSecrets } from "@/contexts/SecretsContext";
import { findByDid, IdentityRole } from "@/utils/identityRegistry";

export default function LoginPage() {
  const { session, login, logout } = useUser();
  const { state } = useData();
  const { setSeed } = useSecrets();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [seed, setSeedInput] = useState("");

  const forceReset = searchParams.get("reset") === "1";
  const targetPath = useMemo(
    () => (session.role ? routeByRole[session.role] || "/login" : "/login"),
    [session.role]
  );

  useEffect(() => {
    if (forceReset) { logout(); return; }
    if (session.role) navigate(targetPath, { replace: true });
  }, [forceReset, session.role, targetPath, navigate, logout]);

  function handleDemoAdmin() {
    login("admin", { seed: "DEMO_ADMIN_SEED", entityId: null });
    navigate("/admin", { replace: true });
  }

  // helpers
  const normalizeSeed = (s: string) => s.trim().replace(/\s+/g, " ");
  const arr = <T,>(x: T[] | undefined | null): T[] => (Array.isArray(x) ? x : []);
  const lc = (s: any) => String(s || "").toLowerCase();

  function mapRoleToSecretType(role: IdentityRole): "company" | "actor" | "machine" {
    if (role === "azienda") return "company";
    if (role === "macchinario") return "machine";
    return "actor"; // creator / operatore
  }

  function handleSeedLogin(e: React.FormEvent) {
    e.preventDefault();

    const phrase = normalizeSeed(seed);
    const words = phrase ? phrase.split(" ") : [];

    if (!phrase) {
      toast({ title: "Seed mancante", description: "Inserisci una seed phrase BIP39 (24 parole)." });
      return;
    }
    if (words.length !== 24) {
      toast({
        title: "Seed non valida (lunghezza)",
        description: `Hai inserito ${words.length} parole. Per questo progetto usiamo SEMPRE 24 parole.`,
        variant: "destructive",
      });
      return;
    }
    if (!validateMnemonic(phrase, wordlist)) {
      toast({ title: "Seed non valida", description: "La seed non è una BIP39 valida (24 parole).", variant: "destructive" });
      return;
    }

    // Deriva DID coerente con la creazione
    const acc = deriveMockAccount(phrase);
    const didIota = lc(`did:iota:evm:${acc.address}`);

    // Stato difensivo + alias italiani/inglesi
    const companies = arr<any>(state?.companies || state?.aziende);

    // 1) AZIENDA
    const company = companies.find((c) => lc(c?.did || c?.id) === didIota);
    if (company) {
      const entityId = company.id || company.did || didIota;
      setSeed({ type: "company", id: entityId }, phrase);
      login("azienda", { seed: phrase, entityId });
      navigate(routeByRole["azienda"] || "/login", { replace: true });
      return;
    }

    // helper match su attori/macchine
    const matchByDidOrAddr = (obj: any) => {
      const did = lc(obj?.did || obj?.id || obj?.account?.did);
      const addr = lc(obj?.account?.address);
      return did === didIota || (addr && lc(`did:iota:evm:${addr}`) === didIota);
    };

    // 2) CREATOR / OPERATORE (annidati nell’azienda)
    for (const c of companies) {
      const creators  = arr<any>(c?.creators  || c?.creatori);
      const operatori = arr<any>(c?.operatori || c?.operators);

      const foundCreator = creators.find(matchByDidOrAddr);
      if (foundCreator) {
        const entityId = foundCreator.id || foundCreator.did || didIota;
        setSeed({ type: "actor", id: entityId }, phrase);
        login("creator", { seed: phrase, entityId });
        navigate(routeByRole["creator"] || "/login", { replace: true });
        return;
      }

      const foundOperatore = operatori.find(matchByDidOrAddr);
      if (foundOperatore) {
        const entityId = foundOperatore.id || foundOperatore.did || didIota;
        setSeed({ type: "actor", id: entityId }, phrase);
        login("operatore", { seed: phrase, entityId });
        navigate(routeByRole["operatore"] || "/login", { replace: true });
        return;
      }
    }

    // 3) MACCHINARIO (annidati nell’azienda)
    for (const c of companies) {
      const macchinari = arr<any>(c?.macchinari || c?.machines);
      const found = macchinari.find(matchByDidOrAddr);
      if (found) {
        const entityId = found.id || found.did || didIota;
        setSeed({ type: "machine", id: entityId }, phrase);
        login("macchinario", { seed: phrase, entityId });
        navigate(routeByRole["macchinario"] || "/login", { replace: true });
        return;
      }
    }

    // 4) Fallback: registry locale (copre refresh/store vuoto)
    const reg = findByDid(didIota);
    if (reg) {
      const secretType = mapRoleToSecretType(reg.type);
      setSeed({ type: secretType, id: reg.id }, phrase);
      login(reg.type as any, { seed: phrase, entityId: reg.id });
      navigate(routeByRole[reg.type] || "/login", { replace: true });
      return;
    }

    // Nessun match
    toast({
      title: "Nessuna identità trovata",
      description:
        "La seed è valida ma non corrisponde ad alcuna azienda / creator / operatore / macchinario registrato. Usa la seed a 24 parole mostrata in ‘Dettagli’ → ‘Sblocca e mostra seed’.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-xl bg-card">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">TRUSTUP</CardTitle>
          </div>
          <CardDescription>Accedi per gestire identità, eventi e DPP.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-muted-foreground mb-3">
              Esegue il login come <span className="font-medium text-foreground">Admin</span>.
            </p>
            <Button className="w-full" size="lg" onClick={handleDemoAdmin}>
              Entra come Admin demo
            </Button>
          </div>

          <form onSubmit={handleSeedLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Seed (24 parole — BIP39)</Label>
              <Input
                placeholder="Inserisci la seed phrase (24 parole)"
                value={seed}
                onChange={(e) => setSeedInput(e.target.value)}
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Accedi con Seed
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            In modalità MOCK le seed sono cifrate nel browser e visibili in chiaro solo dopo sblocco con password.
            Il sistema riconosce automaticamente l’identità dalla seed e reindirizza alla dashboard corretta.
          </p>
        </CardContent>

        <CardFooter />
      </Card>
    </div>
  );
}
