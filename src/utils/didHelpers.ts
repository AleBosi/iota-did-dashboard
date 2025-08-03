// Genera un DID mock unico per test/demo
export function createMockDID(prefix: string = "did:iota:evm"): string {
  return `${prefix}:${crypto.randomUUID()}`;
}
