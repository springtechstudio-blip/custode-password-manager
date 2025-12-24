/**
 * Notification Manager
 * Gestisce le notifiche di sicurezza nell'app
 */

export type NotificationType = 'critical' | 'warning' | 'info';
export type NotificationActionType = 'password' | 'devkey' | 'note' | 'security';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  actionType?: NotificationActionType;
  relatedIds?: string[]; // IDs di password, devkeys, etc. correlati
  actionUrl?: string;
}

class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  /**
   * Aggiungi una notifica
   */
  add(notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      isRead: false
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
  }

  /**
   * Marca notifica come letta
   */
  markAsRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.notifyListeners();
    }
  }

  /**
   * Marca tutte come lette
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.notifyListeners();
  }

  /**
   * Elimina notifica
   */
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Elimina tutte le notifiche
   */
  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Ottieni tutte le notifiche
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Ottieni solo notifiche non lette
   */
  getUnread(): Notification[] {
    return this.notifications.filter(n => !n.isRead);
  }

  /**
   * Conta notifiche non lette
   */
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  /**
   * Ottieni notifiche per tipo
   */
  getByType(type: NotificationType): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  /**
   * Registra listener per cambiamenti
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    // Ritorna funzione per unsubscribe
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifica tutti i listener
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener([...this.notifications]);
    });
  }

  /**
   * Carica notifiche da localStorage (persistenza)
   */
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('custode_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
  }

  /**
   * Salva notifiche su localStorage
   */
  saveToStorage(): void {
    try {
      localStorage.setItem('custode_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }
}

// Singleton instance
export const notificationManager = new NotificationManager();

// Helper per creare notifiche comuni
export const NotificationHelpers = {
  weakPassword: (count: number, ids: string[]) => ({
    type: 'warning' as const,
    title: 'Password Deboli Rilevate',
    message: `${count} password non rispettano i criteri di sicurezza. Aggiornale per proteggere meglio i tuoi account.`,
    actionType: 'password' as const,
    relatedIds: ids
  }),

  reusedPassword: (count: number, ids: string[]) => ({
    type: 'warning' as const,
    title: 'Password Riutilizzate',
    message: `${count} password sono usate per più servizi. Se una viene compromessa, tutti gli account sono a rischio.`,
    actionType: 'password' as const,
    relatedIds: ids
  }),

  oldPassword: (count: number, ids: string[]) => ({
    type: 'info' as const,
    title: 'Password Non Aggiornate',
    message: `${count} password non vengono modificate da oltre 90 giorni. Considera di aggiornarle periodicamente.`,
    actionType: 'password' as const,
    relatedIds: ids
  }),

  expiringKey: (count: number, ids: string[]) => ({
    type: 'warning' as const,
    title: 'Chiavi API in Scadenza',
    message: `${count} chiavi API scadranno entro 30 giorni. Rigenerale per evitare interruzioni del servizio.`,
    actionType: 'devkey' as const,
    relatedIds: ids
  }),

  compromisedPassword: (count: number, ids: string[]) => ({
    type: 'critical' as const,
    title: '🚨 Password Compromesse',
    message: `${count} password sono apparse in data breach noti. Cambiale IMMEDIATAMENTE!`,
    actionType: 'password' as const,
    relatedIds: ids
  }),

  securityCheckComplete: (score: number) => ({
    type: 'info' as const,
    title: 'Scansione Completata',
    message: `Il tuo vault ha un punteggio di sicurezza di ${score}/100. ${
      score >= 90 ? 'Eccellente lavoro!' :
      score >= 75 ? 'Buon livello di sicurezza.' :
      score >= 60 ? 'Ci sono margini di miglioramento.' :
      'Attenzione: migliora la sicurezza del tuo vault.'
    }`,
    actionType: 'security' as const
  })
};
