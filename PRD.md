# Product Requirements Document (PRD)
## Custode Password Manager

**Versione documento:** 1.0  
**Data:** 22 Dicembre 2025  
**Autore:** Product Team

---

## 1. Panoramica del Prodotto

### 1.1 Descrizione
Custode è un password manager essenziale e sicuro. Tre funzioni core: gestione password, note private crittografate, e uno spazio dedicato per sviluppatori dove conservare API key e credenziali tecniche. Niente di più, niente di meno.

### 1.2 Obiettivi del Prodotto
- Fornire uno strumento affidabile per la gestione delle credenziali digitali
- Eliminare la necessità di ricordare decine di password diverse
- Offrire uno spazio sicuro per note sensibili
- Dare agli sviluppatori un vault specifico per chiavi API e token
- Garantire protezione attraverso crittografia end-to-end
- Mantenere l'interfaccia semplice e priva di funzioni superflue

### 1.3 Target Utenti
- Professionisti che gestiscono molteplici account
- Sviluppatori che necessitano di conservare API key in modo sicuro
- Utenti che cercano semplicità senza sacrificare la sicurezza
- Chiunque voglia abbandonare password deboli o ripetute

---

## 2. Funzionalità Core

### 2.1 Gestione Password

**Archiviazione Credenziali**
- Salvataggio illimitato di credenziali
- Campi: nome servizio/sito, username/email, password, URL, note
- Organizzazione tramite cartelle personalizzabili
- Contrassegno "Preferiti" per accesso rapido
- Campo URL per riconoscimento automatico dei siti

**Ricerca e Navigazione**
- Barra di ricerca istantanea per nome servizio, username o URL
- Filtro per cartella
- Ordinamento alfabetico, per data di creazione, o ultima modifica
- Vista lista con anteprima rapida

**Visualizzazione Credenziale**
- Password mascherata con opzione "mostra/nascondi"
- Pulsante "Copia" per username e password (clipboard si svuota automaticamente dopo 60 secondi)
- Indicatore forza password con livelli: Debole, Media, Forte, Molto Forte
- Data ultima modifica
- Apertura rapida URL associato

**Operazioni Base**
- Creazione nuova credenziale
- Modifica credenziale esistente
- Eliminazione con conferma
- Duplicazione credenziale (utile per creare varianti)

### 2.2 Generatore Password

**Generazione Password**
- Lunghezza configurabile: 8-64 caratteri (default 16)
- Selezione tipologie caratteri:
  - Lettere maiuscole (A-Z)
  - Lettere minuscole (a-z)
  - Numeri (0-9)
  - Simboli (!@#$%^&*)
- Opzione "Escludi caratteri ambigui" (0/O, 1/l/I)
- Indicatore forza password in tempo reale
- Pulsante "Rigenera" per nuove opzioni
- Pulsante "Copia" per copiare negli appunti
- Pulsante "Usa questa password" per salvare direttamente in una credenziale

**Preset Rapidi**
- Standard (16 caratteri, maiuscole + minuscole + numeri + simboli)
- Forte (24 caratteri, tutti i tipi)
- PIN (6 cifre, solo numeri)
- Semplice (12 caratteri, solo lettere e numeri)

### 2.3 Note Sicure

**Creazione e Gestione**
- Editor di testo semplice per note crittografate
- Campi: titolo, contenuto testo, cartella
- Stessa organizzazione delle password (cartelle, preferiti, ricerca)
- Formattazione testo base mantenuta (a capo, spazi)

**Casi d'Uso Tipici**
- Codici di recupero backup
- Domande e risposte di sicurezza
- Numeri seriali e licenze software
- Informazioni sensibili personali
- Combinazioni di casseforti o lucchetti
- WiFi password di casa/ufficio

**Funzionalità**
- Ricerca full-text nel contenuto delle note
- Copia rapida dell'intero contenuto
- Timestamp creazione e ultima modifica
- Indicatore di lunghezza testo

### 2.4 Modalità Development

**Vault Dedicato per Sviluppatori**
Una sezione separata specificamente progettata per conservare credenziali tecniche e chiavi API. Stessi standard di sicurezza, interfaccia ottimizzata per il workflow degli sviluppatori.

**Struttura Credenziale Development**
- Nome servizio/API
- Tipo (API Key, Token, OAuth, Secret, Certificate, SSH Key, Database Credential)
- Chiave/Token (campo principale, monospace font)
- Identificatore/Client ID (opzionale)
- Secret (opzionale, per OAuth)
- Endpoint/URL base API
- Ambiente (Production, Staging, Development, Test)
- Note tecniche
- Data scadenza (opzionale, con alert automatico)

**Funzionalità Specifiche**
- Badge ambiente con colori distintivi (Production: rosso, Staging: arancione, Development: verde, Test: blu)
- Filtro rapido per ambiente
- Filtro per tipo di credenziale
- Alert automatico 30 giorni prima della scadenza
- Campo note con supporto markdown per documentazione tecnica
- Copia rapida con un click di chiavi lunghe
- Formato monospace per tutti i campi codice
- Template pre-compilati per servizi comuni (AWS, GitHub, Stripe, OpenAI, Google Cloud, Azure, etc.)

**Template Servizi Comuni**
Quando si crea una nuova credenziale development, proporre template per:
- AWS (Access Key ID + Secret Access Key)
- GitHub (Personal Access Token)
- OpenAI (API Key + Organization ID)
- Stripe (Publishable Key + Secret Key + Webhook Secret)
- Google Cloud (Service Account JSON)
- Firebase (Config Object)
- Database (Host, Port, Username, Password, Database Name)
- SSH (Private Key, Public Key, Passphrase)

**Vista Development**
- Lista compatta con nome servizio, tipo, ambiente
- Indicatore visivo per chiavi in scadenza
- Filtri persistenti (ultimo ambiente visualizzato rimane selezionato)
- Ricerca specifica che include campi tecnici
- Possibilità di esportare singola credenziale in formato JSON per import in file .env

### 2.5 Compilazione Automatica

**Estensione Browser**
- Rilevamento automatico campi login su pagine web
- Icona Custode appare nel campo password
- Click sull'icona mostra credenziali disponibili per quel sito
- Compilazione automatica con un click
- Proposta di salvataggio quando si inseriscono nuove credenziali manualmente

**Gestione Multi-Account**
- Se esistono più credenziali per lo stesso sito, mostra lista di selezione
- Ultima credenziale usata appare per prima
- Possibilità di impostare una credenziale come predefinita per il sito

**Shortcut da Tastiera**
- Cmd/Ctrl + Shift + L: apre popup Custode sulla pagina corrente
- Ricerca rapida per nome servizio
- Invio per compilare con prima credenziale trovata

### 2.6 Sincronizzazione Multi-Dispositivo

**Cloud Sync**
- Sincronizzazione automatica e trasparente tra tutti i dispositivi
- Crittografia dei dati prima dell'upload
- Indicatore stato sincronizzazione (sincronizzato, in corso, offline)
- Funzionamento offline: modifiche vengono sincronizzate al ripristino della connessione
- Risoluzione automatica conflitti (ultima modifica vince)

**Gestione Dispositivi**
- Lista dispositivi connessi all'account
- Info per ogni dispositivo: nome, tipo (Web, Mobile, Desktop, Estensione), ultima sincronizzazione
- Revoca accesso remoto per dispositivi persi o non più utilizzati

### 2.7 Sicurezza e Crittografia

**Master Password**
- Unica password che l'utente deve ricordare
- Requisiti minimi applicati:
  - Minimo 12 caratteri
  - Almeno una maiuscola e una minuscola
  - Almeno un numero
  - Almeno un carattere speciale
- **Nessun recupero possibile**: se dimenticata, il vault è irrecuperabile (by design)
- Solo opzione: reset completo con perdita di tutti i dati

**Autenticazione Biometrica**
- Supporto Face ID, Touch ID, impronta digitale (dove disponibile)
- La biometrica sblocca localmente, master password richiesta per operazioni sensibili
- Timeout automatico dopo periodo di inattività (configurabile: 1, 5, 15, 30 minuti, mai)

**Crittografia**
- AES-256 per crittografia dei dati
- PBKDF2 con 100.000 iterazioni per derivazione chiave da master password
- Zero-knowledge architecture: Custode non può mai accedere ai dati dell'utente
- Crittografia end-to-end per sincronizzazione cloud

**Dashboard Sicurezza**
- Punteggio complessivo sicurezza vault (0-100)
- Lista password deboli con link per rigenerarle
- Lista password riutilizzate su più servizi
- Lista password vecchie (oltre 180 giorni senza modifica)
- Verifica automatica contro database Have I Been Pwned
- Alert per password trovate in violazioni di dati note

### 2.8 Importazione/Esportazione

**Importazione**
- Supporto file CSV standard
- Import guidato da altri password manager comuni:
  - Chrome/Edge (password salvate)
  - Firefox (password salvate)
  - Safari (Keychain)
  - LastPass
  - 1Password
  - Bitwarden
  - Dashlane
- Anteprima dati prima dell'import finale
- Mappatura automatica campi

**Esportazione**
- Export vault completo in CSV
- Opzione esportazione crittografata (file protetto da password)
- Export per sezione (solo password, solo note, solo development)
- Warning chiaro sui rischi dell'export non crittografato

**Backup Locale**
- Backup automatico giornaliero sul dispositivo
- Mantiene ultimi 7 backup
- Restore manuale da backup locale
- Backup crittografati con la master password

---

## 3. Copy e Messaggistica

### 3.1 Onboarding

**Schermata Benvenuto**
- Titolo: "Benvenuto in Custode"
- Sottotitolo: "Le tue password, le tue note, le tue API. Tutto in un posto sicuro."
- CTA: "Crea il tuo vault"

**Creazione Master Password**
- Titolo: "Crea la tua Master Password"
- Descrizione: "Questa è l'unica password che dovrai ricordare. Sceglila con cura: deve essere forte e memorabile. **Custode non può recuperarla**. Se la dimentichi, perderai l'accesso permanente al tuo vault."
- Box evidenziato: "⚠️ Nessun recupero possibile. Annotala in un posto sicuro."
- Requisiti mostrati in tempo reale con check verde:
  - ☐ Almeno 12 caratteri
  - ☐ Una maiuscola e una minuscola
  - ☐ Un numero
  - ☐ Un carattere speciale
- Campo "Conferma Master Password"
- CTA: "Crea il mio vault"

**Setup Completato**
- Titolo: "Vault creato!"
- Descrizione: "Il tuo spazio sicuro è pronto. Inizia aggiungendo la tua prima password."
- Opzioni veloci:
  - "Nuova password"
  - "Importa da altro servizio"
  - "Esplora Custode"

### 3.2 Interfaccia Principale

**Sidebar Navigazione**
- Sezioni principali:
  - 🔑 Password
  - 📝 Note Sicure
  - 💻 Development
  - ⭐ Preferiti
  - 🛡️ Sicurezza
  - ⚙️ Impostazioni

**Dashboard Vuota (primo accesso)**
- Password vuota: "Ancora nessuna password salvata"
- Sottotesto: "Aggiungi la tua prima credenziale o genera una password sicura per un nuovo account."
- CTA primario: "Nuova password"
- CTA secondario: "Importa password"

**Note vuota**: "Nessuna nota sicura ancora"
- Sottotesto: "Salva informazioni sensibili in modo crittografato: codici di recupero, licenze software, o qualsiasi dato che vuoi proteggere."
- CTA: "Nuova nota"

**Development vuota**: "Il tuo vault development è vuoto"
- Sottotesto: "Conserva API key, token e credenziali tecniche in modo sicuro e organizzato."
- CTA: "Nuova credenziale API"

**Pulsanti Azione Rapida**
- Floating button "+" in basso a destra con menu:
  - Nuova password
  - Nuova nota
  - Nuova API key
  - Genera password

**Stati Ricerca Vuota**
- "Nessun risultato per '[termine]'"
- "Prova con un termine diverso o verifica l'ortografia."
- Pulsante: "Cancella ricerca"

### 3.3 Generatore Password

**Interfaccia Generatore**
- Titolo: "Genera Password Sicura"
- Password generata mostrata in box grande, monospace, con pulsante "Rigenera" ⟳
- Indicatore forza con colore: Debole (rosso), Media (arancione), Forte (verde), Molto Forte (verde scuro)
- Slider lunghezza: "Lunghezza: 16 caratteri"
- Checkbox opzioni:
  - ☑ Maiuscole (A-Z)
  - ☑ Minuscole (a-z)
  - ☑ Numeri (0-9)
  - ☑ Simboli (!@#$%^&*)
  - ☐ Escludi caratteri ambigui
- CTA: "Copia password" / "Usa in nuova credenziale"

**Preset Box**
- "Usa un preset:"
- Pulsanti: Standard | Forte | PIN | Semplice

### 3.4 Sicurezza e Alert

**Dashboard Sicurezza**
- Score centrale grande: "Il tuo vault: 73/100"
- Messaggio contestuale basato su score:
  - 0-40: "⚠️ Sicurezza critica. Agisci subito."
  - 41-60: "⚡ Sicurezza migliorabile. Intervieni presto."
  - 61-80: "✓ Buona sicurezza. Alcune correzioni consigliate."
  - 81-100: "✓✓ Ottima sicurezza. Continua così."

**Problemi Riscontrati**
- Card cliccabili per ogni tipo:
  - "🔴 3 password compromesse" → "Cambia subito"
  - "🟠 8 password deboli" → "Rafforza"
  - "🟡 5 password riutilizzate" → "Rendi uniche"
  - "⚪ 12 password vecchie (>6 mesi)" → "Aggiorna"

**Alert Password Compromessa**
- Banner rosso in alto alla credenziale:
  - "⚠️ Password trovata in violazione dati"
  - "Questa password appare in un database di violazioni note. Cambiala immediatamente."
  - CTA: "Genera nuova password"

**Alert Scadenza API Key (Development)**
- Badge arancione sulla credenziale: "Scade tra 15 giorni"
- Notifica nell'area Development: "2 API key in scadenza"

**Timeout Sessione**
- Modale centrato: "Sessione scaduta"
- "Per sicurezza, Custode si blocca dopo [X] minuti di inattività."
- Campo Master Password
- CTA: "Sblocca" / Link "Hai dimenticato la password?"

### 3.5 Development Mode

**Nuova Credenziale Development**
- Titolo: "Nuova Credenziale Development"
- Dropdown "Usa template": [Vuoto, AWS, GitHub, OpenAI, Stripe, Database, Custom...]
- Campi form:
  - Nome servizio *
  - Tipo: [Dropdown: API Key, Token, OAuth, Secret, Certificate, SSH Key, Database]
  - Ambiente: [Dropdown: Production, Staging, Development, Test]
  - Chiave/Token * (campo monospace, multilinea)
  - Client ID (opzionale)
  - Secret (opzionale)
  - Endpoint URL
  - Scadenza (date picker, opzionale)
  - Note (supporta markdown)
- CTA: "Salva credenziale"

**Vista Lista Development**
- Card compatte con:
  - Nome servizio in bold
  - Badge ambiente (colorato)
  - Tipo in grigio chiaro
  - Indicatore scadenza se presente
  - Data ultima modifica
- Hover mostra anteprima prime 20 caratteri della chiave
- Click apre dettaglio completo

**Filtri Development**
- Filtro rapido per ambiente (chip cliccabili: All, Production, Staging, Development, Test)
- Filtro per tipo (dropdown)
- Contatore: "15 credenziali API · 3 in scadenza"

### 3.6 Note Sicure

**Nuova Nota**
- Titolo: "Nuova Nota Sicura"
- Campo: Titolo *
- Area testo grande per contenuto
- Dropdown cartella (opzionale)
- Check "Aggiungi ai preferiti"
- Contatore caratteri in basso
- CTA: "Salva nota"

**Vista Nota**
- Titolo in grande
- Contenuto in formato leggibile
- Info sotto: cartella, data creazione, ultima modifica
- Pulsanti: "Copia tutto" | "Modifica" | "Elimina"

### 3.7 Errori e Feedback

**Master Password Errata**
- "Master Password non corretta. Riprova."
- Dopo 3 tentativi: "Troppi tentativi. Riprova tra 5 minuti."

**Conferma Eliminazione**
- Modale: "Eliminare questa [credenziale/nota]?"
- "Questa operazione non può essere annullata."
- Campo: "Digita ELIMINA per confermare"
- CTA: "Elimina definitivamente" (rosso) / "Annulla"

**Operazioni Riuscite** (toast in alto a destra)
- "✓ Password copiata (si cancellerà tra 60s)"
- "✓ Credenziale salvata"
- "✓ Nota eliminata"
- "✓ Impostazioni aggiornate"
- "✓ Sincronizzazione completata"

**Sincronizzazione Offline**
- Indicator badge: "Offline"
- Toast: "Modifiche salvate localmente. Sincronizzeranno quando tornerai online."

**Importazione Completata**
- "✓ Importate 47 password con successo"
- "2 duplicati ignorati · 3 password deboli rilevate"
- Link: "Vai alla dashboard sicurezza"

---

## 4. Requisiti Tecnici

### 4.1 Piattaforme
- **Web app**: responsive, supporto Chrome, Firefox, Safari, Edge (ultime 2 versioni)
- **Estensione browser**: Chrome, Firefox, Edge
- **App mobile**: iOS 15+, Android 11+
- **App desktop**: Windows 10+, macOS 11+

### 4.2 Prestazioni
- Avvio app: <1 secondo
- Ricerca: risultati entro 100ms
- Generazione password: istantanea
- Sincronizzazione: <2 secondi per vault fino a 1000 elementi
- Compilazione automatica: <500ms dal click

### 4.3 Limiti
- Credenziali per vault: illimitate
- Dispositivi contemporanei: 10
- Spazio cloud per utente: 100MB
- Lunghezza master password: 12-128 caratteri
- Lunghezza singola password: fino a 512 caratteri
- Dimensione singola nota: fino a 50KB testo

### 4.4 Accessibilità
- Conformità WCAG 2.1 AA
- Supporto completo screen reader
- Navigazione completa da tastiera
- Shortcut personalizzabili
- Contrasto colori accessibile
- Font ridimensionabili

---

## 5. Modello di Business

### 5.1 Piano Unico
**Gratuito Forever**
- Tutte le funzionalità descritte incluse
- Nessun limite artificiale
- Nessun paywall
- Supporto community via forum/email

### 5.2 Modello di Sostenibilità
- Donazioni volontarie per sostenere il progetto
- Possibile introduzione futura di piano "Pro" con funzioni aggiuntive opzionali (non ancora definite)
- Focus primario: acquisire utenti e costruire fiducia

---

## 6. Metriche di Successo

### 6.1 Adozione
- Utenti registrati totali
- Tasso attivazione (utenti che salvano almeno 5 credenziali nei primi 7 giorni)
- Retention 30/60/90 giorni
- NPS (Net Promoter Score)

### 6.2 Utilizzo
- Numero medio credenziali per utente
- Distribuzione: password vs note vs development
- Utilizzo giornaliero/settimanale
- Numero password generate
- Utilizzo compilazione automatica
- Dispositivi medi per utente

### 6.3 Sicurezza
- Percentuale utenti con score sicurezza >70
- Password compromesse identificate e cambiate
- Adoption autenticazione biometrica
- Tempo medio per correggere problemi sicurezza

---

## 7. Roadmap

### 7.1 MVP (Mesi 1-3)
- Autenticazione con master password
- CRUD password base
- Generatore password
- Ricerca e cartelle
- Web app responsive
- Crittografia AES-256

### 7.2 Fase 2 (Mesi 4-6)
- Sincronizzazione cloud
- Estensione browser (Chrome/Firefox)
- Compilazione automatica
- Note sicure
- Dashboard sicurezza base
- Importazione CSV

### 7.3 Fase 3 (Mesi 7-9)
- App mobile (iOS e Android)
- Autenticazione biometrica
- Modalità Development completa
- Verifica Have I Been Pwned
- Import da altri password manager
- App desktop

### 7.4 Fase 4 (Mesi 10-12)
- Template API servizi comuni
- Backup automatico locale
- Audit miglioramenti sicurezza
- Export avanzato
- Perfezionamenti UX basati su feedback

---

## 8. Considerazioni Legali

### 8.1 Privacy
- Conformità GDPR completa
- Privacy policy trasparente e leggibile
- Zero data collection oltre necessario per funzionamento
- Diritto all'oblio implementato
- Export completo dati utente

### 8.2 Termini di Servizio
- Disclaimer esplicito: zero-knowledge significa zero recupero password
- Nessuna responsabilità per password dimenticate
- Limitazioni responsabilità per violazioni terze parti
- Politica open source (se applicabile)

### 8.3 Sicurezza
- Penetration testing regolare
- Bug bounty program (futuro)
- Incident response plan documentato
- Audit codice terze parti

---

## 9. Supporto

### 9.1 Documentazione
- FAQ estese su funzionamento
- Guide quick start per ogni piattaforma
- Best practices sicurezza password
- Guide import da altri servizi
- Spiegazione architettura zero-knowledge

### 9.2 Canali Supporto
- Email support (risposta entro 48h)
- Forum community
- Base conoscenza ricercabile
- Video tutorial per funzioni chiave

### 9.3 Best Practices Consigliate agli Utenti
- Usare master password unica (mai usata altrove)
- Attivare autenticazione biometrica dove disponibile
- Annotare master password in posto fisico sicuro
- Fare backup locale periodico
- Aggiornare password compromesse immediatamente
- Usare generatore per tutte le nuove password

---

**Fine del documento**