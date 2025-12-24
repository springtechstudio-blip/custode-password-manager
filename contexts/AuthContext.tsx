/**
 * Authentication Context
 * Manages global auth state and encryption key (in memory only)
 * Provides auth operations to all components
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, registerUser, loginUser, logoutUser } from '../lib/supabase';
import { deriveKeyFromPassword } from '../lib/crypto';
import type { AuthState } from '../types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  // Auth operations
  register: (email: string, masterPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, masterPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  lock: () => void;
  unlock: (masterPassword: string) => Promise<{ success: boolean; error?: string }>;

  // Session management
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    userId: null,
    email: null,
    isAuthenticated: false,
    isLoading: true,
    encryptionKey: null,
    session: null
  });

  // Check for existing session on mount
  useEffect(() => {
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' && session) {
          setAuthState(prev => ({
            ...prev,
            userId: session.user.id,
            email: session.user.email || null,
            isAuthenticated: true,
            session: session
          }));
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            userId: null,
            email: null,
            isAuthenticated: false,
            isLoading: false,
            encryptionKey: null,
            session: null
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check for existing session
  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Try to restore encryption key from sessionStorage
        const storedKeyData = sessionStorage.getItem('encryptionKey');
        let encryptionKey: CryptoKey | null = null;

        if (storedKeyData) {
          try {
            const keyData = JSON.parse(storedKeyData);
            encryptionKey = await crypto.subtle.importKey(
              'jwk',
              keyData,
              { name: 'AES-GCM', length: 256 },
              true,
              ['encrypt', 'decrypt']
            );
            console.log('Restored encryption key from sessionStorage');
          } catch (error) {
            console.error('Failed to restore encryption key:', error);
            sessionStorage.removeItem('encryptionKey');
          }
        }

        setAuthState(prev => ({
          ...prev,
          userId: session.user.id,
          email: session.user.email || null,
          isAuthenticated: true,
          session: session,
          encryptionKey: encryptionKey,
          isLoading: false
        }));
      } else {
        sessionStorage.removeItem('encryptionKey');
        setAuthState(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }

  // Register new user
  async function register(
    email: string,
    masterPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    const result = await registerUser(email, masterPassword, confirmPassword);
    console.log('Registration result:', result);

    if (result.success && result.data) {
      // After registration, login to get the encryption key
      const loginResult = await loginUser(email, masterPassword);

      if (loginResult.success && loginResult.data) {
        console.log('Setting auth state after registration');

        // Save encryption key to sessionStorage
        try {
          const keyData = await crypto.subtle.exportKey('jwk', loginResult.data!.key);
          sessionStorage.setItem('encryptionKey', JSON.stringify(keyData));
        } catch (error) {
          console.error('Failed to save encryption key:', error);
        }

        setAuthState(prev => ({
          ...prev,
          userId: loginResult.data!.userId,
          email: email,
          isAuthenticated: true,
          encryptionKey: loginResult.data!.key,
          isLoading: false
        }));

        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: loginResult.error };
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: result.error };
    }
  }

  // Login existing user
  async function login(
    email: string,
    masterPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    const result = await loginUser(email, masterPassword);

    if (result.success && result.data) {
      // Save encryption key to sessionStorage
      try {
        const keyData = await crypto.subtle.exportKey('jwk', result.data!.key);
        sessionStorage.setItem('encryptionKey', JSON.stringify(keyData));
      } catch (error) {
        console.error('Failed to save encryption key:', error);
      }

      setAuthState(prev => ({
        ...prev,
        userId: result.data!.userId,
        email: email,
        isAuthenticated: true,
        encryptionKey: result.data!.key,
        isLoading: false
      }));

      return { success: true };
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: result.error };
    }
  }

  // Logout user
  async function logout() {
    await logoutUser();

    // Clear encryption key from sessionStorage
    sessionStorage.removeItem('encryptionKey');

    // Clear encryption key from memory
    setAuthState({
      userId: null,
      email: null,
      isAuthenticated: false,
      isLoading: false,
      encryptionKey: null,
      session: null
    });
  }

  // Lock vault (clear encryption key but keep session)
  function lock() {
    // Clear encryption key from sessionStorage
    sessionStorage.removeItem('encryptionKey');

    setAuthState(prev => ({
      ...prev,
      encryptionKey: null  // Clear key from memory
    }));
  }

  // Unlock vault (re-derive encryption key)
  async function unlock(
    masterPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!authState.email) {
      return { success: false, error: 'Email non trovata' };
    }

    try {
      // Re-login to get encryption key
      const result = await loginUser(authState.email, masterPassword);

      if (result.success && result.data) {
        // Save encryption key to sessionStorage
        try {
          const keyData = await crypto.subtle.exportKey('jwk', result.data!.key);
          sessionStorage.setItem('encryptionKey', JSON.stringify(keyData));
        } catch (error) {
          console.error('Failed to save encryption key:', error);
        }

        setAuthState(prev => ({
          ...prev,
          encryptionKey: result.data!.key
        }));

        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante unlock'
      };
    }
  }

  // Refresh session
  async function refreshSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setAuthState(prev => ({
        ...prev,
        session: session
      }));
    }
  }

  const value: AuthContextType = {
    ...authState,
    register,
    login,
    logout,
    lock,
    unlock,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
