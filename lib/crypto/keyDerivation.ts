/**
 * Key Derivation Module using PBKDF2
 * Implements secure key derivation from master password
 * Uses 100,000 iterations as specified in PRD for zero-knowledge architecture
 */

import { base64ToUint8Array, uint8ArrayToBase64, generateSalt } from './utils';
import { CRYPTO_CONSTANTS, type DerivedKey } from './types';

/**
 * Derives an encryption key from a master password using PBKDF2
 *
 * @param masterPassword - The user's master password
 * @param saltBase64 - Base64-encoded salt (if null, generates new salt)
 * @returns Promise resolving to DerivedKey with CryptoKey and salt
 *
 * @throws Error if Web Crypto API is not supported
 * @throws Error if key derivation fails
 *
 * @example
 * ```typescript
 * // First time (registration) - generate new salt
 * const { key, salt } = await deriveKeyFromPassword('MySecurePass123!');
 * // Store salt in database for this user
 *
 * // Subsequent times (login) - use stored salt
 * const { key } = await deriveKeyFromPassword('MySecurePass123!', storedSalt);
 * ```
 */
export async function deriveKeyFromPassword(
  masterPassword: string,
  saltBase64?: string | null
): Promise<DerivedKey> {
  if (!crypto.subtle) {
    throw new Error('Web Crypto API non supportata. Usa un browser moderno.');
  }

  // Use provided salt or generate new one
  const salt = saltBase64
    ? base64ToUint8Array(saltBase64)
    : crypto.getRandomValues(new Uint8Array(CRYPTO_CONSTANTS.SALT_LENGTH));

  const saltString = saltBase64 || uint8ArrayToBase64(salt);

  try {
    // Step 1: Import password as key material
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(masterPassword);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,  // Not extractable
      ['deriveKey']
    );

    // Step 2: Derive AES-GCM key using PBKDF2
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: CRYPTO_CONSTANTS.PBKDF2_ITERATIONS,  // 100,000 iterations
        hash: CRYPTO_CONSTANTS.HASH_ALGORITHM  // SHA-256
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: CRYPTO_CONSTANTS.AES_KEY_LENGTH  // 256 bits
      },
      false,  // Not extractable (more secure - key stays in secure context)
      ['encrypt', 'decrypt']
    );

    return {
      key,
      salt: saltString
    };
  } catch (error) {
    console.error('Key derivation error:', error);
    throw new Error('Errore nella derivazione della chiave di crittografia');
  }
}

/**
 * Generates a new salt for key derivation
 * Wrapper around generateSalt from utils for convenience
 *
 * @returns Base64-encoded salt string
 */
export function generateNewSalt(): string {
  return generateSalt(CRYPTO_CONSTANTS.SALT_LENGTH);
}

/**
 * Validates that a master password meets security requirements
 * As per PRD: minimum 12 characters, uppercase, lowercase, number, special char
 *
 * @param password - Password to validate
 * @returns Object with isValid boolean and array of failed requirements
 *
 * @example
 * ```typescript
 * const validation = validateMasterPassword('weak');
 * if (!validation.isValid) {
 *   console.log('Failed requirements:', validation.failedRequirements);
 * }
 * ```
 */
export function validateMasterPassword(password: string): {
  isValid: boolean;
  failedRequirements: string[];
} {
  const requirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const failedRequirements: string[] = [];
  if (!requirements.minLength) failedRequirements.push('Almeno 12 caratteri');
  if (!requirements.hasUppercase) failedRequirements.push('Una lettera maiuscola');
  if (!requirements.hasLowercase) failedRequirements.push('Una lettera minuscola');
  if (!requirements.hasNumber) failedRequirements.push('Un numero');
  if (!requirements.hasSpecial) failedRequirements.push('Un carattere speciale');

  return {
    isValid: failedRequirements.length === 0,
    failedRequirements
  };
}

/**
 * Estimates the time it takes to derive a key (useful for UX feedback)
 * On modern hardware, 100,000 iterations typically takes 100-300ms
 *
 * @param password - Test password
 * @returns Promise resolving to duration in milliseconds
 */
export async function estimateKeyDerivationTime(password: string = 'test'): Promise<number> {
  const startTime = performance.now();
  await deriveKeyFromPassword(password);
  const endTime = performance.now();
  return Math.round(endTime - startTime);
}
