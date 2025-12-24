# Completamento Funzionalità App - Custode

**Data:** 24 Dicembre 2025
**Tipo:** Feature Implementation
**Priorità:** Alta

## Obiettivo

Rendere l'applicazione Custode completamente funzionante implementando tutte le funzionalità UI/UX attualmente presenti ma non operative. Questo include:

1. **Sistema profilo utente dinamico** (icona e dati reali)
2. **Gestione favoriti funzionante**
3. **Security score e dashboard con dati reali**
4. **Sistema notifiche di sicurezza**
5. **Operazioni CRUD complete** (edit/delete per tutte le entità)
6. **Menu impostazioni e gestione account**

## Architettura

### 1. Profilo Utente Dinamico

**Problema attuale:**
- Nome utente hardcoded come "Alexandar"
- Avatar con seed fisso "Alex"
- Email reale non visualizzata nell'UI

**Soluzione:**
- Usare `email` da `AuthContext` per visualizzare email vera
- Generare avatar usando hash dell'email come seed per dicebear
- Estrarre nome utente dalla parte prima di @ dell'email
- Creare componente `UserProfileMenu` con dropdown:
  - Email utente
  - Data registrazione
  - Statistiche vault (# passwords, # notes, # dev keys)
  - Pulsante "Impostazioni"
  - Pulsante "Logout"

**File da modificare:**
- `App.tsx` - Aggiornare header con dati dinamici
- `components/UserProfileMenu.tsx` - **NUOVO** componente dropdown

---

### 2. Sistema Favoriti

**Problema attuale:**
- Pulsanti stella presenti ma non funzionanti
- Campo `isFavorite` esiste nei types ma non viene usato

**Soluzione:**
- Implementare `toggleFavorite()` nel VaultContext per:
  - `togglePasswordFavorite(id: string)`
  - `toggleDevKeyFavorite(id: string)`
  - `toggleNoteFavorite(id: string)`
- Aggiornare componenti card per chiamare toggle al click
- Aggiungere filtro "Preferiti" nella UI
- Salvare automaticamente nel vault crittografato

**File da modificare:**
- `contexts/VaultContext.tsx` - Aggiungere metodi toggle
- `components/PasswordCard.tsx` - Collegare pulsante stella
- `components/DevKeyCard.tsx` - Collegare pulsante stella
- `App.tsx` - Aggiungere gestione note favorite

---

### 3. Security Score Reale

**Problema attuale:**
- Security score hardcoded a 85
- Nessun calcolo basato sui dati reali

**Soluzione:**
Implementare algoritmo di calcolo in `lib/security/scoreCalculator.ts`:

```typescript
interface SecurityAnalysis {
  score: number;           // 0-100
  weakPasswords: string[]; // IDs password deboli
  reusedPasswords: Map<string, string[]>; // password -> [IDs]
  oldPasswords: string[];  // IDs password > 90 giorni
  compromised: string[];   // IDs da Have I Been Pwned (fase 2)
}
```

**Criteri di valutazione:**
- **Password deboli** (-10 punti ciascuna):
  - Lunghezza < 12 caratteri
  - Mancano uppercase/lowercase/numeri/simboli
  - Pattern comuni (123456, password, ecc.)

- **Password riutilizzate** (-15 punti per gruppo):
  - Stessa password usata per più servizi

- **Password vecchie** (-5 punti ciascuna):
  - Non modificate da > 90 giorni

- **Punteggio base:** 100 punti
- **Punteggio minimo:** 0 punti

**File da creare:**
- `lib/security/scoreCalculator.ts` - **NUOVO** modulo calcolo score
- `lib/security/passwordStrength.ts` - **NUOVO** helper per validazione password

**File da modificare:**
- `App.tsx` - Usare score calcolato invece di valore fisso
- `components/SecurityScoreCard.tsx` - Mostrare breakdown score

---

### 4. Security Dashboard Funzionante

**Problema attuale:**
- Dati fake (3 violate, 8 deboli, 5 riutilizzate, 12 vecchie)
- "Avvia Scansione Completa" non fa nulla
- Nessun dettaglio sulle password problematiche

**Soluzione:**
- Usare `SecurityAnalysis` da scoreCalculator
- Rendere le card cliccabili per mostrare dettagli
- Implementare modal `SecurityIssueDetailModal`:
  - Lista password problematiche
  - Suggerimenti per miglioramento
  - Pulsante "Aggiorna Password"

- "Avvia Scansione Completa":
  - Animazione di loading
  - Ricalcolo score
  - Notifica risultati

**File da creare:**
- `components/SecurityIssueDetailModal.tsx` - **NUOVO** modal dettagli

**File da modificare:**
- `App.tsx` - Collegare dati reali alle SecurityIssueCard
- `App.tsx` - Implementare funzione scansione

---

### 5. Sistema Notifiche

**Problema attuale:**
- Badge rosso sul pulsante campana ma nessuna funzionalità
- Nessun sistema di notifiche

**Soluzione:**
Implementare `NotificationSystem` in `lib/notifications/`:

**Tipi di notifiche:**
- 🔴 **Critiche**: Password compromesse (Have I Been Pwned)
- 🟡 **Avvisi**: Password deboli o riutilizzate
- 🔵 **Info**: Dev key in scadenza, password vecchie

**Componente:**
- `NotificationDropdown` - Menu a tendina con lista notifiche
- Badge con conteggio notifiche non lette
- Marcatura come "letta"
- Azione rapida dalla notifica

**File da creare:**
- `lib/notifications/notificationManager.ts` - **NUOVO** gestore notifiche
- `components/NotificationDropdown.tsx` - **NUOVO** dropdown

**File da modificare:**
- `App.tsx` - Collegare pulsante campana

---

### 6. CRUD Completo

**Problema attuale:**
- Si possono solo aggiungere elementi
- Non è possibile modificare o eliminare
- `PasswordDetailModal` mostra solo dettagli

**Soluzione:**

**A) Password:**
- `PasswordDetailModal` aggiornata con:
  - Pulsante "Modifica"
  - Pulsante "Elimina" (con conferma)
  - Form di edit inline

**B) Dev Keys:**
- Nuovo `DevKeyDetailModal` simile a PasswordDetailModal
- Edit e delete

**C) Notes:**
- Nuovo `NoteDetailModal`
- Editor full-screen per contenuto
- Edit e delete

**Metodi VaultContext:**
```typescript
updatePassword(id: string, updates: Partial<PasswordEntry>)
deletePassword(id: string)
updateDevKey(id: string, updates: Partial<DevKey>)
deleteDevKey(id: string)
updateNote(id: string, updates: Partial<SecureNote>)
deleteNote(id: string)
```

**File da creare:**
- `components/DevKeyDetailModal.tsx` - **NUOVO**
- `components/NoteDetailModal.tsx` - **NUOVO**
- `components/ConfirmDeleteModal.tsx` - **NUOVO** modal conferma eliminazione

**File da modificare:**
- `contexts/VaultContext.tsx` - Aggiungere metodi update/delete
- `components/PasswordDetailModal.tsx` - Aggiungere edit/delete
- `App.tsx` - Gestire click su dev keys e note

---

### 7. Menu Impostazioni

**File da creare:**
- `components/SettingsModal.tsx` - **NUOVO** modal impostazioni

**Sezioni:**
1. **Account:**
   - Email (read-only)
   - Data registrazione
   - Cambia master password (fase 2)

2. **Sicurezza:**
   - Auto-lock timeout
   - Richiedi password per azioni sensibili
   - Backup encryption keys (fase 2)

3. **Vault:**
   - Numero totale elementi
   - Spazio usato
   - Export vault (JSON crittografato)

4. **Informazioni:**
   - Versione app
   - Privacy policy
   - Termini di servizio

---

## File Modificati

### File Nuovi (9):
1. `lib/security/scoreCalculator.ts` - Calcolo security score
2. `lib/security/passwordStrength.ts` - Validazione password
3. `lib/notifications/notificationManager.ts` - Sistema notifiche
4. `components/UserProfileMenu.tsx` - Menu profilo utente
5. `components/NotificationDropdown.tsx` - Dropdown notifiche
6. `components/SecurityIssueDetailModal.tsx` - Dettagli problemi sicurezza
7. `components/DevKeyDetailModal.tsx` - Dettagli dev key
8. `components/NoteDetailModal.tsx` - Dettagli note
9. `components/ConfirmDeleteModal.tsx` - Conferma eliminazione
10. `components/SettingsModal.tsx` - Impostazioni app

### File Modificati (5):
1. `App.tsx` - Integrare tutte le nuove funzionalità
2. `contexts/VaultContext.tsx` - Metodi CRUD completi + toggle favoriti
3. `components/PasswordCard.tsx` - Toggle favoriti
4. `components/DevKeyCard.tsx` - Toggle favoriti + click handler
5. `components/PasswordDetailModal.tsx` - Edit e delete
6. `components/SecurityScoreCard.tsx` - Breakdown score dettagliato

---

## Dipendenze

**Nessuna nuova dipendenza richiesta** - Useremo:
- `lucide-react` (già installato) per icone
- `zxcvbn` (già installato) per password strength
- Web Crypto API (già in uso) per hashing
- Supabase (già configurato) per storage

---

## Testing

### Test Manuali per ogni feature:

**1. Profilo Utente:**
- ✅ Email reale visualizzata nell'header
- ✅ Avatar generato da hash email
- ✅ Menu dropdown funzionante
- ✅ Logout funziona correttamente

**2. Favoriti:**
- ✅ Click stella aggiunge/rimuove favorito
- ✅ Stato salvato nel vault
- ✅ Stato persiste dopo reload
- ✅ Filtro favoriti mostra solo elementi preferiti

**3. Security Score:**
- ✅ Score calcolato correttamente all'avvio
- ✅ Score si aggiorna quando aggiungi/rimuovi password
- ✅ Conteggi problemi corrispondono alla realtà
- ✅ Breakdown visibile in SecurityScoreCard

**4. Security Dashboard:**
- ✅ Dati reali mostrati nelle card
- ✅ Click su card apre modal con lista dettagliata
- ✅ "Avvia Scansione" ricalcola e mostra risultati
- ✅ Suggerimenti utili mostrati

**5. Notifiche:**
- ✅ Badge conta correttamente notifiche non lette
- ✅ Dropdown mostra lista notifiche
- ✅ Click su notifica esegue azione
- ✅ Marca come letta funziona

**6. CRUD:**
- ✅ Edit password salva modifiche
- ✅ Delete password rimuove dal vault
- ✅ Conferma eliminazione funziona
- ✅ Stesso per dev keys e note

**7. Impostazioni:**
- ✅ Modal si apre e chiude correttamente
- ✅ Dati account visualizzati
- ✅ Export vault scarica JSON crittografato

---

## Note di Sicurezza

### Considerazioni Importanti:

1. **Delete Permanente:**
   - Nessun cestino/ripristino
   - Conferma obbligatoria prima di eliminare
   - Warning visibile: "Questa azione è irreversibile"

2. **Edit Password:**
   - Mostrare password in chiaro solo con conferma
   - Aggiornare `lastModified` timestamp
   - Ricalcolare security score dopo modifica

3. **Export Vault:**
   - JSON rimane crittografato (AES-256-GCM)
   - Include metadata (timestamp export, version)
   - Warning: "Non condividere questo file"

4. **Notifiche Sensibili:**
   - Non mostrare password in plain text nelle notifiche
   - Solo nomi servizi e tipo di problema
   - Richiede unlock per vedere dettagli

5. **Avatar Generation:**
   - Usare SHA-256 hash dell'email come seed
   - Mai inviare email a servizi terzi
   - Dicebear genera avatar lato client

---

## Priorità Implementazione

### Fase 1 (Essenziale - oggi):
1. ✅ Profilo utente dinamico
2. ✅ Security score reale
3. ✅ CRUD completo (edit/delete)
4. ✅ Favoriti funzionanti

### Fase 2 (Importante - prossima sessione):
5. ✅ Sistema notifiche
6. ✅ Security dashboard dettagliata
7. ✅ Menu impostazioni

### Fase 3 (Enhancement - futuro):
8. Have I Been Pwned integration
9. Export/Import vault
10. Auto-lock con timeout

---

## Metriche di Successo

**L'app sarà considerata "completamente funzionante" quando:**

- [x] Ogni pulsante e icona nell'UI esegue un'azione reale
- [x] Tutti i dati mostrati sono dinamici (no hardcoded)
- [x] CRUD completo per tutte le entità (password, dev keys, note)
- [x] Security score riflette lo stato reale del vault
- [x] Sistema notifiche avvisa problemi di sicurezza
- [x] Profilo utente mostra dati reali
- [x] Menu impostazioni permette configurazione base

---

## Stima Tempo

**Totale:** ~4-5 ore di sviluppo

- Profilo utente: 30 min
- Security score: 1 ora
- CRUD completo: 1.5 ore
- Favoriti: 30 min
- Notifiche: 1 ora
- Settings: 30 min
- Testing e bug fix: 1 ora

---

## Domande per l'Utente

1. **Have I Been Pwned:** Vuoi integrare il check delle password compromesse già ora o in fase successiva?
2. **Export Vault:** Preferisci JSON crittografato o CSV in chiaro per export?
3. **Auto-lock:** Vuoi implementare il timeout automatico in questa sessione?
4. **Avatar:** OK usare dicebear o preferisci iniziali in cerchio colorato?

---

**Prossimo Step:** Attendere conferma utente per procedere con implementazione.
