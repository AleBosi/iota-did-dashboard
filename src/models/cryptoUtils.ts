// Utility functions for cryptographic operations
import { generateSeed as generateSeedUtil } from './seedUtils';
import { generateDid } from './didUtils';

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
  // In a real implementation, this would use proper cryptographic verification
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

