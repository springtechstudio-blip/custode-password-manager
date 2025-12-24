/**
 * Supabase-related type definitions
 */

import type { EncryptedData } from '../crypto/types';
import type { VaultData, VaultSettings } from '../../types';

// Re-export for convenience
export type { VaultData, VaultSettings };

/**
 * Encrypted vault as stored in Supabase
 */
export interface StoredVault {
  id: string;
  user_id: string;
  encrypted_data: EncryptedData;
  encryption_check: EncryptedData;
  salt: string;
  iv: string;
  version: number;
  last_modified: string;
  created_at: string;
}

/**
 * Sync metadata for device tracking
 */
export interface SyncMetadata {
  id: string;
  user_id: string;
  device_id: string;
  device_name?: string;
  device_type: 'web' | 'mobile' | 'desktop' | 'extension';
  last_sync: string;
  created_at: string;
}

/**
 * Security event types
 */
export type SecurityEventType =
  | 'login'
  | 'logout'
  | 'vault_access'
  | 'vault_update'
  | 'password_change'
  | 'export'
  | 'import'
  | 'device_added'
  | 'device_removed';

/**
 * Security event record
 */
export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: SecurityEventType;
  device_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

/**
 * Auth error types
 */
export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Vault operation result
 */
export interface VaultOperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
