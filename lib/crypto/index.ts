/**
 * Crypto Module - Main exports
 * Provides zero-knowledge client-side encryption for Custode
 */

// Encryption functions
export {
  encrypt,
  decrypt,
  encryptString,
  decryptString,
  createVerificationCheck,
  verifyPassword,
  reEncrypt
} from './encryption';

// Key derivation functions
export {
  deriveKeyFromPassword,
  generateNewSalt,
  validateMasterPassword,
  estimateKeyDerivationTime
} from './keyDerivation';

// Utility functions
export {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  uint8ArrayToBase64,
  base64ToUint8Array,
  generateSalt,
  generateIV,
  isCryptoSupported
} from './utils';

// Types
export type {
  EncryptedData,
  EncryptedVault,
  KeyDerivationParams,
  EncryptionParams,
  DerivedKey,
  VerificationResult
} from './types';

export { CRYPTO_CONSTANTS } from './types';

// Test function (development only)
export { runCryptoTests } from './test';
