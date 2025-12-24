/**
 * Encryption Module using AES-256-GCM
 * Implements zero-knowledge encryption for vault data
 * All encryption happens client-side - server never sees unencrypted data
 */

import { arrayBufferToBase64, base64ToArrayBuffer, generateIV } from './utils';
import { CRYPTO_CONSTANTS, type EncryptedData, type VerificationResult } from './types';

/**
 * Encrypts data using AES-256-GCM
 *
 * @param data - Data to encrypt (will be JSON stringified)
 * @param key - CryptoKey for encryption (from key derivation)
 * @returns Promise resolving to EncryptedData with ciphertext and IV
 *
 * @throws Error if encryption fails
 *
 * @example
 * ```typescript
 * const vaultData = { passwords: [...], notes: [...] };
 * const encrypted = await encrypt(vaultData, derivedKey);
 * // Store encrypted.ciphertext and encrypted.iv in database
 * ```
 */
export async function encrypt<T = any>(data: T, key: CryptoKey): Promise<EncryptedData> {
  if (!crypto.subtle) {
    throw new Error('Web Crypto API non supportata');
  }

  try {
    // Generate random IV for this encryption
    const ivBase64 = generateIV(CRYPTO_CONSTANTS.AES_GCM_IV_LENGTH);
    const iv = base64ToArrayBuffer(ivBase64);

    // Convert data to ArrayBuffer
    const encoder = new TextEncoder();
    const plaintext = encoder.encode(JSON.stringify(data));

    // Encrypt with AES-GCM
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      plaintext
    );

    return {
      ciphertext: arrayBufferToBase64(ciphertext),
      iv: ivBase64
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Errore durante la crittografia dei dati');
  }
}

/**
 * Decrypts data using AES-256-GCM
 *
 * @param encryptedData - Object containing ciphertext and IV (both Base64)
 * @param key - CryptoKey for decryption (same key used for encryption)
 * @returns Promise resolving to decrypted data
 *
 * @throws Error if decryption fails (wrong key or corrupted data)
 *
 * @example
 * ```typescript
 * try {
 *   const vaultData = await decrypt(encryptedData, derivedKey);
 *   // Use decrypted data
 * } catch (error) {
 *   // Wrong master password or corrupted data
 *   console.error('Decryption failed');
 * }
 * ```
 */
export async function decrypt<T = any>(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<T> {
  if (!crypto.subtle) {
    throw new Error('Web Crypto API non supportata');
  }

  try {
    // Convert Base64 strings back to ArrayBuffers
    const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
    const iv = base64ToArrayBuffer(encryptedData.iv);

    // Decrypt with AES-GCM
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );

    // Convert ArrayBuffer back to string and parse JSON
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decrypted);
    return JSON.parse(jsonString);
  } catch (error) {
    // This typically means wrong password or corrupted data
    console.error('Decryption error:', error);
    throw new Error('Password errata o dati corrotti');
  }
}

/**
 * Creates an encrypted verification check to validate master password on login
 * Encrypts a known string that can be decrypted to verify correct password
 *
 * @param key - CryptoKey to use for encryption
 * @returns Promise resolving to EncryptedData containing encrypted verification string
 *
 * @example
 * ```typescript
 * // During registration:
 * const verificationCheck = await createVerificationCheck(derivedKey);
 * // Store verificationCheck in database with vault
 * ```
 */
export async function createVerificationCheck(key: CryptoKey): Promise<EncryptedData> {
  return encrypt(CRYPTO_CONSTANTS.VERIFICATION_STRING, key);
}

/**
 * Verifies a master password by attempting to decrypt the verification check
 *
 * @param verificationCheck - The encrypted verification data
 * @param key - CryptoKey derived from master password attempt
 * @returns Promise resolving to VerificationResult
 *
 * @example
 * ```typescript
 * // During login:
 * const result = await verifyPassword(storedVerificationCheck, derivedKey);
 * if (result.isValid) {
 *   // Correct password - proceed to decrypt vault
 * } else {
 *   // Wrong password - show error
 * }
 * ```
 */
export async function verifyPassword(
  verificationCheck: EncryptedData,
  key: CryptoKey
): Promise<VerificationResult> {
  try {
    const decrypted = await decrypt<string>(verificationCheck, key);

    if (decrypted === CRYPTO_CONSTANTS.VERIFICATION_STRING) {
      return { isValid: true };
    } else {
      return {
        isValid: false,
        error: 'Verification string mismatch'
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Password errata'
    };
  }
}

/**
 * Encrypts a simple string (useful for individual fields)
 *
 * @param text - Plain text string to encrypt
 * @param key - CryptoKey for encryption
 * @returns Promise resolving to EncryptedData
 */
export async function encryptString(text: string, key: CryptoKey): Promise<EncryptedData> {
  return encrypt(text, key);
}

/**
 * Decrypts a simple string
 *
 * @param encryptedData - Encrypted data containing ciphertext and IV
 * @param key - CryptoKey for decryption
 * @returns Promise resolving to decrypted string
 */
export async function decryptString(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<string> {
  return decrypt<string>(encryptedData, key);
}

/**
 * Re-encrypts data with a new key (useful for password change)
 *
 * @param encryptedData - Data encrypted with old key
 * @param oldKey - Old CryptoKey
 * @param newKey - New CryptoKey
 * @returns Promise resolving to newly encrypted data
 *
 * @example
 * ```typescript
 * // When user changes master password:
 * const reEncrypted = await reEncrypt(oldVault, oldDerivedKey, newDerivedKey);
 * // Store reEncrypted vault with new salt
 * ```
 */
export async function reEncrypt<T = any>(
  encryptedData: EncryptedData,
  oldKey: CryptoKey,
  newKey: CryptoKey
): Promise<EncryptedData> {
  // First decrypt with old key
  const decrypted = await decrypt<T>(encryptedData, oldKey);
  // Then encrypt with new key
  return encrypt(decrypted, newKey);
}
