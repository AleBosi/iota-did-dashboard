// vcIntegrity.ts — utilità per calcolo/validazione integrità VC
// NB: usa Web Crypto (browser moderno, Vite ok). In Node 20 serve crypto.subtle dietro flag;
// per i test si può sostituire con una libreria SHA-256 se necessario.

type AnyVC = Record<string, any>;

// Rimuove le chiavi non firmate dal payload prima dell'hash
export function stripUnhashedFields(vc: AnyVC) {
  const { proof, eventHistory, ...rest } = vc || {};
  return rest;
}

// Stringify stabile (chiavi ordinate) per avere hash deterministici
export function stableStringify(obj: any): string {
  const allKeys = new Set<string>();
  JSON.stringify(obj, (k, v) => (allKeys.add(k), v));
  return JSON.stringify(obj, Array.from(allKeys).sort());
}

export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Applica/aggiorna proof.jws = SHA256(payload_senza_proof_e_eventHistory)
export async function makeVCIntegrity(vc: AnyVC): Promise<AnyVC> {
  const payload = stripUnhashedFields(vc);
  const hex = await sha256Hex(stableStringify(payload));
  return {
    ...vc,
    proof: {
      ...(vc.proof || {}),
      type: vc?.proof?.type || "DataIntegrityProof",
      jws: hex,
    },
  };
}

// Verifica proof.jws contro payload corrente (senza proof/eventHistory)
export async function verifyVCIntegrity(vc: AnyVC): Promise<boolean> {
  if (!vc?.proof?.jws) return false;
  const payload = stripUnhashedFields(vc);
  const hex = await sha256Hex(stableStringify(payload));
  return String(vc.proof.jws) === hex;
}
