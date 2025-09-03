import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { safeGet, safeSet, uid } from "../utils/storage";
import { LSK } from "../utils/mockKeys";

import type { Azienda } from "../models/azienda";
import type { Actor } from "../models/actor";
import type { Product } from "../models/product";
import type { ProductType } from "../models/productType";

import type { Event as EventItem, AssignmentStatus } from "../models/event";
import type { VerifiableCredential } from "../models/vc";

import { useUser } from "../contexts/UserContext";

// ------------------------------
// Helpers
// ------------------------------
const norm = (s?: string | null) => (s ?? "").toLowerCase();

function pickOperatorAliases(ev: any): string[] {
  const c: string[] = [];
  if (ev?.assignedOperatorDid) c.push(ev.assignedOperatorDid);
  if (ev?.operatorDid) c.push(ev.operatorDid);
  if (ev?.assignedToDid && (ev?.assignedRole === "operator" || !ev?.assignedRole)) c.push(ev.assignedToDid);
  if (ev?.operatoreId) c.push(ev.operatoreId); // legacy
  return Array.from(new Set(c.map(norm))).filter(Boolean);
}

function pickMachineAliases(ev: any): string[] {
  const c: string[] = [];
  if (ev?.assignedMachineDid) c.push(ev.assignedMachineDid);
  if (ev?.machineDid) c.push(ev.machineDid);
  if (ev?.assignedToDid && ev?.assignedRole === "machine") c.push(ev.assignedToDid);
  if (ev?.macchinarioId) c.push(ev.macchinarioId); // legacy
  return Array.from(new Set(c.map(norm))).filter(Boolean);
}

// ------------------------------
// Stato base
// ------------------------------
export interface CreditsLedger {
  admin: number;
  byAzienda: Record<string, number>;
  byActor: Record<string, number>;
}

export interface DidRecord {
  did: string;
  seed?: string | null;
  owner?: string | null;
  type?: "azienda" | "creator" | "operatore" | "macchinario" | "product";
}

export interface DataState {
  aziende: Azienda[];
  actors: Actor[];
  products: Product[];
  productTypes: ProductType[];
  events: EventItem[];
  vcs: VerifiableCredential[];
  dids: DidRecord[];
  credits: CreditsLedger;
}

const defaultCredits: CreditsLedger = {
  admin: 100000,
  byAzienda: {},
  byActor: {},
};

const defaultState: DataState = {
  aziende: [],
  actors: [],
  products: [],
  productTypes: [],
  events: [],
  vcs: [],
  dids: [],
  credits: defaultCredits,
};

// Costi mock (visibili ai componenti)
const COSTS = {
  publishVC: 1,
};

// Notifica mock (sostituibile con un toast reale)
const notify = (msg: string, type: "info" | "error" = "info") => {
  if (type === "error") console.error("❌", msg);
  else console.log("ℹ️", msg);
};

function bootstrapIfNeeded(): DataState {
  const already = safeGet<boolean>(LSK.seeded, false);
  if (already) {
    return {
      aziende: safeGet<Azienda[]>(LSK.aziende, []),
      actors: safeGet<Actor[]>(LSK.actors, []),
      products: safeGet<Product[]>(LSK.products, []),
      productTypes: safeGet<ProductType[]>(LSK.productTypes, []),
      events: safeGet<EventItem[]>(LSK.events, []),
      vcs: safeGet<VerifiableCredential[]>(LSK.vcs, []),
      dids: safeGet<DidRecord[]>(LSK.dids, []),
      credits: safeGet<CreditsLedger>(LSK.credits, defaultCredits),
    };
  }

  // Seed minimale demo
  const aziendaDid = `did:iota:demo:${uid(8)}`;
  const demoAzienda: Azienda = {
    id: aziendaDid,
    name: "Azienda Demo",
    seed: "SEED_AZIENDA_DEMO",
    legalInfo: { vat: "00000000000", lei: "LEI-DEMO", address: "Via Demo 1", email: "demo@azienda.local", country: "IT" },
    creators: [],
    operatori: [],
    macchinari: [],
    createdAt: new Date().toISOString(),
  } as any;

  const dids: DidRecord[] = [{ did: aziendaDid, seed: (demoAzienda as any).seed ?? null, owner: null, type: "azienda" }];

  const credits: CreditsLedger = { admin: 100000, byAzienda: { [aziendaDid]: 1000 }, byActor: {} };

  const state: DataState = { ...defaultState, aziende: [demoAzienda], dids, credits };

  safeSet(LSK.aziende, state.aziende);
  safeSet(LSK.actors, state.actors);
  safeSet(LSK.products, state.products);
  safeSet(LSK.productTypes, state.productTypes);
  safeSet(LSK.events, state.events);
  safeSet(LSK.vcs, state.vcs);
  safeSet(LSK.dids, state.dids);
  safeSet(LSK.credits, state.credits);
  safeSet(LSK.seeded, true);

  return state;
}

interface DataContextShape extends DataState {
  // Selezione azienda (per viste filtrate)
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;

  // API dominio
  addAzienda(a: Azienda): void;
  updateAzienda(a: Azienda): void;
  removeAzienda(aziendaId: string): void;

  addActor(actor: Actor): void;
  updateActor(actor: Actor): void;
  removeActor(actorId: string): void;

  addProduct(p: Product): void;
  updateProduct(p: Product): void;
  removeProduct(productId: string): void;

  addProductType(t: ProductType): void;
  updateProductType(t: ProductType): void;
  removeProductType(typeId: string): void;

  // EVENTS
  addEvent(e: Partial<EventItem>): EventItem;
  updateAssignmentStatus(eventId: string, status: AssignmentStatus, opts?: { actorDid?: string; note?: string }): void;
  addNote(eventId: string, note: { authorDid: string; text: string }): void;

  // SELECTORS
  getAssignmentsForOperator(did: string): EventItem[];
  getAssignmentsForMachine(did: string): EventItem[];

  // VC
  addVC(vc: VerifiableCredential): void;
  updateVC(vc: VerifiableCredential): void;
  removeVC(id: string): void;

  // DID registry
  upsertDid(r: DidRecord): void;

  // Crediti
  COSTS: typeof COSTS;
  getCredits(did: string): number;
  grantToAzienda(aziendaDid: string, amount: number): void;
  grantToActor(actorDid: string, amount: number): void;
  spendFromActor(actorDid: string, amount: number): Promise<void>; // throws se saldo insufficiente
  rechargeAdmin(amount: number): void;

  // Varie
  notify: (msg: string, type?: "info" | "error") => void;
  resetAll(): void;
}

const DataCtx = createContext<DataContextShape>(null as any);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DataState>(() => bootstrapIfNeeded());

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const { session } = useUser();

  useEffect(() => {
    if (session.role === "azienda" && session.entityId) {
      setSelectedCompanyId(session.entityId);
    }
  }, [session.role, session.entityId]);

  // Persistenza mock su ogni change
  useEffect(() => {
    safeSet(LSK.aziende, state.aziende);
    safeSet(LSK.actors, state.actors);
    safeSet(LSK.products, state.products);
    safeSet(LSK.productTypes, state.productTypes);
    safeSet(LSK.events, state.events);
    safeSet(LSK.vcs, state.vcs);
    safeSet(LSK.dids, state.dids);
    safeSet(LSK.credits, state.credits);
  }, [state]);

  // ---------- CRUD base ----------
  const addAzienda = (a: Azienda) => setState(s => ({ ...s, aziende: [...s.aziende, a] }));
  const updateAzienda = (a: Azienda) =>
    setState(s => ({ ...s, aziende: s.aziende.map(x => ((x as any).id === (a as any).id ? a : x)) }));
  const removeAzienda = (aziendaId: string) =>
    setState(s => ({
      ...s,
      aziende: s.aziende.filter((x: any) => x.id !== aziendaId),
      credits: { ...s.credits, byAzienda: Object.fromEntries(Object.entries(s.credits.byAzienda).filter(([k]) => k !== aziendaId)) },
    }));

  const addActor = (actor: Actor) => setState(s => ({ ...s, actors: [...s.actors, actor] }));
  const updateActor = (actor: Actor) =>
    setState(s => ({ ...s, actors: s.actors.map((x: any) => (x.id === (actor as any).id ? actor : x)) }));
  const removeActor = (actorId: string) =>
    setState(s => ({ ...s, actors: s.actors.filter((x: any) => x.id !== actorId) }));

  const addProduct = (p: Product) => setState(s => ({ ...s, products: [...s.products, p] }));
  const updateProduct = (p: Product) =>
    setState(s => ({ ...s, products: s.products.map((x: any) => ((x as any).productId === (p as any).productId ? p : x)) }));
  const removeProduct = (productId: string) =>
    setState(s => ({ ...s, products: s.products.filter((x: any) => (x as any).productId !== productId) }));

  const addProductType = (t: ProductType) => setState(s => ({ ...s, productTypes: [...s.productTypes, t] }));
  const updateProductType = (t: ProductType) =>
    setState(s => ({ ...s, productTypes: s.productTypes.map((x: any) => ((x as any).id === (t as any).id ? t : x)) }));
  const removeProductType = (typeId: string) =>
    setState(s => ({ ...s, productTypes: s.productTypes.filter((x: any) => (x as any).id !== typeId) }));

  // ---------- EVENTS ----------
  const addEvent: DataContextShape["addEvent"] = (e) => {
    const id = (e as any)?.id ?? `ev_${uid(8)}`;
    const now = new Date().toISOString();

    // stato iniziale + history append-only
    const base: any = {
      id,
      date: (e as any)?.date ?? now,
      status: (e as any)?.status ?? ((e as any)?.done ? "completed" : "pending"),
      history: Array.isArray((e as any)?.history) ? [...(e as any).history] : [],
    };

    base.history.unshift({
      ts: now,
      type: "create",
      actorDid: (e as any)?.creatorDid ?? null,
      note: (e as any)?.description ?? null,
    });

    // alias assegnazioni (normalizzati ma salviamo i campi così da conservare compat)
    const opDid = (e as any)?.assignedOperatorDid || (e as any)?.operatorDid || (e as any)?.assignedToDid || (e as any)?.operatoreId || undefined;
    const mcDid = (e as any)?.assignedMachineDid || (e as any)?.machineDid || (e as any)?.macchinarioId || undefined;

    const next: EventItem = {
      ...(e as any),
      ...base,
      assignedOperatorDid: opDid,
      operatorDid: (e as any)?.operatorDid ?? opDid,
      operatoreId: (e as any)?.operatoreId ?? opDid,
      assignedMachineDid: mcDid,
      machineDid: (e as any)?.machineDid ?? mcDid,
    };

    setState(s => ({ ...s, events: [next, ...s.events] }));
    return next;
  };

  const updateAssignmentStatus: DataContextShape["updateAssignmentStatus"] = (eventId, status, opts) => {
    setState(s => {
      const i = s.events.findIndex(ev => (ev as any).id === eventId);
      if (i < 0) return s;

      const ev: any = { ...s.events[i] };
      const prev = (ev.status as AssignmentStatus) ?? (ev.done ? "completed" : "pending");

      // semplice FSA: pending -> in_progress -> completed (niente regressi)
      const allowed =
        (prev === "pending" && (status === "in_progress" || status === "completed")) ||
        (prev === "in_progress" && status === "completed") ||
        (prev === "completed" && status === "completed");

      if (!allowed) return s;

      ev.status = status;
      if (status === "completed") ev.done = true;

      const history = Array.isArray(ev.history) ? [...ev.history] : [];
      history.push({
        ts: new Date().toISOString(),
        type: "status",
        status,
        actorDid: opts?.actorDid ?? null,
        note: opts?.note ?? null,
      });
      ev.history = history;

      const nextEvents = [...s.events];
      nextEvents[i] = ev;
      return { ...s, events: nextEvents };
    });
  };

  const addNote: DataContextShape["addNote"] = (eventId, note) => {
    setState(s => {
      const i = s.events.findIndex(ev => (ev as any).id === eventId);
      if (i < 0) return s;
      const ev: any = { ...s.events[i] };
      const history = Array.isArray(ev.history) ? [...ev.history] : [];
      history.push({
        ts: new Date().toISOString(),
        type: "note",
        authorDid: note.authorDid,
        text: note.text,
      });
      ev.history = history;

      const nextEvents = [...s.events];
      nextEvents[i] = ev;
      return { ...s, events: nextEvents };
    });
  };

  // ---------- SELECTORS ----------
  const getAssignmentsForOperator: DataContextShape["getAssignmentsForOperator"] = (did) => {
    const target = norm(did);
    return state.events.filter(ev => pickOperatorAliases(ev).includes(target));
  };

  const getAssignmentsForMachine: DataContextShape["getAssignmentsForMachine"] = (did) => {
    const target = norm(did);
    return state.events.filter(ev => pickMachineAliases(ev).includes(target));
  };

  // ---------- VC ----------
  const addVC = (vc: VerifiableCredential) => setState(s => ({ ...s, vcs: [vc, ...s.vcs] }));
  const updateVC = (vc: VerifiableCredential) =>
    setState(s => ({
      ...s,
      vcs: s.vcs.map((x: any) => (((x as any).id || (x as any)["@id"]) === ((vc as any).id || (vc as any)["@id"]) ? vc : x)),
    }));
  const removeVC = (id: string) =>
    setState(s => ({
      ...s,
      vcs: s.vcs.filter((x: any) => (((x as any).id || (x as any)["@id"]) !== id)),
    }));

  // ---------- DID registry ----------
  const upsertDid = (r: DidRecord) =>
    setState(s => {
      const idx = s.dids.findIndex(x => x.did === r.did);
      const next = [...s.dids];
      if (idx >= 0) next[idx] = { ...next[idx], ...r };
      else next.push(r);
      return { ...s, dids: next };
    });

  // ---------- CREDITS ----------
  const getCredits = (did: string) => state.credits.byActor[did] ?? 0;

  const grantToAzienda = (aziendaDid: string, amount: number) =>
    setState(s => {
      const admin = Math.max(0, (s.credits.admin || 0) - amount);
      const byAzienda = { ...s.credits.byAzienda, [aziendaDid]: (s.credits.byAzienda[aziendaDid] || 0) + amount };
      return { ...s, credits: { ...s.credits, admin, byAzienda } };
    });

  const grantToActor = (actorDid: string, amount: number) =>
    setState(s => {
      const byActor = { ...s.credits.byActor, [actorDid]: (s.credits.byActor[actorDid] || 0) + amount };
      return { ...s, credits: { ...s.credits, byActor } };
    });

  const spendFromActor: DataContextShape["spendFromActor"] = async (actorDid, amount) => {
    let insufficient = false;
    setState(s => {
      const bal = s.credits.byActor[actorDid] || 0;
      insufficient = bal < amount;
      if (insufficient) return s;
      const byActor = { ...s.credits.byActor, [actorDid]: bal - amount };
      return { ...s, credits: { ...s.credits, byActor } };
    });
    if (insufficient) throw new Error("Crediti insufficienti");
  };

  const rechargeAdmin = (amount: number) =>
    setState(s => ({ ...s, credits: { ...s.credits, admin: (s.credits.admin || 0) + Math.max(0, amount) } }));

  // ---------- Utility ----------
  const resetAll = () => {
    safeSet(LSK.seeded, false);
    const fresh = bootstrapIfNeeded();
    setState(fresh);
  };

  const value = useMemo<DataContextShape>(
    () => ({
      ...state,
      selectedCompanyId,
      setSelectedCompanyId,

      addAzienda,
      updateAzienda,
      removeAzienda,
      addActor,
      updateActor,
      removeActor,
      addProduct,
      updateProduct,
      removeProduct,
      addProductType,
      updateProductType,
      removeProductType,

      // Events
      addEvent,
      updateAssignmentStatus,
      addNote,
      getAssignmentsForOperator,
      getAssignmentsForMachine,

      // VC
      addVC,
      updateVC,
      removeVC,

      // DID registry
      upsertDid,

      // Credits
      COSTS,
      getCredits,
      grantToAzienda,
      grantToActor,
      spendFromActor,
      rechargeAdmin,

      // Misc
      notify,
      resetAll,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, selectedCompanyId]
  );

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function useData() {
  return useContext(DataCtx);
}
