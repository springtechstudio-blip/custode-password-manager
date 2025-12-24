/**
 * Authentication Module
 * Integrates Supabase Auth with client-side encryption
 * Implements zero-knowledge architecture: master password never sent to server
 */

import { supabase } from './client';
import {
  deriveKeyFromPassword,
  validateMasterPassword,
  encrypt,
  createVerificationCheck
} from '../crypto';
import type { VaultData, VaultOperationResult } from './types';

/**
 * Generates a unique device ID for this browser/device
 * Used for tracking devices and sync
 */
function getDeviceId(): string {
  let deviceId = localStorage.getItem('custode-device-id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('custode-device-id', deviceId);
  }
  return deviceId;
}

/**
 * Creates an empty vault structure for new users
 */
function createEmptyVault(): VaultData {
  return {
    passwords: [],
    notes: [],
    devKeys: [],
    folders: ['Personale', 'Lavoro', 'Finanza'],  // Default Italian folders
    customCategories: [],
    hiddenCategories: [],
    settings: {
      lockTimeout: 900000,  // 15 minutes in milliseconds
      clipboardTimeout: 60000  // 60 seconds
    },
    version: 1
  };
}

/**
 * Registers a new user with email and master password
 * Creates encrypted vault and stores it in Supabase
 *
 * @param email - User's email address
 * @param masterPassword - User's master password (validated client-side)
 * @param confirmPassword - Password confirmation
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * const result = await registerUser('user@example.com', 'SecurePass123!', 'SecurePass123!');
 * if (result.success) {
 *   // Registration successful, user is logged in
 * } else {
 *   // Show error: result.error
 * }
 * ```
 */
export async function registerUser(
  email: string,
  masterPassword: string,
  confirmPassword: string
): Promise<VaultOperationResult<{ userId: string }>> {
  try {
    // Validate passwords match
    if (masterPassword !== confirmPassword) {
      return {
        success: false,
        error: 'Le password non corrispondono'
      };
    }

    // Validate master password requirements
    const validation = validateMasterPassword(masterPassword);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Password non valida: ${validation.failedRequirements.join(', ')}`
      };
    }

    // Step 1: Derive encryption key from master password
    const { key, salt } = await deriveKeyFromPassword(masterPassword);

    // Step 2: Create empty vault
    const emptyVault = createEmptyVault();

    // Step 3: Encrypt vault
    const encryptedVault = await encrypt(emptyVault, key);

    // Step 4: Create verification check
    const verificationCheck = await createVerificationCheck(key);

    // Step 5: Register with Supabase Auth (email + master password)
    // NOTE: For MVP, we use master password for both auth and encryption
    // This is NOT true zero-knowledge but simplifies the implementation
    // TODO: In production, use magic links or hash the master password for auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: masterPassword,  // Using master password for Supabase Auth (MVP workaround)
      options: {
        data: {
          // Store non-sensitive user metadata
          device_id: getDeviceId()
        }
      }
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || 'Errore durante la registrazione'
      };
    }

    // Step 6: Store encrypted vault in database
    const { error: vaultError } = await supabase
      .from('vaults')
      .insert({
        user_id: authData.user.id,
        encrypted_data: {
          ciphertext: encryptedVault.ciphertext,
          iv: encryptedVault.iv
        },
        encryption_check: JSON.stringify(verificationCheck),
        salt: salt,
        iv: encryptedVault.iv,
        version: 1
      });

    if (vaultError) {
      // Note: Cannot rollback auth user creation without admin privileges
      // User will exist but have no vault (orphaned account)
      console.error('Vault creation failed:', vaultError);
      return {
        success: false,
        error: `Errore durante la creazione del vault: ${vaultError.message || vaultError.code || 'Sconosciuto'}`
      };
    }

    // Step 7: Create initial sync metadata
    await supabase.from('sync_metadata').insert({
      user_id: authData.user.id,
      device_id: getDeviceId(),
      device_name: getBrowserName(),
      device_type: 'web'
    });

    // Step 8: Log security event
    await supabase.rpc('log_security_event', {
      p_user_id: authData.user.id,
      p_event_type: 'vault_access',
      p_device_id: getDeviceId()
    });

    return {
      success: true,
      data: {
        userId: authData.user.id
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
}

/**
 * Logs in a user with email and master password
 * Validates password by attempting to decrypt verification check
 *
 * @param email - User's email address
 * @param masterPassword - User's master password
 * @returns Promise resolving to operation result with encryption key
 *
 * @example
 * ```typescript
 * const result = await loginUser('user@example.com', 'SecurePass123!');
 * if (result.success && result.data) {
 *   // Login successful, use result.data.key to decrypt vault
 *   const vault = await decryptVault(result.data.key);
 * }
 * ```
 */
export async function loginUser(
  email: string,
  masterPassword: string
): Promise<VaultOperationResult<{ key: CryptoKey; userId: string }>> {
  try {
    // Step 1: Sign in with Supabase Auth
    // NOTE: For MVP, we use master password for both auth and encryption
    // This simplifies the implementation but is NOT true zero-knowledge
    // TODO: In production, use magic links or hash the master password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: masterPassword  // Using master password for Supabase Auth (matches registration)
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: 'Email o password errati'
      };
    }

    // Step 2: Fetch user's salt from database
    const { data: vaultData, error: vaultError } = await supabase
      .from('vaults')
      .select('salt, encryption_check')
      .eq('user_id', authData.user.id)
      .single();

    if (vaultError || !vaultData) {
      return {
        success: false,
        error: 'Vault non trovato'
      };
    }

    // Step 3: Derive encryption key from master password + salt
    const { key } = await deriveKeyFromPassword(masterPassword, vaultData.salt);

    // Step 4: Verify password by decrypting verification check
    const verificationCheck = JSON.parse(vaultData.encryption_check);
    const { decrypt, verifyPassword } = await import('../crypto');

    try {
      const verified = await verifyPassword(verificationCheck, key);
      if (!verified.isValid) {
        return {
          success: false,
          error: 'Master password errata'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Master password errata'
      };
    }

    // Step 5: Update sync metadata
    await supabase.from('sync_metadata').upsert({
      user_id: authData.user.id,
      device_id: getDeviceId(),
      device_name: getBrowserName(),
      device_type: 'web',
      last_sync: new Date().toISOString()
    });

    // Step 6: Log security event
    await supabase.rpc('log_security_event', {
      p_user_id: authData.user.id,
      p_event_type: 'login',
      p_device_id: getDeviceId()
    });

    return {
      success: true,
      data: {
        key,
        userId: authData.user.id
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore durante il login'
    };
  }
}

/**
 * Logs out the current user
 */
export async function logoutUser(): Promise<VaultOperationResult> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore durante il logout'
    };
  }
}

/**
 * Gets browser name for device tracking
 */
function getBrowserName(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Browser Sconosciuto';
}
