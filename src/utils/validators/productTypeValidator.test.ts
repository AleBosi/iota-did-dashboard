import { isProductType } from './productTypeValidator';

describe('isProductType', () => {
  it('restituisce true per ProductType valido con tutti i campi', () => {
    const productType = {
      id: 'type1',
      name: 'Categoria A',
      description: 'Descrizione di test'
    };
    expect(isProductType(productType)).toBe(true);
  });

  it('restituisce true anche se la description è assente', () => {
    const productType = {
      id: 'type2',
      name: 'Categoria B'
    };
    expect(isProductType(productType)).toBe(true);
  });

  it('restituisce false se manca il name', () => {
    const productType = {
      id: 'type3'
    };
    expect(isProductType(productType)).toBe(false);
  });

  it('restituisce false se description non è stringa', () => {
    const productType = {
      id: 'type4',
      name: 'Tipo 4',
      description: 12345
    };
    expect(isProductType(productType)).toBe(false);
  });

  it('restituisce false per oggetto nullo', () => {
    expect(isProductType(null)).toBe(false);
  });
});
