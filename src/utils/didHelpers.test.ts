import { createMockDID } from './didHelpers';

describe('createMockDID', () => {
  it('genera un DID che inizia con il prefisso di default', () => {
    const did = createMockDID();
    expect(did.startsWith('did:iota:evm:')).toBe(true);
    expect(did.length).toBeGreaterThan('did:iota:evm:'.length);
  });

  it('genera un DID unico ogni volta', () => {
    const did1 = createMockDID();
    const did2 = createMockDID();
    expect(did1).not.toBe(did2);
  });

  it('genera un DID con prefisso personalizzato', () => {
    const prefix = 'did:custom:test';
    const did = createMockDID(prefix);
    expect(did.startsWith(prefix + ':')).toBe(true);
  });
});
