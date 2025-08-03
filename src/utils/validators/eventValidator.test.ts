import { isEvent } from './eventValidator';

describe('isEvent', () => {
  it('restituisce true per Event valido con tutti i campi', () => {
    const event = {
      id: 'evt1',
      type: 'produzione',
      description: 'Evento di produzione',
      date: '2024-08-03T12:00:00Z',
      productId: 'prod1',
      bomComponent: 'comp1',
      by: 'op1',
      done: true,
      vcId: 'vc1'
    };
    expect(isEvent(event)).toBe(true);
  });

  it('restituisce true se tutti i campi opzionali sono assenti', () => {
    const event = {
      id: 'evt2',
      type: 'controllo',
      description: 'Controllo qualità',
      date: '2024-08-03T14:00:00Z'
    };
    expect(isEvent(event)).toBe(true);
  });

  it('restituisce false se manca id', () => {
    const event = {
      type: 'spostamento',
      description: 'Spostamento magazzino',
      date: '2024-08-03T15:00:00Z'
    };
    expect(isEvent(event)).toBe(false);
  });

  it('restituisce false se done non è booleano', () => {
    const event = {
      id: 'evt3',
      type: 'allarme',
      description: 'Errore macchina',
      date: '2024-08-03T16:00:00Z',
      done: 'yes'
    };
    expect(isEvent(event)).toBe(false);
  });

  it('restituisce false se description non è una stringa', () => {
    const event = {
      id: 'evt4',
      type: 'produzione',
      description: 1234,
      date: '2024-08-03T17:00:00Z'
    };
    expect(isEvent(event)).toBe(false);
  });

  it('restituisce false per oggetto nullo', () => {
    expect(isEvent(null)).toBe(false);
  });
});
