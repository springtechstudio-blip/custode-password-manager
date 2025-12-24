/**
 * Supabase Module - Main exports
 * Provides database operations and authentication for Custode
 */

// Client and configuration
export { supabase, isSupabaseConfigured, getSession, getCurrentUser } from './client';

// Authentication
export { registerUser, loginUser, logoutUser } from './auth';

// Vault operations
export {
  fetchVault,
  saveVault,
  updateVault,
  deleteVault,
  getVaultMetadata,
  subscribeToVaultChanges,
  needsSync
} from './vault';

// Types
export type {
  VaultData,
  VaultSettings,
  StoredVault,
  SyncMetadata,
  SecurityEvent,
  SecurityEventType,
  VaultOperationResult
} from './types';
