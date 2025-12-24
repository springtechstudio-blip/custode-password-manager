# Custode - Responsive Desktop & Tablet Layout

**Data**: 22 Dicembre 2025, 22:01
**Tipo**: Feature - UI/UX Enhancement
**Priorità**: Alta
**Stato**: In Approvazione

---

## 📋 Obiettivo

Trasformare Custode da un'applicazione **mobile-first** a un'applicazione **responsive completa** che offra un'esperienza ottimale su:
- 📱 **Mobile** (320px - 767px) - Design attuale
- 📱 **Tablet** (768px - 1024px) - Layout a 2 colonne
- 💻 **Desktop** (1025px+) - Layout a 3 colonne con sidebar

### Problema Attuale

L'app usa `max-w-md` (max-width: 448px) su tutti i dispositivi:
```tsx
<div className="min-h-screen max-w-md mx-auto bg-white">
```

Su desktop/tablet, questo crea una colonna stretta al centro con molto spazio sprecato ai lati.

### Soluzione Proposta

Implementare **3 layout responsive**:
1. **Mobile**: Layout attuale (single column, bottom nav)
2. **Tablet**: 2 colonne (sidebar + contenuto)
3. **Desktop**: 3 colonne (sidebar, contenuto principale, pannello info)

---

## 🎨 Design Layouts

### Mobile (< 768px) - CURRENT
```
┌─────────────────┐
│   Header        │
├─────────────────┤
│                 │
│   Content       │
│   (scrollable)  │
│                 │
├─────────────────┤
│  Bottom Nav     │
└─────────────────┘
```

### Tablet (768px - 1024px) - NEW
```
┌───────┬─────────────────────┐
│       │   Header            │
│ Side  ├─────────────────────┤
│ bar   │                     │
│       │   Content           │
│       │   (scrollable)      │
│       │                     │
└───────┴─────────────────────┘
```

### Desktop (1025px+) - NEW
```
┌───────┬─────────────────┬─────────┐
│       │   Header        │  Info   │
│ Side  ├─────────────────┤  Panel  │
│ bar   │                 │         │
│       │   Content       │ Security│
│       │   (scrollable)  │  Score  │
│       │                 │         │
│       │                 │ Quick   │
│       │                 │ Actions │
└───────┴─────────────────┴─────────┘
```

---

## 🏗️ Architettura

### Componenti da Creare

#### 1. `components/layout/Sidebar.tsx`
Sidebar verticale per tablet/desktop con:
- Logo Custode
- Navigazione (Passwords, Notes, Dev, Security)
- Security Score badge
- Logout button
- User info

#### 2. `components/layout/DesktopHeader.tsx`
Header per desktop con:
- Search bar centrale (più grande)
- Quick actions (Generator, Add)
- User avatar + dropdown

#### 3. `components/layout/InfoPanel.tsx` (solo desktop)
Pannello destro con:
- Security Score Card (grande)
- Quick stats (# passwords, # notes, ecc.)
- Recent activity
- Quick actions

#### 4. `components/layout/ResponsiveLayout.tsx`
Wrapper che gestisce i 3 layout in base alla screen size

### Componenti da Modificare

#### `App.tsx`
- Rimuovere `max-w-md`
- Wrappare con `ResponsiveLayout`
- Gestire bottom nav solo su mobile

---

## 📁 File Modificati

### Nuovi File
```
components/
  layout/
    Sidebar.tsx              # Sidebar verticale
    DesktopHeader.tsx        # Header desktop
    InfoPanel.tsx            # Pannello info destro
    ResponsiveLayout.tsx     # Layout wrapper
    MobileLayout.tsx         # Layout mobile (estratto da App.tsx)
```

### File Modificati
```
App.tsx                      # Refactor per usare ResponsiveLayout
index.html                   # Meta viewport updates
```

---

## 🎨 Breakpoints Tailwind

```typescript
// Tailwind default breakpoints
sm: 640px   // Small devices
md: 768px   // Tablets
lg: 1024px  // Small desktops
xl: 1280px  // Large desktops
2xl: 1536px // Extra large

// Nostri breakpoints
Mobile:  < 768px   (default)
Tablet:  768px - 1024px   (md:)
Desktop: >= 1024px        (lg:)
```

---

## 🔧 Implementazione Dettagliata

### Step 1: Create Sidebar Component

```tsx
// components/layout/Sidebar.tsx
interface SidebarProps {
  currentCategory: Category;
  onCategoryChange: (category: Category) => void;
  securityScore: number;
  onLogout: () => void;
}

export function Sidebar({ currentCategory, onCategoryChange, securityScore, onLogout }: SidebarProps) {
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <Shield className="text-orange-500" size={32} />
          <h1 className="text-xl font-bold">Custode</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavItem icon={Key} label="Password" active={currentCategory === Category.PASSWORDS} />
        <NavItem icon={FileText} label="Note" active={currentCategory === Category.NOTES} />
        <NavItem icon={Code} label="Development" active={currentCategory === Category.DEVELOPMENT} />
        <NavItem icon={Shield} label="Security" active={currentCategory === Category.SECURITY} />
      </nav>

      {/* Security Score */}
      <div className="p-4 border-t">
        <SecurityScoreCard score={securityScore} compact />
      </div>

      {/* User & Logout */}
      <div className="p-4 border-t">
        <button onClick={onLogout} className="w-full flex items-center gap-2 text-red-600">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
```

### Step 2: Create ResponsiveLayout

```tsx
// components/layout/ResponsiveLayout.tsx
export function ResponsiveLayout({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && <Sidebar {...props} />}

      {/* Main Content */}
      <main className="flex-1 md:ml-0">
        {children}
      </main>

      {/* Info Panel - Only on desktop */}
      {!isMobile && !isTablet && <InfoPanel {...props} />}
    </div>
  );
}
```

### Step 3: Refactor App.tsx

```tsx
// Before
<div className="min-h-screen max-w-md mx-auto bg-white">

// After
<ResponsiveLayout
  currentCategory={currentCategory}
  onCategoryChange={setCurrentCategory}
  securityScore={securityScore}
>
  <div className="min-h-screen bg-white md:bg-gray-50">
    {/* Mobile header */}
    <header className="md:hidden ...">

    {/* Desktop header */}
    <header className="hidden md:flex ...">

    {/* Content area - full width on desktop */}
    <div className="md:max-w-none md:p-6">
      {/* ... */}
    </div>

    {/* Bottom nav - only on mobile */}
    <nav className="md:hidden ...">
  </div>
</ResponsiveLayout>
```

---

## 📊 Features per Layout

### Mobile (< 768px)
- ✅ Bottom navigation (5 tabs)
- ✅ Fixed header con search
- ✅ Floating Action Button
- ✅ Full-screen modals
- ✅ Swipe gestures (future)

### Tablet (768px - 1024px)
- ✅ Sidebar navigation (sinistra)
- ✅ Header ridotto (no bottom nav)
- ✅ Content area più largo
- ✅ Grid 2 colonne per cards
- ❌ No info panel

### Desktop (1025px+)
- ✅ Sidebar navigation (sinistra)
- ✅ Info panel (destra)
- ✅ Header desktop completo
- ✅ Grid 3 colonne per cards
- ✅ Shortcuts da tastiera
- ✅ Hover states avanzati

---

## 🎯 Grid System

### Password Cards

**Mobile**: 1 colonna
```tsx
<div className="space-y-4">
```

**Tablet**: 2 colonne
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

**Desktop**: 3 colonne
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 🧪 Testing

### Test Breakpoints
1. **Mobile**: 375px (iPhone SE), 414px (iPhone Pro Max)
2. **Tablet**: 768px (iPad), 820px (iPad Air)
3. **Desktop**: 1024px, 1280px, 1920px

### Test Checklist
- [ ] Sidebar appare su tablet/desktop
- [ ] Bottom nav nascosto su tablet/desktop
- [ ] Info panel appare solo su desktop (>1024px)
- [ ] Cards disposte in grid corrette per ogni breakpoint
- [ ] Header responsive
- [ ] Search bar funziona su tutte le dimensioni
- [ ] Modals responsive
- [ ] Logout funziona da sidebar
- [ ] Navigation funziona da sidebar

---

## ⚡ Performance

### Considerazioni
- **Lazy loading**: Info panel caricato solo su desktop
- **Media queries**: CSS-based (non JS) per performance
- **Grid auto**: Usare CSS Grid invece di flexbox per layout complessi
- **Images**: Favicon caching già implementato

---

## 🔒 Note di Sicurezza

Nessun impatto sulla sicurezza. Questo è puramente UI/UX.

- ✅ Encryption key management non cambia
- ✅ Vault storage non cambia
- ✅ Auth flow non cambia

---

## 📦 Dipendenze

**Nessuna nuova dipendenza richiesta!**

Usiamo solo Tailwind CSS che è già installato.

---

## 🚀 Piano di Rollout

### Phase 1: Tablet Support (1-2 ore)
1. Creare Sidebar component
2. Nascondere bottom nav su tablet
3. Aggiungere grid 2 colonne
4. Test su iPad

### Phase 2: Desktop Support (2-3 ore)
1. Creare InfoPanel component
2. Aggiungere DesktopHeader
3. Grid 3 colonne
4. Shortcuts tastiera (opzionale)
5. Test su desktop

### Phase 3: Polish (1 ora)
1. Animazioni transizioni
2. Hover states
3. Focus states (accessibility)
4. Final testing

**Tempo Totale Stimato**: 4-6 ore

---

## 🎨 UI Mockup Details

### Sidebar Width
- **Collapsed**: 64px (icon only) - future
- **Expanded**: 256px (default)

### Info Panel Width
- **Desktop**: 320px
- **Large Desktop (>1536px)**: 384px

### Content Area
- **Mobile**: 100% width
- **Tablet**: calc(100% - 256px) (sidebar width)
- **Desktop**: calc(100% - 256px - 320px) (sidebar + info panel)

---

## ✅ Success Criteria

**Tablet (768px - 1024px)**:
- [ ] Sidebar visibile e funzionante
- [ ] Bottom nav nascosta
- [ ] Cards in grid 2 colonne
- [ ] Tutto il contenuto accessibile

**Desktop (1025px+)**:
- [ ] Sidebar + Info panel visibili
- [ ] Cards in grid 3 colonne
- [ ] Security score ben visibile in info panel
- [ ] Quick actions facilmente accessibili
- [ ] Utilizzo efficiente dello spazio schermo

**Mobile (< 768px)**:
- [ ] Layout corrente funziona ancora perfettamente
- [ ] Nessuna regressione

---

## 🔄 Backwards Compatibility

✅ **Piena compatibilità**: Il layout mobile rimane identico. Utenti mobile non vedranno cambiamenti.

---

## 📝 Note Implementazione

### Tailwind Classes Chiave

```css
/* Nascondere su mobile, mostrare su tablet+ */
.hidden md:block

/* Sidebar responsive */
.w-0 md:w-64 lg:w-72

/* Content padding responsive */
.p-4 md:p-6 lg:p-8

/* Grid responsive */
.grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

### Gestione State

Nessun nuovo state necessario. Usiamo solo:
- CSS media queries per layout
- Existing props passati ai nuovi componenti

---

## 🐛 Potential Issues

### Issue 1: Fixed Header + Sidebar
**Problema**: Header fisso + sidebar può creare sovrapposizioni
**Soluzione**: Usare `sticky` invece di `fixed`, gestire z-index

### Issue 2: Bottom Nav Transition
**Problema**: Bottom nav che scompare improvvisamente su resize
**Soluzione**: CSS transition smooth

### Issue 3: Modal su Desktop
**Problema**: Modals full-screen su desktop sono troppo grandi
**Soluzione**: Max-width su desktop, center-aligned

---

## 🎯 Future Enhancements (Post-MVP)

- [ ] Sidebar collapsible (icon-only mode)
- [ ] Dark mode per desktop
- [ ] Drag & drop tra colonne
- [ ] Multi-window support
- [ ] Keyboard shortcuts avanzati
- [ ] Custom grid layouts (utente configura)

---

**Pronto per implementazione?** Aspetto la tua conferma per procedere! 🚀
