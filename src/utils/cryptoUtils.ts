// Utility functions for cryptographic operations
// === Manteniamo le tue API esistenti e aggiungiamo MOCK "persistente e sicuro" ===

import { generateSeed as generateSeedUtil } from './seedUtils';
import { generateDid } from './didUtils';

import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { sha256 } from "@noble/hashes/sha256";
import { keccak_256 } from "@noble/hashes/sha3";

// -------------------------
// A) SEED & ACCOUNT (MOCK)
// -------------------------

export type MockAccount = {
  mnemonic: string;                 // NON salvarla in chiaro nello storage
  derivationPath: string;           // "m/44'/60'/0'/0/0"
  address: `0x${string}`;           // 20 bytes mock deterministici
  did: string;                      // did:mock:<keccak(address)>
};

const DEFAULT_PATH = "m/44'/60'/0'/0/0";

function toHex(u8: Uint8Array) {
  return Array.from(u8, b => b.toString(16).padStart(2, '0')).join('');
}

export function generateMnemonic24(): string {
  return generateMnemonic(wordlist, 256); // 24 parole reali
}

export function deriveMockAccount(mnemonic: string, derivationPath = DEFAULT_PATH): MockAccount {
  const bytes = new TextEncoder().encode(`${derivationPath}:${mnemonic}`);
  const h = sha256(bytes); // 32 bytes
  const addrHex = toHex(h).slice(0, 40);
  const address = (`0x${addrHex}`) as `0x${string}`;
  const did = `did:mock:${toHex(keccak_256(address.slice(2)))}`;
  return { mnemonic, derivationPath, address, did };
}

// ---------------------------------------
// B) CIFRATURA MNEMONIC (WebCrypto, MOCK)
// ---------------------------------------
// AES-GCM 256 con chiave derivata da password via PBKDF2(SHA-256)

async function importKeyFromPassword(password: string, salt: Uint8Array) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function b64encode(u8: Uint8Array) {
  return btoa(String.fromCharCode(...u8));
}
function b64decode(s: string) {
  return new Uint8Array([...atob(s)].map(c => c.charCodeAt(0)));
}

/**
 * Cifra la mnemonic con password (ritorna stringa base64 contenente salt|iv|cipher)
 */
export async function encryptMnemonic(mnemonic: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await importKeyFromPassword(password, salt);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(mnemonic))
  );
  // formato: SALT(16) | IV(12) | CIPHERTEXT
  const payload = new Uint8Array(salt.length + iv.length + ciphertext.length);
  payload.set(salt, 0);
  payload.set(iv, salt.length);
  payload.set(ciphertext, salt.length + iv.length);
  return b64encode(payload);
}

/**
 * Decifra la mnemonic da base64(salt|iv|cipher)
 */
export async function decryptMnemonic(payloadB64: string, password: string): Promise<string> {
  const payload = b64decode(payloadB64);
  const salt = payload.slice(0, 16);
  const iv = payload.slice(16, 28);
  const cipher = payload.slice(28);
  const key = await importKeyFromPassword(password, salt);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return new TextDecoder().decode(plain);
}

// -------------------------------------------------
// C) STORAGE HELPER per seed cifrata (localStorage)
// -------------------------------------------------

type SeedEntityType = 'company' | 'actor' | 'machine';

function seedKey(type: SeedEntityType, id: string) {
  return `seed_v1:${type}:${id}`;
}

/**
 * Salva in localStorage una mnemonic CIFRATA con password (MOCK persistente)
 * - Non salva mai la seed in chiaro
 */
export async function saveEncryptedSeed(
  type: SeedEntityType,
  id: string,
  mnemonic: string,
  password: string
): Promise<void> {
  const enc = await encryptMnemonic(mnemonic, password);
  localStorage.setItem(seedKey(type, id), enc);
}

/**
 * Verifica se esiste una seed cifrata per (type,id)
 */
export function hasEncryptedSeed(type: SeedEntityType, id: string): boolean {
  return !!localStorage.getItem(seedKey(type, id));
}

/**
 * Carica e decifra la seed con password (throw se password errata o seed assente)
 */
export async function loadDecryptedSeed(
  type: SeedEntityType,
  id: string,
  password: string
): Promise<string> {
  const enc = localStorage.getItem(seedKey(type, id));
  if (!enc) throw new Error('Seed non trovata per questa entità.');
  try {
    return await decryptMnemonic(enc, password);
  } catch {
    throw new Error('Password non corretta.');
  }
}

/* =================================================
 *              LE TUE API ESISTENTI (invariato)
 * ================================================= */

/**
 * Generate a cryptographic seed
 * @param length - Length of the seed in bytes (default: 32)
 * @returns Hexadecimal string representation of the seed
 */
export function generateSeed(length: number = 32): string {
  return generateSeedUtil(length);
}

/**
 * Generate a DID (Decentralized Identifier) for IOTA
 * @returns DID string in the format did:iota:evm:0x...
 */
export function generateDID(): string {
  return generateDid();
}

/**
 * Generate a key pair from a seed (mock implementation)
 * @param seed - The seed to generate keys from
 * @returns Object containing public and private keys
 */
export function generateKeyPair(seed: string): { publicKey: string; privateKey: string } {
  // Mock implementation for demo purposes
  const hash = Array.from(new TextEncoder().encode(seed))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return {
    publicKey: `pub_${hash.substring(0, 32)}`,
    privateKey: `priv_${hash.substring(32, 64)}`
  };
}

/**
 * Create a digital signature (mock implementation)
 * @param data - Data to sign
 * @param privateKey - Private key for signing
 * @returns Signature string
 */
export function createSignature(data: string, privateKey: string): string {
  // Mock implementation for demo purposes
  const hash = Array.from(new TextEncoder().encode(data + privateKey))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return `sig_${hash.substring(0, 64)}`;
}

/**
 * Verify a digital signature (mock implementation)
 * @param data - Original data
 * @param signature - Signature to verify
 * @param publicKey - Public key for verification
 * @returns Boolean indicating if signature is valid
 */
export function verifySignature(_data: string, signature: string, _publicKey: string): boolean {
  // Mock implementation for demo purposes
  return signature.startsWith('sig_') && signature.length === 68;
}

/**
 * Generate a hash of data (mock implementation)
 * @param data - Data to hash
 * @returns Hash string
 */
export function generateHash(data: string): string {
  // Mock implementation using simple hash
  const hash = Array.from(new TextEncoder().encode(data))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return `hash_${hash.substring(0, 32)}`;
}
