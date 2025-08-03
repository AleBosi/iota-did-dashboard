import { generateSeed } from './seedUtils';

describe('generateSeed', () => {
  it('genera un seed di 64 caratteri esadecimali di default', () => {
    const seed = generateSeed();
    expect(seed.length).toBe(64); // 32 bytes = 64 hex chars
    expect(seed).toMatch(/^[0-9a-f]{64}$/);
  });

  it('genera un seed della lunghezza richiesta', () => {
    const seed = generateSeed(16); // 16 bytes
    expect(seed.length).toBe(32); // 16 * 2 = 32 hex chars
    expect(seed).toMatch(/^[0-9a-f]{32}$/);
  });

  it('genera un seed diverso ogni volta', () => {
    const seed1 = generateSeed();
    const seed2 = generateSeed();
    expect(seed1).not.toBe(seed2);
  });
});
