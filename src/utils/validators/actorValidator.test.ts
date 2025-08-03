import { isActor } from './actorValidator';

describe('isActor', () => {
  it('restituisce true per Actor valido (role: operatore)', () => {
    const actor = {
      id: 'op1',
      name: 'Mario Rossi',
      role: 'operatore',
      aziendaId: 'az1',
      seed: 'abcdefg123456',
      publicKey: 'key123',
      credentials: [],
      events: [],
      createdAt: '2024-08-03T12:00:00Z',
      updatedAt: '2024-08-03T12:00:00Z'
    };
    expect(isActor(actor)).toBe(true);
  });

  it('restituisce true anche se alcuni campi opzionali sono assenti', () => {
    const actor = {
      id: 'op2',
      name: 'Luca Bianchi',
      role: 'macchinario'
    };
    expect(isActor(actor)).toBe(true);
  });

  it('restituisce false se manca il name', () => {
    const actor = {
      id: 'op3',
      role: 'creator'
    };
    expect(isActor(actor)).toBe(false);
  });

  it('restituisce false se role non è tra quelli validi', () => {
    const actor = {
      id: 'op4',
      name: 'Anna Verdi',
      role: 'manager'
    };
    expect(isActor(actor)).toBe(false);
  });

  it('restituisce false se credentials non è un array', () => {
    const actor = {
      id: 'op5',
      name: 'Paolo Neri',
      role: 'azienda',
      credentials: 'non-array'
    };
    expect(isActor(actor)).toBe(false);
  });

  it('restituisce false se oggetto è nullo', () => {
    expect(isActor(null)).toBe(false);
  });
});
