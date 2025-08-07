export function generateDid(): string {
  // Mock: genera un DID tipo IOTA (per demo/local)
  const random = Array.from(crypto.getRandomValues(new Uint8Array(20)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `did:iota:evm:0x${random}`;
}