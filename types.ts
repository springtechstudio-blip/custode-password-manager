
export enum Category {
  PASSWORDS = 'passwords',
  NOTES = 'notes',
  DEVELOPMENT = 'development',
  SECURITY = 'security',
}

export enum Environment {
  PRODUCTION = 'Production',
  STAGING = 'Staging',
  DEVELOPMENT = 'Development',
  TEST = 'Test',
}

export enum PasswordType {
  LOGIN = 'Login',
  CREDIT_CARD = 'Carta di Credito',
  BANK_ACCOUNT = 'Conto Bancario',
  ID_CARD = 'Carta d\'Identità',
  SECURE_NOTE = 'Nota Sicura',
  OTHER = 'Altro',
}

export interface PasswordEntry {
  id: string;
  name: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  type: PasswordType;
  customCategoryIds?: string[];  // IDs of custom categories this password belongs to
  isFavorite: boolean;
  lastModified: number;
  icon?: string;
}

export interface SecureNote {
  id: string;
  title: string;
  content: string;
  category: string;
  isFavorite: boolean;
  createdAt: number;
}

export interface DevKey {
  id: string;
  service: string;
  type: 'API Key' | 'Token' | 'OAuth' | 'Secret' | 'Certificate' | 'SSH Key' | 'Database';
  environment: Environment;
  key: string;
  clientId?: string;
  secret?: string;
  endpoint?: string;
  expiryDate?: number;
  notes?: string;
  isFavorite: boolean;
}

/**
 * Vault settings and preferences
 */
export interface VaultSettings {
  /** Auto-lock timeout in milliseconds (default: 15 minutes) */
  lockTimeout: number;
  /** Clipboard auto-clear timeout in milliseconds (default: 60 seconds) */
  clipboardTimeout: number;
  /** Last security check timestamp */
  lastSecurityCheck?: number;
  /** Enable biometric unlock (future feature) */
  biometricEnabled?: boolean;
}

/**
 * Custom password category
 */
export interface CustomCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

/**
 * Complete vault data structure (decrypted)
 */
export interface VaultData {
  passwords: PasswordEntry[];
  notes: SecureNote[];
  devKeys: DevKey[];
  folders: string[];
  customCategories: CustomCategory[];
  hiddenCategories: string[];  // IDs of hidden categories (both predefined and custom)
  settings: VaultSettings;
  version: number;
}

/**
 * Vault state in the application
 */
export interface VaultState {
  /** Decrypted vault data (null when locked) */
  data: VaultData | null;
  /** Whether vault is currently loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Last sync timestamp */
  lastSynced: string | null;
  /** Whether vault is locked */
  isLocked: boolean;
}

/**
 * Auth state in the application
 */
export interface AuthState {
  /** Current user ID (from Supabase Auth) */
  userId: string | null;
  /** User email */
  email: string | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth is loading */
  isLoading: boolean;
  /** Encryption key (stored in memory only) */
  encryptionKey: CryptoKey | null;
  /** User's salt for key derivation */
  salt: string | null;
  /** Session token */
  session: any | null;
}

/**
 * Create empty vault helper
 */
export function createEmptyVault(): VaultData {
  return {
    passwords: [],
    notes: [],
    devKeys: [],
    folders: ['Personale', 'Lavoro', 'Finanza'],
    customCategories: [],
    hiddenCategories: [],
    settings: {
      lockTimeout: 900000,  // 15 minutes
      clipboardTimeout: 60000  // 60 seconds
    },
    version: 1
  };
}
