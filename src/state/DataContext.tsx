import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { safeGet, safeSet, uid } from "../utils/storage";
import { LSK } from "../utils/mockKeys";

import type { Azienda } from "../models/azienda";
import type { Actor } from "../models/actor";
import type { Product } from "../models/product";
import type { ProductType } from "../models/productType";

// ✅ separo i type dai valori (fix HMR / runtime)
import type { Event as EventItem, AssignmentStatus } from "../models/event";
import { effectiveStatus, canTransition } from "../models/event";

import type { VerifiableCredential } from "../models/vc";

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

  // Seed minimale opzionale
  const aziendaDid = `did:iota:demo:${uid(8)}`;
  const demoAzienda: Azienda = {
    id: aziendaDid,
    name: "Azienda Demo",
    seed: "SEED_AZIENDA_DEMO",
    legalInfo: {
      vat: "00000000000",
      lei: "LEI-DEMO",
      address: "Via Demo 1",
      email: "demo@azienda.local",
      country: "IT",
    },
    creators: [],
    operatori: [],
    macchinari: [],
    createdAt: new Date().toISOString(),
  } as any;

  const dids: DidRecord[] = [
    { did: aziendaDid, seed: (demoAzienda as any).seed ?? null, owner: null, type: "azienda" },
  ];

  const credits: CreditsLedger = {
    admin: 100000,
    byAzienda: { [aziendaDid]: 1000 },
    byActor: {},
  };

  const state: DataState = {
    ...defaultState,
    aziende: [demoAzienda],
    dids,
    credits,
  };

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
  // CRUD esistenti
  addAzienda: (a: Azienda) => void;
  updateAzienda: (a: Azienda) => void;
  removeAzienda: (aziendaId: string) => void;

  addActor: (actor: Actor) => void;
  updateActor: (actor: Actor) => void;
  removeActor: (actorId: string) => void;

  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  removeProduct: (productId: string) => void;

  addProductType: (t: ProductType) => void;
  updateProductType: (t: ProductType) => void;
  removeProductType: (typeId: string) => void;

  addEvent: (e: EventItem) => void;

  addVC: (vc: VerifiableCredential) => void;
  updateVC: (vc: VerifiableCredential) => void;
  removeVC: (id: string) => void;

  upsertDid: (r: DidRecord) => void;

  grantToAzienda: (aziendaDid: string, amount: number) => void;
  grantToActor: (actorDid: string, amount: number) => void;
  spendFromActor: (actorDid: string, amount: number) => boolean;

  // 🔋 ricarica credito admin
  rechargeAdmin: (amount: number) => void;

  // ✅ NUOVE API (retro-compatibili)
  getAssignmentsForOperator: (operatorDid: string) => (EventItem & { status: AssignmentStatus })[];
  getAssignmentsForMachine: (machineDid: string) => (EventItem & { status: AssignmentStatus })[];

  updateAssignmentStatus: (assignmentId: string, next: AssignmentStatus, performerDid: string) => void;
  addNote: (parentEventId: string, note: string, performedByDid: string) => void;
  addTelemetry: (payload: any, machineDid: string, parentEventId?: string, performedByDid?: string) => void;

  spendCredits: (did: string, amount: number, reason: string, refId?: string) => void;
  getCredits: (did: string) => number;
  seedCreditsIfEmpty: (did: string, amount: number) => void;

  resetAll: () => void;
}

const DataCtx = createContext<DataContextShape>(null as any);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DataState>(() => bootstrapIfNeeded());

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

  // ===== CRUD esistenti (invariati)
  const addAzienda = (a: Azienda) =>
    setState((s) => ({ ...s, aziende: [...s.aziende, a] }));

  const updateAzienda = (a: Azienda) =>
    setState((s) => ({
      ...s,
      aziende: s.aziende.map((x) => ((x as any).id === (a as any).id ? a : x)),
    }));

  const removeAzienda = (aziendaId: string) =>
    setState((s) => ({
      ...s,
      aziende: s.aziende.filter((x: any) => x.id !== aziendaId),
      credits: {
        ...s.credits,
        byAzienda: Object.fromEntries(
          Object.entries(s.credits.byAzienda).filter(([k]) => k !== aziendaId)
        ),
      },
    }));

  const addActor = (actor: Actor) =>
    setState((s) => ({ ...s, actors: [...s.actors, actor] }));

  const updateActor = (actor: Actor) =>
    setState((s) => ({
      ...s,
      actors: s.actors.map((x: any) => (x.id === (actor as any).id ? actor : x)),
    }));

  const removeActor = (actorId: string) =>
    setState((s) => ({ ...s, actors: s.actors.filter((x: any) => x.id !== actorId) }));

  const addProduct = (p: Product) =>
    setState((s) => ({ ...s, products: [...s.products, p] }));

  const updateProduct = (p: Product) =>
    setState((s) => ({
      ...s,
      products: s.products.map((x: any) => ((x as any).productId === (p as any).productId ? p : x)),
    }));

  const removeProduct = (productId: string) =>
    setState((s) => ({
      ...s,
      products: s.products.filter((x: any) => (x as any).productId !== productId),
    }));

  const addProductType = (t: ProductType) =>
    setState((s) => ({ ...s, productTypes: [...s.productTypes, t] }));

  const updateProductType = (t: ProductType) =>
    setState((s) => ({
      ...s,
      productTypes: s.productTypes.map((x: any) => ((x as any).id === (t as any).id ? t : x)),
    }));

  const removeProductType = (typeId: string) =>
    setState((s) => ({
      ...s,
      productTypes: s.productTypes.filter((x: any) => (x as any).id !== typeId),
    }));

  const addEvent = (e: EventItem) =>
    setState((s) => ({ ...s, events: [...s.events, e] }));

  const addVC = (vc: VerifiableCredential) =>
    setState((s) => ({ ...s, vcs: [...s.vcs, vc] }));

  const updateVC = (vc: VerifiableCredential) =>
    setState((s) => ({
      ...s,
      vcs: s.vcs.map((x: any) => (((x as any).id || (x as any)["@id"]) === ((vc as any).id || (vc as any)["@id"]) ? vc : x)),
    }));

  const removeVC = (id: string) =>
    setState((s) => ({
      ...s,
      vcs: s.vcs.filter((x: any) => (((x as any).id || (x as any)["@id"]) !== id)),
    }));

  const upsertDid = (r: DidRecord) =>
    setState((s) => {
      const idx = s.dids.findIndex((x) => x.did === r.did);
      const next = [...s.dids];
      if (idx >= 0) next[idx] = { ...next[idx], ...r };
      else next.push(r);
      return { ...s, dids: next };
    });

  const grantToAzienda = (aziendaDid: string, amount: number) =>
    setState((s) => {
      const admin = Math.max(0, (s.credits.admin || 0) - amount);
      const byAz = { ...s.credits.byAzienda, [aziendaDid]: (s.credits.byAzienda[aziendaDid] || 0) + amount };
      return { ...s, credits: { ...s.credits, admin, byAzienda: byAz } };
    });

  const grantToActor = (actorDid: string, amount: number) =>
    setState((s) => {
      const byActor = { ...s.credits.byActor, [actorDid]: (s.credits.byActor[actorDid] || 0) + amount };
      return { ...s, credits: { ...s.credits, byActor } };
    });

  const spendFromActor = (actorDid: string, amount: number) => {
    let ok = false;
    setState((s) => {
      const bal = s.credits.byActor[actorDid] || 0;
      ok = bal >= amount;
      if (!ok) return s;
      const byActor = { ...s.credits.byActor, [actorDid]: bal - amount };
      return { ...s, credits: { ...s.credits, byActor } };
    });
    return ok;
  };

  // 🔋 ricarica pool Admin
  const rechargeAdmin = (amount: number) =>
    setState((s) => ({
      ...s,
      credits: { ...s.credits, admin: (s.credits.admin || 0) + Math.max(0, amount) },
    }));

  // ===== NUOVE API

  const getAssignmentsForOperator = (operatorDid: string) =>
    state.events
      .filter((e) => e.type === "Assegnazione" && e.operatoreId === operatorDid)
      .map((e) => ({ ...e, status: effectiveStatus(e) }))
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
      .reverse();

  const getAssignmentsForMachine = (machineDid: string) =>
    state.events
      .filter((e) => e.type === "Assegnazione" && e.macchinarioId === machineDid)
      .map((e) => ({ ...e, status: effectiveStatus(e) }))
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
      .reverse();

  const updateAssignmentStatus = (assignmentId: string, next: AssignmentStatus, performerDid: string) => {
    setState((s) => {
      const idx = s.events.findIndex((ev) => ev.id === assignmentId);
      if (idx < 0) return s;

      const current = effectiveStatus(s.events[idx]);
      if (!canTransition(current, next)) return s;

      const updated = { ...s.events[idx] };
      updated.status = next;
      if (next === "done") updated.done = true;
      if (next === "cancelled") updated.done = false;

      if (performerDid) {
        const tag = `[last_by:${performerDid}]`;
        const hasTag = (updated.description || "").includes("[last_by:");
        updated.description = (updated.description || "");
        updated.description = hasTag
          ? updated.description.replace(/\[last_by:[^\]]+\]/, tag)
          : `${updated.description} ${tag}`.trim();
      }

      const nextEvents = [...s.events];
      nextEvents[idx] = updated;
      return { ...s, events: nextEvents };
    });
  };

  const addNote = (parentEventId: string, note: string, performedByDid: string) => {
    setState((s) => {
      const idx = s.events.findIndex((ev) => ev.id === parentEventId);
      if (idx < 0) return s;

      const target = s.events[idx];
      const notes = Array.isArray(target.notes) ? [...target.notes] : [];
      notes.push({
        id: `note_${uid(6)}`,
        text: note,
        createdAt: new Date().toISOString(),
        performedByDid,
      });

      const updated: EventItem = { ...target, notes };
      const nextEvents = [...s.events];
      nextEvents[idx] = updated;
      return { ...s, events: nextEvents };
    });
  };

  const addTelemetry = (payload: any, machineDid: string, parentEventId?: string, performedByDid?: string) => {
    const now = new Date().toISOString();
    const parent = parentEventId ? state.events.find((e) => e.id === parentEventId) : undefined;

    const telemetryEvent: EventItem = {
      id: `tele_${uid(8)}`,
      productId: parent?.productId || "",
      operatoreId: performedByDid || parent?.operatoreId || "",
      macchinarioId: machineDid,
      type: "Telemetry",
      description: JSON.stringify({ payload, parentEventId }, null, 2),
      date: now,
      creatorId: performedByDid || machineDid,
    };

    setState((s) => ({ ...s, events: [...s.events, telemetryEvent] }));
  };

  const spendCredits = (did: string, amount: number, _reason: string, _refId?: string) => {
    const ok = spendFromActor(did, amount);
    if (!ok) throw new Error(`Crediti insufficienti: saldo attuale < ${amount}`);
  };

  const getCredits = (did: string) => state.credits.byActor[did] ?? 0;

  const seedCreditsIfEmpty = (did: string, amount: number) => {
    setState((s) => {
      if (s.credits.byActor[did] !== undefined) return s;
      return {
        ...s,
        credits: {
          ...s.credits,
          byActor: { ...s.credits.byActor, [did]: amount },
        },
      };
    });
  };

  const resetAll = () => {
    safeSet(LSK.seeded, false);
    const fresh = bootstrapIfNeeded();
    setState(fresh);
  };

  const value = useMemo<DataContextShape>(
    () => ({
      ...state,
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
      addEvent,
      addVC,
      updateVC,
      removeVC,
      upsertDid,
      grantToAzienda,
      grantToActor,
      spendFromActor,
      rechargeAdmin,
      getAssignmentsForOperator,
      getAssignmentsForMachine,
      updateAssignmentStatus,
      addNote,
      addTelemetry,
      spendCredits,
      getCredits,
      seedCreditsIfEmpty,
      resetAll,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  );

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function useData() {
  return useContext(DataCtx);
}
