/**
 * Password Strength Validator
 * Valuta la forza di una password secondo criteri di sicurezza
 */

export interface PasswordStrengthResult {
  isStrong: boolean;
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
}

const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey',
  '1234567', 'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou',
  'master', 'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow',
  '123123', '654321', 'superman', 'qazwsx', 'michael', 'football'
];

const COMMON_PATTERNS = [
  /^(.)\1+$/, // Tutti caratteri uguali: aaaa, 1111
  /^(01|12|23|34|45|56|67|78|89|90)+$/, // Sequenze numeriche
  /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+$/i, // Sequenze alfabetiche
  /^(qwer|wert|erty|rtyu|tyui|yuio|uiop|asdf|sdfg|dfgh|fghj|ghjk|hjkl|zxcv|xcvb|cvbn|vbnm)+$/i // Pattern tastiera
];

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check lunghezza minima
  if (password.length < 8) {
    issues.push('Password troppo corta');
    suggestions.push('Usa almeno 12 caratteri');
    score -= 30;
  } else if (password.length < 12) {
    issues.push('Password potrebbe essere più lunga');
    suggestions.push('Usa almeno 12 caratteri per maggiore sicurezza');
    score -= 15;
  }

  // Check caratteri uppercase
  if (!/[A-Z]/.test(password)) {
    issues.push('Mancano lettere maiuscole');
    suggestions.push('Aggiungi almeno una lettera maiuscola');
    score -= 15;
  }

  // Check caratteri lowercase
  if (!/[a-z]/.test(password)) {
    issues.push('Mancano lettere minuscole');
    suggestions.push('Aggiungi almeno una lettera minuscola');
    score -= 15;
  }

  // Check numeri
  if (!/[0-9]/.test(password)) {
    issues.push('Mancano numeri');
    suggestions.push('Aggiungi almeno un numero');
    score -= 15;
  }

  // Check caratteri speciali
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    issues.push('Mancano caratteri speciali');
    suggestions.push('Aggiungi simboli come !@#$%^&*');
    score -= 10;
  }

  // Check password comuni
  const lowerPassword = password.toLowerCase();
  if (COMMON_PASSWORDS.includes(lowerPassword)) {
    issues.push('Password troppo comune');
    suggestions.push('Evita password comunemente usate');
    score = Math.min(score, 20); // Max 20 se è password comune
  }

  // Check pattern comuni
  for (const pattern of COMMON_PATTERNS) {
    if (pattern.test(lowerPassword)) {
      issues.push('Contiene pattern prevedibile');
      suggestions.push('Evita sequenze e pattern ripetitivi');
      score -= 20;
      break;
    }
  }

  // Check ripetizioni
  if (/(.)\1{2,}/.test(password)) {
    issues.push('Caratteri ripetuti consecutivamente');
    suggestions.push('Evita caratteri ripetuti (es. aaa, 111)');
    score -= 10;
  }

  // Bonus per lunghezza extra
  if (password.length >= 16) {
    score += 10;
  }
  if (password.length >= 20) {
    score += 10;
  }

  // Normalizza score
  score = Math.max(0, Math.min(100, score));

  return {
    isStrong: score >= 70 && issues.length === 0,
    score,
    issues,
    suggestions
  };
}

/**
 * Check se password è debole (per security dashboard)
 */
export function isWeakPassword(password: string): boolean {
  const result = validatePasswordStrength(password);
  return result.score < 70 || result.issues.length > 0;
}

/**
 * Genera un hash veloce della password per confronto (non crypto-safe)
 * Usato per rilevare password duplicate
 */
export function hashPasswordForComparison(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Converti score numerico in label leggibile
 */
export function getPasswordStrengthLabel(score: number): string {
  if (score >= 90) return 'Eccellente';
  if (score >= 70) return 'Forte';
  if (score >= 50) return 'Media';
  if (score >= 30) return 'Debole';
  return 'Molto Debole';
}

/**
 * Colore associato allo score
 */
export function getPasswordStrengthColor(score: number): string {
  if (score >= 90) return '#10B981'; // green
  if (score >= 70) return '#3B82F6'; // blue
  if (score >= 50) return '#F59E0B'; // orange
  if (score >= 30) return '#EF4444'; // red
  return '#991B1B'; // dark red
}
