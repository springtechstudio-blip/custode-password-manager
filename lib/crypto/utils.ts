/**
 * Crypto utilities for Base64 encoding/decoding and ArrayBuffer conversions
 * Used for storing encrypted data and cryptographic values (salt, IV) as strings
 */

/**
 * Converts an ArrayBuffer to a Base64 string
 * @param buffer - The ArrayBuffer to convert
 * @returns Base64-encoded string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts a Base64 string back to an ArrayBuffer
 * @param base64 - The Base64 string to convert
 * @returns ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Converts a Uint8Array to a Base64 string
 * @param array - The Uint8Array to convert
 * @returns Base64-encoded string
 */
export function uint8ArrayToBase64(array: Uint8Array): string {
  return arrayBufferToBase64(array.buffer);
}

/**
 * Converts a Base64 string to a Uint8Array
 * @param base64 - The Base64 string to convert
 * @returns Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(base64ToArrayBuffer(base64));
}

/**
 * Generates a random salt for key derivation
 * @param length - Length of the salt in bytes (default: 16)
 * @returns Base64-encoded salt string
 */
export function generateSalt(length: number = 16): string {
  const salt = crypto.getRandomValues(new Uint8Array(length));
  return uint8ArrayToBase64(salt);
}

/**
 * Generates a random initialization vector (IV) for AES-GCM
 * @param length - Length of the IV in bytes (default: 12 for GCM)
 * @returns Base64-encoded IV string
 */
export function generateIV(length: number = 12): string {
  const iv = crypto.getRandomValues(new Uint8Array(length));
  return uint8ArrayToBase64(iv);
}

/**
 * Checks if the Web Crypto API is available
 * @returns true if Web Crypto API is supported
 */
export function isCryptoSupported(): boolean {
  return typeof crypto !== 'undefined' &&
         typeof crypto.subtle !== 'undefined';
}
