/**
 * Vault Context
 * Manages global vault state with encrypted operations
 * Automatically encrypts before save, decrypts after fetch
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { fetchVault, saveVault, subscribeToVaultChanges } from '../lib/supabase';
import { useAuthContext } from './AuthContext';
import type { VaultData, VaultState, PasswordEntry, SecureNote, DevKey } from '../types';
import { createEmptyVault, PasswordType } from '../types';

interface VaultContextType extends VaultState {
  // Vault operations
  loadVault: () => Promise<void>;
  saveCurrentVault: () => Promise<void>;

  // Password operations
  addPassword: (password: Omit<PasswordEntry, 'id' | 'lastModified' | 'isFavorite'>) => Promise<void>;
  updatePassword: (id: string, updates: Partial<PasswordEntry>) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;

  // Note operations
  addNote: (note: Omit<SecureNote, 'id' | 'createdAt' | 'isFavorite'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<SecureNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Dev key operations
  addDevKey: (devKey: Omit<DevKey, 'id' | 'isFavorite'>) => Promise<void>;
  updateDevKey: (id: string, updates: Partial<DevKey>) => Promise<void>;
  deleteDevKey: (id: string) => Promise<void>;

  // Folder operations
  addFolder: (folderName: string) => Promise<void>;
  deleteFolder: (folderName: string) => Promise<void>;

  // Custom category operations
  addCustomCategory: (name: string) => Promise<void>;
  deleteCustomCategory: (id: string) => Promise<void>;
  toggleHiddenCategory: (categoryId: string) => Promise<void>;

  // Utility
  refreshVault: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const { userId, encryptionKey, isAuthenticated } = useAuthContext();

  const [vaultState, setVaultState] = useState<VaultState>({
    data: null,
    isLoading: false,
    error: null,
    lastSynced: null,
    isLocked: true
  });

  // Load vault from Supabase
  const loadVault = useCallback(async () => {
    console.log('loadVault called:', { hasUserId: !!userId, hasKey: !!encryptionKey });

    if (!userId || !encryptionKey) {
      setVaultState(prev => ({ ...prev, error: 'Not authenticated' }));
      return;
    }

    console.log('Loading vault for user:', userId);
    setVaultState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetchVault(encryptionKey, userId);
      console.log('Vault fetch result:', { success: result.success, hasData: !!result.data, error: result.error });

      if (result.success && result.data) {
        console.log('Vault loaded successfully:', {
          passwordCount: result.data.passwords.length,
          notesCount: result.data.notes.length,
          devKeysCount: result.data.devKeys.length
        });

        // Migration: ensure all passwords have a type field and customCategories/hiddenCategories exist
        const migratedData = {
          ...result.data,
          passwords: result.data.passwords.map(pwd => ({
            ...pwd,
            type: pwd.type || PasswordType.LOGIN
          })),
          customCategories: result.data.customCategories || [],
          hiddenCategories: result.data.hiddenCategories || []
        };

        setVaultState({
          data: migratedData,
          isLoading: false,
          error: null,
          lastSynced: new Date().toISOString(),
          isLocked: false
        });
      } else {
        setVaultState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Failed to load vault'
        }));
      }
    } catch (error) {
      console.error('Load vault error:', error);
      setVaultState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [userId, encryptionKey]);

  // Load vault when user logs in and has encryption key
  useEffect(() => {
    if (isAuthenticated && encryptionKey && userId) {
      loadVault();
    } else {
      // Clear vault when logged out or locked
      setVaultState(prev => ({
        ...prev,
        data: null,
        isLocked: !encryptionKey
      }));
    }
  }, [isAuthenticated, encryptionKey, userId, loadVault]);

  // Subscribe to vault changes (realtime sync)
  useEffect(() => {
    if (!userId || !encryptionKey) return;

    const unsubscribe = subscribeToVaultChanges(userId, async (payload) => {
      console.log('Vault updated from another device:', payload);
      // Reload vault when changed remotely
      await loadVault();
    });

    return () => {
      unsubscribe();
    };
  }, [userId, encryptionKey, loadVault]);

  // Save current vault to Supabase
  async function saveCurrentVault() {
    if (!userId || !encryptionKey || !vaultState.data) {
      console.error('Cannot save: missing auth or data');
      return;
    }

    try {
      const result = await saveVault(vaultState.data, encryptionKey, userId);

      if (result.success) {
        setVaultState(prev => ({
          ...prev,
          lastSynced: new Date().toISOString(),
          error: null
        }));
      } else {
        setVaultState(prev => ({
          ...prev,
          error: result.error || 'Failed to save vault'
        }));
      }
    } catch (error) {
      console.error('Save vault error:', error);
      setVaultState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }

  // === PASSWORD OPERATIONS ===

  async function addPassword(
    password: Omit<PasswordEntry, 'id' | 'lastModified' | 'isFavorite'>
  ) {
    if (!vaultState.data) return;

    const newPassword: PasswordEntry = {
      ...password,
      id: crypto.randomUUID(),
      lastModified: Date.now(),
      isFavorite: false,
      icon: password.url ? `https://www.google.com/s2/favicons?domain=${password.url}&sz=128` : undefined
    };

    const updatedVault: VaultData = {
      ...vaultState.data,
      passwords: [newPassword, ...vaultState.data.passwords]
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  async function updatePassword(id: string, updates: Partial<PasswordEntry>) {
    if (!vaultState.data) return;

    const updatedPasswords = vaultState.data.passwords.map(p =>
      p.id === id
        ? { ...p, ...updates, lastModified: Date.now() }
        : p
    );

    const updatedVault: VaultData = {
      ...vaultState.data,
      passwords: updatedPasswords
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  async function deletePassword(id: string) {
    if (!vaultState.data) return;

    const updatedPasswords = vaultState.data.passwords.filter(p => p.id !== id);

    const updatedVault: VaultData = {
      ...vaultState.data,
      passwords: updatedPasswords
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  // === NOTE OPERATIONS ===

  async function addNote(note: Omit<SecureNote, 'id' | 'createdAt' | 'isFavorite'>) {
    if (!vaultState.data) return;

    const newNote: SecureNote = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      isFavorite: false
    };

    const updatedVault: VaultData = {
      ...vaultState.data,
      notes: [newNote, ...vaultState.data.notes]
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  async function updateNote(id: string, updates: Partial<SecureNote>) {
    if (!vaultState.data) return;

    const updatedNotes = vaultState.data.notes.map(n =>
      n.id === id ? { ...n, ...updates } : n
    );

    const updatedVault: VaultData = {
      ...vaultState.data,
      notes: updatedNotes
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  async function deleteNote(id: string) {
    if (!vaultState.data) return;

    const updatedNotes = vaultState.data.notes.filter(n => n.id !== id);

    const updatedVault: VaultData = {
      ...vaultState.data,
      notes: updatedNotes
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  // === DEV KEY OPERATIONS ===

  async function addDevKey(devKey: Omit<DevKey, 'id' | 'isFavorite'>) {
    if (!vaultState.data) return;

    const newDevKey: DevKey = {
      ...devKey,
      id: crypto.randomUUID(),
      isFavorite: false
    };

    const updatedVault: VaultData = {
      ...vaultState.data,
      devKeys: [newDevKey, ...vaultState.data.devKeys]
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  async function updateDevKey(id: string, updates: Partial<DevKey>) {
    if (!vaultState.data) return;

    const updatedDevKeys = vaultState.data.devKeys.map(k =>
      k.id === id ? { ...k, ...updates } : k
    );

    const updatedVault: VaultData = {
      ...vaultState.data,
      devKeys: updatedDevKeys
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  async function deleteDevKey(id: string) {
    if (!vaultState.data) return;

    const updatedDevKeys = vaultState.data.devKeys.filter(k => k.id !== id);

    const updatedVault: VaultData = {
      ...vaultState.data,
      devKeys: updatedDevKeys
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  // === FOLDER OPERATIONS ===

  async function addFolder(folderName: string) {
    if (!vaultState.data) return;

    if (vaultState.data.folders.includes(folderName)) {
      setVaultState(prev => ({ ...prev, error: 'Folder già esistente' }));
      return;
    }

    const updatedVault: VaultData = {
      ...vaultState.data,
      folders: [...vaultState.data.folders, folderName]
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  async function deleteFolder(folderName: string) {
    if (!vaultState.data) return;

    const updatedVault: VaultData = {
      ...vaultState.data,
      folders: vaultState.data.folders.filter(f => f !== folderName)
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  // === CUSTOM CATEGORY OPERATIONS ===

  async function addCustomCategory(name: string) {
    if (!vaultState.data) return;

    // Check if category already exists
    if (vaultState.data.customCategories?.some(c => c.name === name)) {
      setVaultState(prev => ({ ...prev, error: 'Categoria già esistente' }));
      return;
    }

    const newCategory = {
      id: crypto.randomUUID(),
      name
    };

    const updatedVault: VaultData = {
      ...vaultState.data,
      customCategories: [...(vaultState.data.customCategories || []), newCategory]
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  async function deleteCustomCategory(id: string) {
    if (!vaultState.data) return;

    const updatedVault: VaultData = {
      ...vaultState.data,
      customCategories: (vaultState.data.customCategories || []).filter(c => c.id !== id),
      // Also remove from hidden categories if it was hidden
      hiddenCategories: (vaultState.data.hiddenCategories || []).filter(c => c !== id)
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  async function toggleHiddenCategory(categoryId: string) {
    if (!vaultState.data) return;

    const hiddenCategories = vaultState.data.hiddenCategories || [];
    const isHidden = hiddenCategories.includes(categoryId);

    const updatedVault: VaultData = {
      ...vaultState.data,
      hiddenCategories: isHidden
        ? hiddenCategories.filter(c => c !== categoryId)
        : [...hiddenCategories, categoryId]
    };

    setVaultState(prev => ({ ...prev, data: updatedVault }));
    await saveCurrentVault();
  }

  // Refresh vault (reload from server)
  async function refreshVault() {
    await loadVault();
  }

  const value: VaultContextType = {
    ...vaultState,
    loadVault,
    saveCurrentVault,
    addPassword,
    updatePassword,
    deletePassword,
    addNote,
    updateNote,
    deleteNote,
    addDevKey,
    updateDevKey,
    deleteDevKey,
    addFolder,
    deleteFolder,
    addCustomCategory,
    deleteCustomCategory,
    toggleHiddenCategory,
    refreshVault
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
}

// Custom hook to use vault context
export function useVaultContext() {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVaultContext must be used within VaultProvider');
  }
  return context;
}
