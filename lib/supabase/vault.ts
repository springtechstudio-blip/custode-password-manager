/**
 * Vault Operations Module
 * Handles CRUD operations for encrypted vault data
 * All data is encrypted client-side before sending to Supabase
 */

import { supabase } from './client';
import { encrypt, decrypt } from '../crypto';
import type { VaultData, VaultOperationResult, StoredVault } from './types';

/**
 * Fetches and decrypts the vault for the current user
 *
 * @param key - CryptoKey for decryption (from login)
 * @param userId - User ID (from auth)
 * @returns Promise resolving to decrypted VaultData
 *
 * @example
 * ```typescript
 * const vault = await fetchVault(encryptionKey, userId);
 * console.log('Passwords:', vault.passwords.length);
 * ```
 */
export async function fetchVault(
  key: CryptoKey,
  userId: string
): Promise<VaultOperationResult<VaultData>> {
  try {
    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return {
        success: false,
        error: 'Vault non trovato'
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Nessun dato nel vault'
      };
    }

    // Decrypt vault data
    const encryptedData = {
      ciphertext: data.encrypted_data.ciphertext,
      iv: data.encrypted_data.iv
    };

    const decryptedVault = await decrypt<VaultData>(encryptedData, key);

    return {
      success: true,
      data: decryptedVault
    };
  } catch (error) {
    console.error('Fetch vault error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore durante il recupero del vault'
    };
  }
}

/**
 * Saves encrypted vault to Supabase
 * Encrypts data client-side before uploading
 *
 * @param vaultData - Decrypted vault data to save
 * @param key - CryptoKey for encryption
 * @param userId - User ID
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * const updatedVault = { ...vault, passwords: [...vault.passwords, newPassword] };
 * await saveVault(updatedVault, encryptionKey, userId);
 * ```
 */
export async function saveVault(
  vaultData: VaultData,
  key: CryptoKey,
  userId: string
): Promise<VaultOperationResult> {
  try {
    // Encrypt vault
    const encrypted = await encrypt(vaultData, key);

    // Update in database
    const { error } = await supabase
      .from('vaults')
      .update({
        encrypted_data: {
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv
        },
        last_modified: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      return {
        success: false,
        error: 'Errore durante il salvataggio del vault'
      };
    }

    // Log security event
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: 'vault_update',
      p_device_id: getDeviceId()
    });

    return { success: true };
  } catch (error) {
    console.error('Save vault error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore durante il salvataggio'
    };
  }
}

/**
 * Updates a specific field in the vault
 * Convenience method for partial updates
 *
 * @param updates - Partial vault data to update
 * @param currentVault - Current vault data
 * @param key - CryptoKey for encryption
 * @param userId - User ID
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * await updateVault(
 *   { passwords: [...vault.passwords, newPassword] },
 *   vault,
 *   key,
 *   userId
 * );
 * ```
 */
export async function updateVault(
  updates: Partial<VaultData>,
  currentVault: VaultData,
  key: CryptoKey,
  userId: string
): Promise<VaultOperationResult> {
  const updatedVault: VaultData = {
    ...currentVault,
    ...updates
  };

  return saveVault(updatedVault, key, userId);
}

/**
 * Deletes the entire vault for a user
 * WARNING: This is irreversible!
 *
 * @param userId - User ID
 * @returns Promise resolving to operation result
 */
export async function deleteVault(userId: string): Promise<VaultOperationResult> {
  try {
    const { error } = await supabase
      .from('vaults')
      .delete()
      .eq('user_id', userId);

    if (error) {
      return {
        success: false,
        error: 'Errore durante l\'eliminazione del vault'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete vault error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore durante l\'eliminazione'
    };
  }
}

/**
 * Gets vault metadata without decrypting
 * Useful for checking sync status, last modified, etc.
 *
 * @param userId - User ID
 * @returns Promise resolving to vault metadata
 */
export async function getVaultMetadata(userId: string): Promise<VaultOperationResult<{
  lastModified: string;
  version: number;
  createdAt: string;
}>> {
  try {
    const { data, error } = await supabase
      .from('vaults')
      .select('last_modified, version, created_at')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: 'Metadata non trovati'
      };
    }

    return {
      success: true,
      data: {
        lastModified: data.last_modified,
        version: data.version,
        createdAt: data.created_at
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore recupero metadata'
    };
  }
}

/**
 * Subscribes to vault changes (for realtime sync across devices)
 *
 * @param userId - User ID
 * @param callback - Function to call when vault is updated
 * @returns Unsubscribe function
 *
 * @example
 * ```typescript
 * const unsubscribe = subscribeToVaultChanges(userId, async (payload) => {
 *   const updated = await decrypt(payload.new.encrypted_data, key);
 *   setVault(updated);
 * });
 *
 * // Later: unsubscribe();
 * ```
 */
export function subscribeToVaultChanges(
  userId: string,
  callback: (payload: any) => void
): () => void {
  const channel = supabase
    .channel(`vault-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'vaults',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}

/**
 * Checks if vault needs sync (compares local and remote timestamps)
 *
 * @param localTimestamp - Local vault last modified timestamp
 * @param userId - User ID
 * @returns Promise resolving to whether sync is needed
 */
export async function needsSync(
  localTimestamp: string,
  userId: string
): Promise<boolean> {
  const metadata = await getVaultMetadata(userId);
  if (!metadata.success || !metadata.data) {
    return false;
  }

  const remoteTimestamp = new Date(metadata.data.lastModified).getTime();
  const localTime = new Date(localTimestamp).getTime();

  return remoteTimestamp > localTime;
}

/**
 * Helper to get device ID
 */
function getDeviceId(): string {
  let deviceId = localStorage.getItem('custode-device-id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('custode-device-id', deviceId);
  }
  return deviceId;
}
