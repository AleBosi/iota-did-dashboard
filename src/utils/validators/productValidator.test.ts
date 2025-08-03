import { isProduct } from './productValidator';

describe('isProduct', () => {
  it('restituisce true per Product valido con tutti i campi', () => {
    const product = {
      id: 'prod1',
      did: 'did:iota:1234',
      name: 'Prodotto 1',
      typeId: 'type1',
      serial: 'SERIAL123',
      owner: 'azienda1',
      bom: [
        { id: 'comp1', name: 'Componente 1' },
        { id: 'comp2', name: 'Componente 2' }
      ],
      credentials: [],
      eventHistory: [],
      description: 'Descrizione test',
      batchNumber: 'BATCH42',
      expiryDate: '2025-12-31'
    };
    expect(isProduct(product)).toBe(true);
  });

  it('restituisce true anche se molti campi opzionali sono assenti', () => {
    const product = {
      id: 'prod2',
      did: 'did:iota:5678',
      name: 'Prodotto 2'
    };
    expect(isProduct(product)).toBe(true);
  });

  it('restituisce false se manca il name', () => {
    const product = {
      id: 'prod3',
      did: 'did:iota:91011'
    };
    expect(isProduct(product)).toBe(false);
  });

  it('restituisce false se bom non è un array', () => {
    const product = {
      id: 'prod4',
      did: 'did:iota:121314',
      name: 'Prodotto 4',
      bom: 'non-un-array'
    };
    expect(isProduct(product)).toBe(false);
  });

  it('restituisce false se bom ha oggetti non validi', () => {
    const product = {
      id: 'prod5',
      did: 'did:iota:151617',
      name: 'Prodotto 5',
      bom: [{ id: 1, name: null }]
    };
    expect(isProduct(product)).toBe(false);
  });

  it('restituisce false se credentials non è un array', () => {
    const product = {
      id: 'prod6',
      did: 'did:iota:181920',
      name: 'Prodotto 6',
      credentials: 'non-array'
    };
    expect(isProduct(product)).toBe(false);
  });

  it('restituisce false per oggetto nullo', () => {
    expect(isProduct(null)).toBe(false);
  });
});
