import { isDidDocument } from './didValidator';

describe('isDidDocument', () => {
  it('restituisce true per DidDocument valido completo', () => {
    const doc = {
      id: 'did:iota:1234',
      controller: ['did:iota:5678'],
      verificationMethod: [
        {
          id: 'did:iota:1234#key-1',
          type: 'Ed25519VerificationKey2020',
          publicKeyMultibase: 'z6Mks...'
        }
      ],
      authentication: ['did:iota:1234#key-1'],
      service: [
        {
          id: 'did:iota:1234#service-1',
          type: 'LinkedDomains',
          serviceEndpoint: 'https://example.com'
        }
      ]
    };
    expect(isDidDocument(doc)).toBe(true);
  });

  it('restituisce true se tutti i campi opzionali sono assenti', () => {
    const doc = {
      id: 'did:iota:abcd'
    };
    expect(isDidDocument(doc)).toBe(true);
  });

  it('restituisce false se manca id', () => {
    const doc = {
      controller: ['did:iota:1234']
    };
    expect(isDidDocument(doc)).toBe(false);
  });

  it('restituisce false se verificationMethod contiene oggetto non valido', () => {
    const doc = {
      id: 'did:iota:4321',
      verificationMethod: [
        {
          id: 'did:iota:4321#key-1',
          type: 'Ed25519VerificationKey2020'
          // manca publicKeyMultibase
        }
      ]
    };
    expect(isDidDocument(doc)).toBe(false);
  });

  it('restituisce false se service contiene oggetto non valido', () => {
    const doc = {
      id: 'did:iota:5555',
      service: [
        {
          id: 'did:iota:5555#service-1',
          type: 'LinkedDomains'
          // manca serviceEndpoint
        }
      ]
    };
    expect(isDidDocument(doc)).toBe(false);
  });

  it('restituisce false per oggetto nullo', () => {
    expect(isDidDocument(null)).toBe(false);
  });
});
