# Fix 401 Registration Error - Guida Troubleshooting

**Data**: 22 Dicembre 2025
**Problema**: Errore 401 durante la registrazione di un nuovo utente
**Causa**: Database migrations non eseguite su Supabase

---

## 🔍 Diagnosi

L'errore 401 (Unauthorized) si verifica quando:
1. Le tabelle del database (`vaults`, `sync_metadata`, `security_events`) non esistono
2. Le RLS policies non sono state create
3. Email confirmation è abilitata (opzionale)

---

## ✅ Soluzione Step-by-Step

### Passo 1: Esegui le Migrations su Supabase

1. **Apri Supabase Dashboard**
   - Vai su: https://supabase.com/dashboard
   - Login con il tuo account
   - Seleziona il progetto: `skkkgyptzjvzkopwdzrw`

2. **Apri SQL Editor**
   - Nel menu laterale, clicca su **SQL Editor**
   - Clicca su **New Query**

3. **Copia il contenuto del file migrations**
   - Apri il file: `C:\Users\joele\Desktop\Custode\supabase\migrations\001_initial_schema.sql`
   - Copia **tutto il contenuto** del file

4. **Esegui la Migration**
   - Incolla il contenuto nel SQL Editor di Supabase
   - Clicca su **Run** (o premi Ctrl+Enter)
   - Dovresti vedere: "Success. No rows returned"

5. **Verifica le Tabelle Create**
   - Nel menu laterale, clicca su **Table Editor**
   - Dovresti vedere 3 tabelle:
     - ✅ `vaults`
     - ✅ `sync_metadata`
     - ✅ `security_events`

### Passo 2: Disabilita Email Confirmation (Opzionale ma Raccomandato per Test)

1. **Vai alle Impostazioni Auth**
   - Nel menu laterale, clicca su **Authentication**
   - Clicca su **Settings** (nella sottosezione)

2. **Disabilita Email Confirmation**
   - Cerca la sezione **Email Auth**
   - Trova l'opzione **"Enable email confirmations"**
   - **Disabilita** questa opzione (toggle OFF)
   - Clicca su **Save**

   > **Nota**: Questo permette agli utenti di registrarsi immediatamente senza confermare l'email. Utile per test, ma in produzione dovresti abilitarlo.

### Passo 3: Testa di Nuovo

1. **Ricarica la pagina del browser**
   - Vai su http://localhost:3002
   - Ricarica con F5 o Ctrl+R

2. **Registra un nuovo account**
   - Clicca su "Crea Nuovo Account"
   - Inserisci:
     - Email: `test@example.com`
     - Master Password: `TestPassword123!` (soddisfa tutti i requisiti)
     - Conferma Password: `TestPassword123!`
   - Clicca su "Crea Vault"

3. **Verifica Successo**
   - Dovresti vedere la dashboard con vault vuoto
   - Vai su Supabase → Table Editor → vaults
   - Dovresti vedere un nuovo record con `encrypted_data` crittografato

---

## 🧪 Verifica che Tutto Funzioni

### Test 1: Verifica Tabelle
```sql
-- Esegui nel SQL Editor di Supabase
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('vaults', 'sync_metadata', 'security_events');
```
**Risultato Atteso**: 3 righe

### Test 2: Verifica RLS Policies
```sql
-- Esegui nel SQL Editor di Supabase
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('vaults', 'sync_metadata', 'security_events');
```
**Risultato Atteso**: 7-8 policies

### Test 3: Verifica Funzioni
```sql
-- Esegui nel SQL Editor di Supabase
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
  AND routine_name LIKE '%vault%' OR routine_name LIKE '%sync%';
```
**Risultato Atteso**: `update_vault_timestamp`, `update_sync_timestamp`

---

## 🐛 Problemi Comuni

### Errore: "relation vaults does not exist"
**Causa**: Migrations non eseguite
**Soluzione**: Torna al Passo 1 e esegui il file SQL completo

### Errore: "permission denied for table vaults"
**Causa**: RLS policies non create correttamente
**Soluzione**: Re-esegui la sezione RLS del file migrations (dalla riga 138 in poi)

### Errore: "Email not confirmed"
**Causa**: Email confirmation ancora abilitata
**Soluzione**: Segui il Passo 2 per disabilitarla

### Continua a dare 401
1. **Controlla le credenziali in `.env.local`**:
   - `VITE_SUPABASE_URL` deve corrispondere al tuo progetto
   - `VITE_SUPABASE_ANON_KEY` deve essere la chiave corretta (copia da Supabase → Settings → API)

2. **Riavvia il dev server**:
   ```bash
   # Ctrl+C per fermarlo, poi:
   npm run dev
   ```

3. **Controlla la console del browser** (F12):
   - Cerca errori rossi
   - Leggi il messaggio di errore completo

---

## 📊 Struttura Database Creata

Dopo aver eseguito le migrations, avrai:

### Tabella: `vaults`
- `id`: UUID (chiave primaria)
- `user_id`: UUID (foreign key → auth.users)
- `encrypted_data`: JSONB (vault crittografato)
- `encryption_check`: TEXT (verifica password)
- `salt`: TEXT (sale per PBKDF2)
- `iv`: TEXT (initialization vector)
- `version`: INTEGER
- `last_modified`: TIMESTAMP
- `created_at`: TIMESTAMP

### Tabella: `sync_metadata`
- `id`: UUID
- `user_id`: UUID
- `device_id`: TEXT
- `device_name`: TEXT
- `device_type`: TEXT (web/mobile/desktop/extension)
- `last_sync`: TIMESTAMP
- `created_at`: TIMESTAMP

### Tabella: `security_events`
- `id`: UUID
- `user_id`: UUID
- `event_type`: TEXT
- `device_id`: TEXT
- `ip_address`: INET
- `user_agent`: TEXT
- `metadata`: JSONB
- `created_at`: TIMESTAMP

---

## ✅ Checklist Finale

Prima di testare, assicurati che:
- [ ] Migrations SQL eseguite con successo
- [ ] 3 tabelle visibili in Table Editor
- [ ] Email confirmation disabilitata (Settings → Authentication)
- [ ] Server dev in esecuzione su localhost:3002
- [ ] Console browser pulita (no errori CORS o 401)

---

## 🚀 Prossimi Step

Dopo aver risolto il 401:
1. Testa registrazione completa
2. Testa login con l'account creato
3. Aggiungi una password di test
4. Verifica che sia crittografata in Supabase
5. Testa sync tra tab diversi
