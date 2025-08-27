import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { safeGet, safeSet, uid } from "../utils/storage";
import { LSK } from "../utils/mockKeys";

import type { Azienda } from "../models/azienda";
import type { Actor } from "../models/actor";
import type { Product } from "../models/product";
import type { ProductType } from "../models/productType";
import type { EventItem } from "../models/event";
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

  // Seed minimale opzionale (puoi rimuoverlo)
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

  // 🔋 nuovo: ricarica credito admin (per UI/Admin e restore)
  rechargeAdmin: (amount: number) => void;

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
      resetAll,
    }),
    [state]
  );

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}

export function useData() {
  return useContext(DataCtx);
}
