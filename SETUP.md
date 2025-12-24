# Custode - Setup e Configurazione

## Progresso Attuale: Phase 1.1-1.3 Completata ✅

### ✅ Cosa è Stato Implementato

1. **Modulo Crittografia** (`src/lib/crypto/`)
   - ✅ AES-256-GCM encryption/decryption
   - ✅ PBKDF2 key derivation (100,000 iterazioni)
   - ✅ Utility Base64 conversion
   - ✅ Password validation
   - ✅ Verification checks

2. **Moduli Supabase** (`src/lib/supabase/`)
   - ✅ Client configuration
   - ✅ Authentication con crittografia integrata
   - ✅ Vault CRUD operations
   - ✅ Realtime subscriptions
   - ✅ Security event logging

3. **Database Schema**
   - ✅ Migration SQL completa (`supabase/migrations/001_initial_schema.sql`)
   - ✅ Tabelle: vaults, sync_metadata, security_events
   - ✅ Row-Level Security policies
   - ✅ Triggers e functions

4. **Dependencies**
   - ✅ @supabase/supabase-js (v2.39.0)
   - ✅ zxcvbn (password strength)
   - ✅ papaparse (CSV import/export)
   - ✅ Testing libraries (vitest, @testing-library/react)

---

## 🚀 Prossimi Passi: Configurazione Supabase

### Step 1: Crea un Progetto Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Clicca "Start your project" o "New Project"
3. Scegli un nome per il progetto: `custode-password-manager`
4. Scegli una password forte per il database (la userai solo per l'admin)
5. Seleziona la regione più vicina (es. Europe West per Italia)
6. Aspetta che il progetto venga creato (~2 minuti)

### Step 2: Ottieni le Credenziali API

1. Nel dashboard Supabase, vai su **Settings** → **API**
2. Copia i seguenti valori:
   - **Project URL** (es. `https://xyzabc123.supabase.co`)
   - **Project API keys** → **anon/public** key (una chiave lunghissima che inizia con `eyJ...`)

### Step 3: Configura le Variabili d'Ambiente

Apri il file `.env.local` nel progetto e sostituisci i placeholder:

```env
VITE_SUPABASE_URL=https://TUO-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (la tua anon key completa)
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Custode
VITE_ENV=development
```

**IMPORTANTE:** Non committare mai questo file! È già in `.gitignore`.

### Step 4: Esegui le Migrations SQL

1. Nel dashboard Supabase, vai su **SQL Editor**
2. Clicca "New query"
3. Copia tutto il contenuto del file `supabase/migrations/001_initial_schema.sql`
4. Incollalo nell'editor
5. Clicca "Run" (o premi Ctrl+Enter)
6. Verifica che vedi il messaggio "Success. No rows returned"

**Alternative: Usando Supabase CLI (opzionale)**
```bash
# Installa Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al progetto
supabase link --project-ref TUO-PROJECT-ID

# Esegui migrations
supabase db push
```

### Step 5: Verifica la Configurazione

1. Nel dashboard Supabase, vai su **Database** → **Tables**
2. Dovresti vedere 3 tabelle:
   - `vaults`
   - `sync_metadata`
   - `security_events`

3. Vai su **Authentication** → **Policies**
4. Verifica che ci siano le policies RLS per ogni tabella

### Step 6: Testa la Connessione

Avvia il server di sviluppo:
```bash
npm run dev
```

Apri la console del browser (F12) e verifica che NON ci siano errori tipo:
- ❌ "Missing Supabase environment variables"
- ❌ "Using placeholder Supabase credentials"

Se vedi ⚠️ questi warnings, significa che devi aggiornare `.env.local` con le credenziali corrette.

---

## 📝 Prossime Implementazioni (Dopo Configurazione Supabase)

Una volta configurato Supabase, procederemo con:

1. **Contexts & Hooks** (Phase 1.4)
   - AuthContext - gestione stato autenticazione
   - VaultContext - gestione stato vault crittografato
   - useAuth hook - operazioni auth
   - useVault hook - operazioni vault

2. **Refactoring App.tsx**
   - Sostituire useState con VaultContext
   - Integrare autenticazione reale
   - Collegare componenti al vault crittografato

3. **Testing**
   - Test del flusso completo: Registrazione → Login → Decrypt
   - Verifica crittografia end-to-end
   - Test sincronizzazione realtime

---

## ⚠️ Note Importanti sull'Architettura Attuale

### Problema: Auth Password Management

C'è una **decisione architetturale critica** da prendere:

**Il Problema:**
- Custode usa una **master password** per crittografia (zero-knowledge)
- Supabase Auth richiede una password separata per autenticazione
- Come gestiamo due password?

**Soluzioni Possibili:**

1. **Usa Master Password anche per Supabase Auth** ⚠️
   - PRO: Una sola password da ricordare
   - CONTRO: Master password viaggia sul server (NON zero-knowledge puro)
   - Implementazione: Modificare `auth.ts` per usare master password

2. **Genera Password Random per Supabase** ✅ (Attuale)
   - PRO: Vera zero-knowledge, master password mai sul server
   - CONTRO: Complicato gestire due password
   - Implementazione: Criptare auth password con master password

3. **Usa Supabase Magic Links**
   - PRO: No password Supabase, solo email
   - CONTRO: Dipendenza da email per ogni login
   - Implementazione: Sostituire `signInWithPassword` con `signInWithOtp`

4. **Hash Master Password per Supabase Auth**
   - PRO: Deterministic, riproducibile
   - CONTRO: Se qualcuno ottiene DB Supabase, può provare password comuni
   - Implementazione: `authPassword = sha256(masterPassword + salt)`

**Raccomandazione:** Per MVP, usare **Soluzione #1** (master password per entrambi) e poi migrare a **Soluzione #2** in produzione.

---

## 🧪 Test Crittografia

Per testare che la crittografia funzioni correttamente:

1. Apri la console del browser (F12)
2. Esegui:
```javascript
import { runCryptoTests } from './src/lib/crypto/test';
await runCryptoTests();
```

3. Dovresti vedere:
   - ✅ Web Crypto API supported
   - ✅ Key derived in ~100-200ms
   - ✅ Vault encrypted/decrypted
   - ✅ Password verification working
   - ✅ Wrong password correctly rejected

---

## 🔐 Sicurezza

- ✅ Master password NEVER inviata al server (tranne se usiamo soluzione #1 temp)
- ✅ Tutti i dati crittografati client-side prima dell'upload
- ✅ PBKDF2 con 100,000 iterazioni (resistente a brute-force)
- ✅ AES-256-GCM (autenticato, previene tampering)
- ✅ Row-Level Security su Supabase (isolamento utenti)
- ✅ Encryption key MAI salvato su disco (solo in memoria)

---

## 📞 Supporto

Se incontri problemi:

1. **Errori Supabase**: Verifica `.env.local` e che le migrations siano eseguite
2. **Errori Crypto**: Verifica che il browser supporti Web Crypto API (Chrome 60+, Firefox 55+)
3. **Problemi di Import**: Assicurati che tutte le dipendenze siano installate: `npm install`

---

## 📊 Stato Implementazione

**Completato:**
- [x] Phase 1.1 - Crypto Library
- [x] Phase 1.2 - Supabase Setup (migrations create)
- [x] Phase 1.3 - Authentication Module

**In Attesa di Configurazione Supabase:**
- [ ] Creare progetto Supabase
- [ ] Eseguire migrations SQL
- [ ] Configurare `.env.local`

**Prossimo (dopo Supabase):**
- [ ] Phase 1.4 - Contexts & Hooks
- [ ] Phase 2.1 - Password Management UI
- [ ] Phase 2.2 - Folder Organization
- [ ] Phase 2.3 - Secure Notes
- [ ] Phase 2.4 - Development Vault

Tempo stimato per configurazione Supabase: **10-15 minuti**
