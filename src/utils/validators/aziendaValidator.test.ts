import { isAzienda } from './aziendaValidator';

describe('isAzienda', () => {
  it('restituisce true per oggetto Azienda valido', () => {
    const azienda = {
      id: 'az1',
      name: 'Acme Spa',
      seed: '1234567890abcdef',
      legalInfo: { vat: 'IT1234567890' },
      creators: [],
      operatori: [],
      macchinari: [],
      createdAt: '2024-08-03T12:00:00Z',
      updatedAt: '2024-08-03T12:00:00Z'
    };
    expect(isAzienda(azienda)).toBe(true);
  });

  it('restituisce true anche se legalInfo, createdAt, updatedAt sono assenti', () => {
    const azienda = {
      id: 'az1',
      name: 'Acme Spa',
      seed: '1234567890abcdef',
      creators: [],
      operatori: [],
      macchinari: []
    };
    expect(isAzienda(azienda)).toBe(true);
  });

  it('restituisce false se manca name', () => {
    const azienda = {
      id: 'az1',
      seed: '1234567890abcdef',
      creators: [],
      operatori: [],
      macchinari: []
    };
    expect(isAzienda(azienda)).toBe(false);
  });

  it('restituisce false se creators non è un array', () => {
    const azienda = {
      id: 'az1',
      name: 'Acme Spa',
      seed: '1234567890abcdef',
      creators: 'not-an-array',
      operatori: [],
      macchinari: []
    };
    expect(isAzienda(azienda)).toBe(false);
  });

  it('restituisce false per oggetto nullo', () => {
    expect(isAzienda(null)).toBe(false);
  });
});
