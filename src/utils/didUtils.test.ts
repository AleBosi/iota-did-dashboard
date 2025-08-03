import { generateDid } from './didUtils';

describe('generateDid', () => {
  it('genera un DID che inizia con "did:iota:evm:0x"', () => {
    const did = generateDid();
    expect(did.startsWith('did:iota:evm:0x')).toBe(true);
  });

  it('genera DIDs unici ogni volta', () => {
    const did1 = generateDid();
    const did2 = generateDid();
    expect(did1).not.toBe(did2);
  });

  it('genera un DID della lunghezza prevista', () => {
    const did = generateDid();
    // "did:iota:evm:0x" = 15 + 40 caratteri (20 byte hex) = 55
    expect(did.length).toBe(55);
  });

  it('contiene solo caratteri hex dopo "0x"', () => {
    const did = generateDid();
    const hex = did.split('0x')[1];
    expect(hex).toMatch(/^[0-9a-f]{40}$/);
  });
});
