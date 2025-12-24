/**
 * Type definitions for cryptographic operations
 */

/**
 * Encrypted data structure returned by encryption functions
 */
export interface EncryptedData {
  /** Base64-encoded ciphertext */
  ciphertext: string;
  /** Base64-encoded initialization vector */
  iv: string;
}

/**
 * Complete encrypted vault structure as stored in database
 */
export interface EncryptedVault extends EncryptedData {
  /** Base64-encoded salt used for key derivation */
  salt: string;
  /** Encrypted verification string to validate master password */
  encryptionCheck: string;
  /** Version number for schema migrations */
  version: number;
}

/**
 * Key derivation parameters
 */
export interface KeyDerivationParams {
  /** Number of PBKDF2 iterations (default: 100,000 per PRD) */
  iterations: number;
  /** Hash algorithm for PBKDF2 (default: SHA-256) */
  hash: 'SHA-256' | 'SHA-384' | 'SHA-512';
  /** Salt length in bytes (default: 16) */
  saltLength: number;
}

/**
 * Encryption parameters for AES-GCM
 */
export interface EncryptionParams {
  /** AES key length in bits (default: 256) */
  keyLength: 128 | 192 | 256;
  /** IV length in bytes for GCM (default: 12) */
  ivLength: number;
}

/**
 * Result of key derivation operation
 */
export interface DerivedKey {
  /** The derived CryptoKey for encryption/decryption */
  key: CryptoKey;
  /** Base64-encoded salt used */
  salt: string;
}

/**
 * Verification result when checking master password
 */
export interface VerificationResult {
  /** Whether the password is correct */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Constants for cryptographic operations (per PRD requirements)
 */
export const CRYPTO_CONSTANTS = {
  /** PBKDF2 iterations as specified in PRD */
  PBKDF2_ITERATIONS: 100000,
  /** Default hash algorithm */
  HASH_ALGORITHM: 'SHA-256' as const,
  /** AES key length */
  AES_KEY_LENGTH: 256,
  /** AES-GCM IV length (12 bytes is standard) */
  AES_GCM_IV_LENGTH: 12,
  /** Salt length for key derivation */
  SALT_LENGTH: 16,
  /** Verification string to check correct decryption */
  VERIFICATION_STRING: 'CUSTODE_VAULT_V1',
} as const;
