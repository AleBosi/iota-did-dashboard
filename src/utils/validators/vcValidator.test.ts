import { isVerifiableCredential } from './vcValidator';

describe('isVerifiableCredential', () => {
  const baseProof = {
    type: 'Ed25519Signature2020',
    created: '2024-08-03T12:00:00Z',
    proofPurpose: 'assertionMethod',
    verificationMethod: 'did:iota:issuer#key-1',
    jws: 'jwsSignature',
    hash: 'hashValue'
  };

  it('restituisce true per VC valida completa', () => {
    const vc = {
      id: 'vc1',
      type: ['VerifiableCredential', 'ProductCredential'],
      issuer: 'did:iota:issuer',
      issuanceDate: '2024-08-03T12:00:00Z',
      credentialSubject: { id: 'prod1', name: 'Prodotto' },
      proof: baseProof,
      status: 'valid',
      previousProofs: [baseProof]
    };
    expect(isVerifiableCredential(vc)).toBe(true);
  });

  it('restituisce true per VC valida senza status e previousProofs', () => {
    const vc = {
      id: 'vc2',
      type: ['VerifiableCredential'],
      issuer: 'did:iota:issuer',
      issuanceDate: '2024-08-03T14:00:00Z',
      credentialSubject: { id: 'prod2' },
      proof: baseProof
    };
    expect(isVerifiableCredential(vc)).toBe(true);
  });

  it('restituisce false se manca proof', () => {
    const vc = {
      id: 'vc3',
      type: ['VerifiableCredential'],
      issuer: 'did:iota:issuer',
      issuanceDate: '2024-08-03T15:00:00Z',
      credentialSubject: { id: 'prod3' }
    };
    expect(isVerifiableCredential(vc)).toBe(false);
  });

  it('restituisce false se proof non è valido', () => {
    const vc = {
      id: 'vc4',
      type: ['VerifiableCredential'],
      issuer: 'did:iota:issuer',
      issuanceDate: '2024-08-03T16:00:00Z',
      credentialSubject: { id: 'prod4' },
      proof: { ...baseProof, hash: 1234 }
    };
    expect(isVerifiableCredential(vc)).toBe(false);
  });

  it('restituisce false se previousProofs contiene un elemento non valido', () => {
    const vc = {
      id: 'vc5',
      type: ['VerifiableCredential'],
      issuer: 'did:iota:issuer',
      issuanceDate: '2024-08-03T17:00:00Z',
      credentialSubject: { id: 'prod5' },
      proof: baseProof,
      previousProofs: [baseProof, { ...baseProof, jws: null }]
    };
    expect(isVerifiableCredential(vc)).toBe(false);
  });

  it('restituisce false se status non è tra i valori consentiti', () => {
    const vc = {
      id: 'vc6',
      type: ['VerifiableCredential'],
      issuer: 'did:iota:issuer',
      issuanceDate: '2024-08-03T18:00:00Z',
      credentialSubject: { id: 'prod6' },
      proof: baseProof,
      status: 'not-valid'
    };
    expect(isVerifiableCredential(vc)).toBe(false);
  });

  it('restituisce false per oggetto nullo', () => {
    expect(isVerifiableCredential(null)).toBe(false);
  });
});
