# 🚀 Guida alla Pubblicazione di Custode

Questa guida ti spiega come pubblicare **Custode** gratuitamente e renderla installabile su PC e telefono.

## 📋 Prerequisiti

1. **Account GitHub** (gratuito): https://github.com/signup
2. **Account Vercel** (gratuito): https://vercel.com/signup
3. **Git installato** sul tuo PC: https://git-scm.com/downloads

---

## 🎨 STEP 1: Creare le Icone dell'App

Prima di pubblicare, devi creare le icone per l'app. Puoi usare un servizio online gratuito:

### Opzione A: Usa Canva (consigliato)
1. Vai su https://www.canva.com
2. Crea un design 512x512px
3. Disegna un'icona per Custode (es: uno scudo o una chiave)
4. Scarica come PNG
5. Vai su https://realfavicongenerator.net
6. Carica l'immagine e genera le icone
7. Scarica e metti i file `icon-192.png` e `icon-512.png` nella cartella `public/`

### Opzione B: Icona Temporanea
Per ora, puoi usare un'icona temporanea:
1. Vai su https://via.placeholder.com/512/1E3A8A/FFFFFF?text=C
2. Salva l'immagine come `icon-512.png` in `public/`
3. Ridimensionala a 192x192 e salvala come `icon-192.png`

---

## 🌐 STEP 2: Inizializzare Git e Pushare su GitHub

Apri il Prompt dei comandi (CMD) nella cartella del progetto e esegui:

```bash
# 1. Inizializza Git
git init

# 2. Aggiungi tutti i file
git add .

# 3. Fai il primo commit
git commit -m "Initial commit - Custode Password Manager"

# 4. Vai su GitHub e crea un nuovo repository
#    Nome: custode-password-manager
#    Tipo: Public
#    NON aggiungere README, .gitignore o licenza

# 5. Collega il repository locale a GitHub (sostituisci TUO_USERNAME)
git remote add origin https://github.com/TUO_USERNAME/custode-password-manager.git

# 6. Pusha il codice
git branch -M main
git push -u origin main
```

**✅ Fatto!** Il tuo codice è ora su GitHub.

---

## ☁️ STEP 3: Deploy su Vercel

### 3.1 Collega GitHub a Vercel

1. Vai su https://vercel.com
2. Clicca **"Sign Up"** e scegli **"Continue with GitHub"**
3. Autorizza Vercel ad accedere al tuo account GitHub

### 3.2 Importa il Progetto

1. Nella dashboard di Vercel, clicca **"Add New..."** → **"Project"**
2. Trova il repository `custode-password-manager`
3. Clicca **"Import"**
4. **Framework Preset**: Vercel dovrebbe rilevare automaticamente **Vite**
5. **Environment Variables**: Aggiungi:
   - Nome: `VITE_SUPABASE_URL`
   - Valore: Il tuo URL Supabase (da Supabase Dashboard)
   - Nome: `VITE_SUPABASE_ANON_KEY`
   - Valore: La tua chiave anonima Supabase
6. Clicca **"Deploy"**

### 3.3 Attendi il Deploy

- Vercel inizierà a buildare l'app (circa 1-2 minuti)
- Quando finisce vedrai **"Congratulations! 🎉"**
- Riceverai un URL tipo: `https://custode-password-manager.vercel.app`

**✅ L'app è ora online!**

---

## 📱 STEP 4: Installare l'App su Mobile

### Android (Chrome/Edge)

1. Apri l'app nel browser Chrome
2. Clicca sui **tre puntini** in alto a destra
3. Seleziona **"Installa app"** o **"Aggiungi a schermata Home"**
4. Conferma l'installazione
5. L'icona di Custode apparirà come un'app nativa!

### iPhone/iPad (Safari)

1. Apri l'app in Safari
2. Tocca il pulsante **"Condividi"** (quadrato con freccia)
3. Scorri e seleziona **"Aggiungi a Home"**
4. Tocca **"Aggiungi"**
5. L'app è ora installata come app nativa!

---

## 💻 STEP 5: Installare l'App su PC

### Windows/Mac (Chrome/Edge)

1. Apri l'app nel browser
2. Guarda la barra degli indirizzi: vedrai un'icona **"Installa"** (⊕)
3. Clicca sull'icona
4. Clicca **"Installa"**
5. L'app si apre in una finestra separata!

**Puoi anche:**
- Avviarla dal menu Start (Windows)
- Avviarla da Spotlight (Mac)
- Fissarla nella barra delle applicazioni

---

## 🔄 STEP 6: Modificare e Aggiornare l'App

Ogni volta che vuoi modificare l'app:

```bash
# 1. Fai le modifiche al codice

# 2. Salva e testa in locale
npm run dev

# 3. Quando sei soddisfatto, committa le modifiche
git add .
git commit -m "Descrizione delle modifiche"

# 4. Pusha su GitHub
git push

# 5. Vercel rileverà automaticamente il push e farà il deploy!
#    In 1-2 minuti l'app sarà aggiornata
```

**✨ Deploy automatico!** Ogni push su GitHub aggiorna automaticamente l'app online.

---

## 🎯 Cosa Hai Ottenuto

✅ **App online 24/7** su https://tuodominio.vercel.app
✅ **HTTPS gratuito** (sicuro per password manager)
✅ **Installabile** come app nativa su Android, iOS, Windows, Mac
✅ **Funziona offline** grazie al Service Worker
✅ **Deploy automatico** ad ogni modifica
✅ **Completamente gratuito** (Vercel free tier è generoso)
✅ **Modificabile facilmente** con Git

---

## 🔧 Comandi Utili

```bash
# Vedere lo stato di Git
git status

# Vedere l'history dei commit
git log --oneline

# Creare un nuovo branch per sperimentare
git checkout -b nuova-feature

# Tornare al branch main
git checkout main

# Vedere le differenze rispetto all'ultimo commit
git diff
```

---

## 🆘 Problemi Comuni

### "Git non è riconosciuto come comando"
- Installa Git: https://git-scm.com/downloads
- Riavvia il Prompt dei comandi

### "Remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TUO_USERNAME/repo.git
```

### "Build fallita su Vercel"
- Controlla che `npm run build` funzioni in locale
- Verifica che le environment variables siano corrette
- Guarda i log su Vercel per vedere l'errore specifico

### "L'app non si installa"
- Assicurati che l'app sia servita su HTTPS (Vercel lo fa automaticamente)
- Controlla che i file `manifest.json` e `sw.js` siano nella cartella `public/`
- Prova a fare hard refresh (Ctrl+F5)

---

## 🎓 Prossimi Passi

1. **Custom Domain** (opzionale): Puoi collegare un dominio personalizzato (es: custode.com) nelle impostazioni di Vercel
2. **Analytics**: Aggiungi Vercel Analytics per vedere quante persone usano l'app
3. **Performance**: Usa Lighthouse in Chrome DevTools per ottimizzare le performance

---

## 📞 Supporto

- **Documentazione Vercel**: https://vercel.com/docs
- **Documentazione Git**: https://git-scm.com/doc
- **PWA Best Practices**: https://web.dev/progressive-web-apps/

---

**Buona pubblicazione! 🚀**
