/**
 * Supabase Client Configuration
 * Initializes the Supabase client with environment variables
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Please create a .env.local file with:');
  console.error('VITE_SUPABASE_URL=your-project-url');
  console.error('VITE_SUPABASE_ANON_KEY=your-anon-key');
}

// Check if we're using placeholder values
if (supabaseUrl?.includes('your-project-id') || supabaseAnonKey?.includes('your-anon-key')) {
  console.warn('⚠️  Using placeholder Supabase credentials!');
  console.warn('Please update .env.local with your actual Supabase project credentials.');
  console.warn('Get them from: https://app.supabase.com/project/_/settings/api');
}

/**
 * Supabase client instance
 * Used throughout the app for all database and auth operations
 */
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    // Auto-refresh tokens
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session from URL (for email confirmations, etc.)
    detectSessionInUrl: true,
    // Storage key for session
    storageKey: 'custode-auth',
  },
  // Real-time configuration
  realtime: {
    params: {
      eventsPerSecond: 10,  // Rate limit for realtime events
    },
  },
});

/**
 * Check if Supabase is properly configured
 * @returns true if configured with real credentials
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
}

/**
 * Get current Supabase session
 * @returns Promise resolving to session or null
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
}

/**
 * Get current user
 * @returns Promise resolving to user or null
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}
