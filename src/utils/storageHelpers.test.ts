import { saveItem, loadItem, removeItem } from './storageHelpers';

describe('storageHelpers', () => {
  const key = 'test-key';

  beforeEach(() => {
    localStorage.clear();
  });

  it('saveItem salva un oggetto e loadItem lo recupera identico', () => {
    const data = { foo: 'bar', num: 42 };
    saveItem(key, data);
    const result = loadItem<typeof data>(key);
    expect(result).toEqual(data);
  });

  it('loadItem restituisce null se la chiave non esiste', () => {
    const result = loadItem('non-existent-key');
    expect(result).toBeNull();
  });

  it('removeItem cancella la chiave dal localStorage', () => {
    saveItem(key, { a: 1 });
    removeItem(key);
    expect(loadItem(key)).toBeNull();
  });

  it('saveItem sovrascrive la chiave se già esistente', () => {
    saveItem(key, { first: true });
    saveItem(key, { second: true });
    const result = loadItem<{ second: boolean }>(key);
    expect(result).toEqual({ second: true });
  });
});