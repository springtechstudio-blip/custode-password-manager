/**
 * Have I Been Pwned Integration
 * Check if passwords have been compromised in data breaches
 */

import { PasswordEntry } from '../../types';

/**
 * Check a single password against Have I Been Pwned database
 * Uses k-anonymity model: only first 5 chars of SHA-1 hash are sent
 */
export async function checkPasswordCompromised(password: string): Promise<{
  isCompromised: boolean;
  count: number; // Number of times seen in breaches
  error?: string;
}> {
  try {
    // Create SHA-1 hash of password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Send only first 5 characters to API (k-anonymity)
    const prefix = hashHex.substring(0, 5).toUpperCase();
    const suffix = hashHex.substring(5).toUpperCase();

    // Call HIBP API
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          'Add-Padding': 'true' // Prevents API from leaking info based on response size
        }
      }
    );

    if (!response.ok) {
      return {
        isCompromised: false,
        count: 0,
        error: `API error: ${response.status}`
      };
    }

    const text = await response.text();
    const lines = text.split('\n');

    // Check if our suffix appears in results
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        return {
          isCompromised: true,
          count: parseInt(countStr.trim(), 10)
        };
      }
    }

    return {
      isCompromised: false,
      count: 0
    };
  } catch (error) {
    return {
      isCompromised: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check multiple passwords in batch
 * Returns map of password ID -> compromised status
 */
export async function checkMultiplePasswords(
  passwords: PasswordEntry[]
): Promise<Map<string, { isCompromised: boolean; count: number }>> {
  const results = new Map();

  // Check in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < passwords.length; i += batchSize) {
    const batch = passwords.slice(i, i + batchSize);

    const promises = batch.map(async (pw) => {
      const result = await checkPasswordCompromised(pw.password);
      return { id: pw.id, result };
    });

    const batchResults = await Promise.all(promises);

    batchResults.forEach(({ id, result }) => {
      results.set(id, {
        isCompromised: result.isCompromised,
        count: result.count
      });
    });

    // Delay between batches (1.5 seconds per HIBP API guidelines)
    if (i + batchSize < passwords.length) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  return results;
}

/**
 * Get compromised passwords from a list
 */
export async function getCompromisedPasswords(
  passwords: PasswordEntry[]
): Promise<PasswordEntry[]> {
  const results = await checkMultiplePasswords(passwords);
  return passwords.filter((pw) => results.get(pw.id)?.isCompromised);
}
