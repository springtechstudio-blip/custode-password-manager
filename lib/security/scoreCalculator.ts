/**
 * Security Score Calculator
 * Analizza il vault e calcola un punteggio di sicurezza complessivo
 */

import { PasswordEntry, DevKey, SecureNote } from '../../types';
import { isWeakPassword, hashPasswordForComparison } from './passwordStrength';

export interface SecurityAnalysis {
  score: number; // 0-100
  weakPasswords: PasswordEntry[];
  reusedPasswords: Map<string, PasswordEntry[]>; // hash -> array di password
  oldPasswords: PasswordEntry[]; // > 90 giorni
  expiringDevKeys: DevKey[]; // In scadenza entro 30 giorni
  totalIssues: number;
  breakdown: {
    weakCount: number;
    reusedCount: number;
    oldCount: number;
    expiringKeysCount: number;
  };
}

const DAYS_TO_MS = 24 * 60 * 60 * 1000;
const OLD_PASSWORD_THRESHOLD_DAYS = 90;
const EXPIRING_KEY_THRESHOLD_DAYS = 30;

/**
 * Analizza il vault e calcola security score
 */
export function analyzeVaultSecurity(
  passwords: PasswordEntry[],
  devKeys: DevKey[],
  notes: SecureNote[]
): SecurityAnalysis {
  const now = Date.now();

  // 1. Trova password deboli
  const weakPasswords = passwords.filter(p => isWeakPassword(p.password));

  // 2. Trova password riutilizzate
  const passwordHashMap = new Map<string, PasswordEntry[]>();
  passwords.forEach(p => {
    const hash = hashPasswordForComparison(p.password);
    if (!passwordHashMap.has(hash)) {
      passwordHashMap.set(hash, []);
    }
    passwordHashMap.get(hash)!.push(p);
  });

  // Filtra solo password usate più di una volta
  const reusedPasswords = new Map<string, PasswordEntry[]>();
  passwordHashMap.forEach((entries, hash) => {
    if (entries.length > 1) {
      reusedPasswords.set(hash, entries);
    }
  });

  // 3. Trova password vecchie (> 90 giorni)
  const oldPasswordThreshold = now - (OLD_PASSWORD_THRESHOLD_DAYS * DAYS_TO_MS);
  const oldPasswords = passwords.filter(p => p.lastModified < oldPasswordThreshold);

  // 4. Trova dev keys in scadenza (entro 30 giorni)
  const expiringThreshold = now + (EXPIRING_KEY_THRESHOLD_DAYS * DAYS_TO_MS);
  const expiringDevKeys = devKeys.filter(k => {
    if (!k.expiryDate) return false;
    const expiryTime = new Date(k.expiryDate).getTime();
    return expiryTime <= expiringThreshold && expiryTime > now;
  });

  // Calcolo punteggio
  let score = 100;

  // Penalità per password deboli (-10 punti ciascuna, max -40)
  const weakPenalty = Math.min(weakPasswords.length * 10, 40);
  score -= weakPenalty;

  // Penalità per password riutilizzate (-15 punti per gruppo, max -30)
  const reusedPenalty = Math.min(reusedPasswords.size * 15, 30);
  score -= reusedPenalty;

  // Penalità per password vecchie (-5 punti ciascuna, max -20)
  const oldPenalty = Math.min(oldPasswords.length * 5, 20);
  score -= oldPenalty;

  // Penalità per chiavi in scadenza (-3 punti ciascuna, max -10)
  const expiringPenalty = Math.min(expiringDevKeys.length * 3, 10);
  score -= expiringPenalty;

  // Normalizza score (0-100)
  score = Math.max(0, Math.min(100, score));

  const totalIssues =
    weakPasswords.length +
    reusedPasswords.size +
    oldPasswords.length +
    expiringDevKeys.length;

  return {
    score,
    weakPasswords,
    reusedPasswords,
    oldPasswords,
    expiringDevKeys,
    totalIssues,
    breakdown: {
      weakCount: weakPasswords.length,
      reusedCount: reusedPasswords.size,
      oldCount: oldPasswords.length,
      expiringKeysCount: expiringDevKeys.length
    }
  };
}

/**
 * Genera notifiche di sicurezza basate sull'analisi
 */
export function generateSecurityNotifications(analysis: SecurityAnalysis): Array<{
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  actionType?: 'password' | 'devkey';
  relatedIds?: string[];
}> {
  const notifications = [];
  const now = Date.now();

  // Notifica per password deboli
  if (analysis.weakPasswords.length > 0) {
    notifications.push({
      id: `weak-${now}`,
      type: 'warning' as const,
      title: 'Password Deboli Rilevate',
      message: `${analysis.weakPasswords.length} password non rispettano i criteri di sicurezza`,
      timestamp: now,
      actionType: 'password' as const,
      relatedIds: analysis.weakPasswords.map(p => p.id)
    });
  }

  // Notifica per password riutilizzate
  if (analysis.reusedPasswords.size > 0) {
    const totalReused = Array.from(analysis.reusedPasswords.values())
      .reduce((sum, arr) => sum + arr.length, 0);
    notifications.push({
      id: `reused-${now}`,
      type: 'warning' as const,
      title: 'Password Riutilizzate',
      message: `${totalReused} password sono usate per servizi multipli`,
      timestamp: now,
      actionType: 'password' as const,
      relatedIds: Array.from(analysis.reusedPasswords.values()).flat().map(p => p.id)
    });
  }

  // Notifica per password vecchie
  if (analysis.oldPasswords.length > 0) {
    notifications.push({
      id: `old-${now}`,
      type: 'info' as const,
      title: 'Password Non Aggiornate',
      message: `${analysis.oldPasswords.length} password non vengono modificate da oltre 90 giorni`,
      timestamp: now,
      actionType: 'password' as const,
      relatedIds: analysis.oldPasswords.map(p => p.id)
    });
  }

  // Notifica per chiavi in scadenza
  if (analysis.expiringDevKeys.length > 0) {
    notifications.push({
      id: `expiring-${now}`,
      type: 'warning' as const,
      title: 'Chiavi API in Scadenza',
      message: `${analysis.expiringDevKeys.length} chiavi scadranno entro 30 giorni`,
      timestamp: now,
      actionType: 'devkey' as const,
      relatedIds: analysis.expiringDevKeys.map(k => k.id)
    });
  }

  return notifications;
}

/**
 * Ottieni label descrittiva per lo score
 */
export function getSecurityScoreLabel(score: number): string {
  if (score >= 90) return 'Eccellente';
  if (score >= 75) return 'Buono';
  if (score >= 60) return 'Discreto';
  if (score >= 40) return 'Sufficiente';
  if (score >= 20) return 'Scarso';
  return 'Critico';
}

/**
 * Colore associato allo score
 */
export function getSecurityScoreColor(score: number): string {
  if (score >= 90) return '#10B981'; // green
  if (score >= 75) return '#3B82F6'; // blue
  if (score >= 60) return '#F59E0B'; // amber
  if (score >= 40) return '#F97316'; // orange
  return '#EF4444'; // red
}
