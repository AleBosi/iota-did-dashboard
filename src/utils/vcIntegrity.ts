/**
 * utils/vcIntegrity.ts
 * Fonte di verità per hashing/proof/verifica delle VC.
 *
 * Regole:
 * - La firma (proof.jws) è l'hash SHA-256 (hex) del payload VC canonicalizzato
 *   ESCLUDENDO i campi `proof` ed `eventHistory`.
 * - Se cambia un campo firmato → verifica ❌
 * - Se si aggiunge/modifica solo `eventHistory` → verifica ✅
 *
 * Funzioni pubbliche:
 *  - canonicalStringify(value): string
 *  - stripForProof(vc): object
 *  - computeVCJWS(payload): Promise<string>
 *  - makeVCIntegrity(vc, opts?): Promise<VC>
 *  - verifyVC(vc): Promise<{ valid: boolean; reason?: string }>
 */

export type AnyVC = Record<string, any>;

type HashProof = {
  type?: string;                 // default: "DataIntegrityProof"
  created?: string;              // ISO 8601
  verificationMethod?: string;   // DID del signer (opzionale)
  algorithm?: "SHA-256-hex";     // valorizzato automaticamente
  jws: string;                   // digest hex del payload canonicalizzato
};

type MakeOpts = {
  signerDid?: string;            // per valorizzare verificationMethod
  proofType?: string;            // default "DataIntegrityProof"
  created?: string;              // default now ISO
};

/* -----------------------------------------------------------
 * Canonicalizzazione deterministica:
 * - ordina alfabeticamente le chiavi degli oggetti a TUTTI i livelli
 * - preserva l'ordine degli array
 * - rimuove le chiavi con valore `undefined`
 * --------------------------------------------------------- */
function canonicalize(value: any): any {
  if (value === null || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  const out: Record<string, any> = {};
  for (const key of Object.keys(value).sort()) {
    const v = (value as any)[key];
    if (v !== undefined) {
      out[key] = canonicalize(v);
    }
  }
  return out;
}

/** Serializza in JSON dopo canonicalizzazione profonda. */
export function canonicalStringify(value: any): string {
  return JSON.stringify(canonicalize(value));
}

/** Rimuove i campi non firmati prima del calcolo hash. */
export function stripForProof<T extends AnyVC>(vc: T): Omit<T, "proof" | "eventHistory"> {
  const { proof: _p, eventHistory: _eh, ...rest } = vc || ({} as T);
  return rest as Omit<T, "proof" | "eventHistory">;
}

/* -----------------------------------------------------------
 * SHA-256 → hex (browser first; fallback Node dinamico)
 * --------------------------------------------------------- */
async function sha256Hex(input: string): Promise<string> {
  // Browser/Web Crypto
  // @ts-ignore - type guard per ambienti senza window
  const subtle = (typeof window !== "undefined" && window?.crypto?.subtle)
    // @ts-ignore - Node >= 19 con globalThis.crypto.subtle
    || (typeof globalThis !== "undefined" && (globalThis as any).crypto?.subtle);

  if (subtle) {
    const enc = new TextEncoder();
    const buf = await subtle.digest("SHA-256", enc.encode(input));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // Node fallback (dev/test)
  const { createHash } = await import("crypto");
  return createHash("sha256").update(input).digest("hex");
}

/** Calcola il digest (jws) sul payload canonicalizzato. */
export async function computeVCJWS(payload: object): Promise<string> {
  const canonical = canonicalStringify(payload);
  return sha256Hex(canonical);
}

/**
 * makeVCIntegrity:
 * - calcola jws su payload VC senza `proof` e `eventHistory`
 * - aggiorna/crea `proof` con type, algorithm, created e (se fornito) verificationMethod
 */
export async function makeVCIntegrity<T extends AnyVC>(vc: T, opts?: MakeOpts): Promise<T> {
  const payload = stripForProof(vc);
  const jws = await computeVCJWS(payload);

  const nextProof: HashProof = {
    type: opts?.proofType || vc?.proof?.type || "DataIntegrityProof",
    created: opts?.created || vc?.proof?.created || new Date().toISOString(),
    verificationMethod: opts?.signerDid || vc?.proof?.verificationMethod,
    algorithm: "SHA-256-hex",
    jws,
  };

  return {
    ...vc,
    proof: { ...(vc as any).proof, ...nextProof },
  };
}

/**
 * verifyVC:
 * - ricalcola l'hash e confronta con `proof.jws`.
 * - ritorna { valid, reason? } per UI coerente (VerifyFlag / VCVerifier).
 */
export async function verifyVC(vc: AnyVC): Promise<{ valid: boolean; reason?: string }> {
  if (!vc || typeof vc !== "object") return { valid: false, reason: "VC non valida" };

  const proof = (vc as any).proof as HashProof | undefined;
  if (!proof?.jws) return { valid: false, reason: "Proof mancante o incompleta" };

  const payload = stripForProof(vc);
  const expected = await computeVCJWS(payload);
  const given = String(proof.jws).toLowerCase();

  const ok = expected.toLowerCase() === given;
  return ok ? { valid: true } : { valid: false, reason: "Hash non corrispondente (dati firmati alterati)" };
}
