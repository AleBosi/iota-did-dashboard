export async function sha256(str: string) {
  const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function genUID() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function deterministicStringify(obj: any): string {
  if (Array.isArray(obj)) {
    return `[${obj.map(deterministicStringify).join(",")}]`;
  } else if (obj && typeof obj === "object") {
    return `{${Object.keys(obj).sort().map(
      key => JSON.stringify(key) + ":" + deterministicStringify(obj[key])
    ).join(",")}}`;
  } else {
    return JSON.stringify(obj);
  }
}

export async function addProofMock(vc: any, did: string) {
  // ESCLUDI proof, _uid ed eventHistory dal calcolo dell’hash
  const { proof, _uid, eventHistory, ...credential } = vc;
  const hash = await sha256(deterministicStringify(credential));
  return {
    ...credential,
    proof: {
      type: "EcdsaSecp256k1Signature2019",
      jws: hash,
      verificationMethod: did
    },
    ...(vc._uid ? { _uid: vc._uid } : {}),
    ...(vc.eventHistory ? { eventHistory: vc.eventHistory } : {})
  };
}

export async function verifyProof(vc: any) {
  if (!vc?.proof?.jws || !vc?.proof?.verificationMethod) return false;
  // ESCLUDI proof, _uid ed eventHistory dal calcolo dell’hash
  const { proof, _uid, eventHistory, ...credential } = vc;
  const hash = await sha256(deterministicStringify(credential));
  return hash === vc.proof.jws;
}

export function getHistoryKey(did: string) {
  return `vc_history_${did}`;
}
export function loadHistory(did: string) {
  try {
    const raw = localStorage.getItem(getHistoryKey(did));
    let arr = raw ? JSON.parse(raw) : [];
    arr.forEach((vc: any) => { if (!vc._uid) vc._uid = genUID(); });
    return arr;
  } catch {
    return [];
  }
}
export function saveHistory(did: string, arr: any[]) {
  localStorage.setItem(getHistoryKey(did), JSON.stringify(arr));
}
