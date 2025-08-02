// src/seedUtils.ts

// --- Funzioni per SEED PHRASE (mock) ---

// Genera una seed phrase fittizia (12 parole)
export function generateSeedPhrase(): string {
  const words = [
    "apple", "banana", "cat", "dog", "easy", "flower",
    "golf", "hotel", "item", "jazz", "king", "lemon",
    "moon", "nest", "olive", "panda", "queen", "rose",
    "star", "tree", "umbrella", "valley", "wind", "zebra"
  ];
  return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(" ");
}

// MOCK cifratura: base64 con finto prefix
export function encryptSeed(seedPhrase: string, masterKey = "MOCK_MASTER_KEY"): string {
  return "ENC::" + btoa(seedPhrase + "::" + masterKey);
}

export function decryptSeed(encrypted: string, masterKey = "MOCK_MASTER_KEY"): string {
  if (!encrypted.startsWith("ENC::")) throw new Error("Formato seed non valido!");
  const raw = atob(encrypted.replace("ENC::", ""));
  const [seed, key] = raw.split("::");
  if (key !== masterKey) throw new Error("Master key errata!");
  return seed;
}

// --- Deriva un DID IOTA (mock) dalla seed (puoi adattare la logica!) ---
export function deriveDidFromSeed(seed: string): string {
  // In produzione dovresti hashare la seed e usare uno schema più robusto!
  // Qui usiamo solo la seed a scopo dimostrativo
  return "did:iota:evm:" + btoa(seed).replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);
}
