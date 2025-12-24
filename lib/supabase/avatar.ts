/**
 * Avatar Management
 * Handles avatar style and seed preferences in Supabase user metadata
 */

import { supabase } from './client';

export interface AvatarPreferences {
  style: string;
  seed: string;
}

/**
 * Save avatar preferences to user metadata
 */
export async function saveAvatarPreferences(
  style: string,
  seed: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        avatar_style: style,
        avatar_seed: seed
      }
    });

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
      error: error instanceof Error ? error.message : 'Errore durante il salvataggio'
    };
  }
}

/**
 * Get avatar preferences from user metadata
 */
export async function getAvatarPreferences(): Promise<{
  success: boolean;
  data?: AvatarPreferences;
  error?: string;
}> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        success: false,
        error: error?.message || 'User not found'
      };
    }

    // Get from user metadata, or use defaults
    const style = user.user_metadata?.avatar_style || 'avataaars';
    const seed = user.user_metadata?.avatar_seed || hashEmail(user.email || '');

    return {
      success: true,
      data: { style, seed }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore durante il caricamento'
    };
  }
}

/**
 * Generate avatar URL from preferences
 */
export function getAvatarUrl(style: string, seed: string): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}

/**
 * Hash email to generate consistent seed
 */
function hashEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
