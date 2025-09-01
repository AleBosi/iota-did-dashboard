// src/utils/identityRegistry.ts
// Registro MOCK su localStorage per risolvere il login anche dopo refresh.
// Tipi coerenti con i ruoli reali: azienda, creator, operatore, macchinario.

export type IdentityRole = "azienda" | "creator" | "operatore" | "macchinario";

export type IdentityEntry = {
  did: string;         // es: did:iota:evm:0x...
  type: IdentityRole;  // azienda | creator | operatore | macchinario
  id: string;          // ID dell'entità nel tuo modello (spesso coincide col did)
  label?: string;      // Ragione sociale / nome attore / nome macchina
  parentDid?: string;  // per attori/macchine: DID dell’azienda di appartenenza
  createdAt?: string;
};

const LS_KEY = "mockIdentityIndex/v1";

function readAll(): IdentityEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(list: IdentityEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export function registerIdentity(entry: IdentityEntry) {
  const list = readAll();
  const didLc = String(entry.did || "").toLowerCase();
  const idx = list.findIndex((e) => String(e.did).toLowerCase() === didLc);

  const normalized: IdentityEntry = {
    ...entry,
    did: didLc, // normalizziamo a lower-case per confronti robusti
    createdAt: entry.createdAt ?? new Date().toISOString(),
  };

  if (idx >= 0) list[idx] = normalized;
  else list.push(normalized);

  writeAll(list);
}

export function findByDid(did: string): IdentityEntry | null {
  const list = readAll();
  const didLc = String(did || "").toLowerCase();
  return list.find((e) => String(e.did).toLowerCase() === didLc) || null;
}

export function allIdentities(): IdentityEntry[] {
  return readAll();
}

export function clearRegistry() {
  localStorage.removeItem(LS_KEY);
}
