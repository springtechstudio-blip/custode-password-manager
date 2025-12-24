# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Custode** is an essential and secure password manager built with React, TypeScript, and Vite. The application provides three core features:
1. Password management with security scoring
2. Encrypted secure notes for sensitive information
3. Development vault for API keys and technical credentials

This is a mobile-first web application with a clean, modern UI featuring rounded corners, gradient designs, and smooth animations.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

## Architecture & Code Structure

### Application State Management
- The app uses React hooks (`useState`, `useEffect`) for state management
- No external state management library - all state is local to components
- Main state is managed in `App.tsx` with three primary data arrays:
  - `passwords`: PasswordEntry[]
  - `devKeys`: DevKey[]
  - `notes`: SecureNote[]

### Type System
All core types are defined in `types.ts`:
- **Category enum**: Defines navigation sections (PASSWORDS, NOTES, DEVELOPMENT, FAVORITES, SECURITY)
- **Environment enum**: For dev credentials (PRODUCTION, STAGING, DEVELOPMENT, TEST)
- **PasswordEntry**: Standard password credential with icon, url, username, password
- **SecureNote**: Encrypted notes with title, content, timestamps
- **DevKey**: Technical credentials with environment, type, key, expiry tracking

### Component Architecture

**Main App Component** (`App.tsx`):
- Mobile-first responsive layout (max-width: md, centered)
- Fixed header with user avatar and action buttons
- Search bar that filters based on active tab
- Main scrollable content area
- Fixed bottom navigation bar
- Floating action button (FAB) for adding entries
- Modal system for generators and add forms

**Reusable Components** (in `/components`):
- `PasswordCard.tsx`: Display individual password entries with copy functionality
- `DevKeyCard.tsx`: Show development credentials with environment badges
- `SecurityScoreCard.tsx`: Circular progress indicator for vault security score
- `GeneratorModal.tsx`: Password generation with customizable options
- `Onboarding.tsx`: Initial setup and master password creation

### UI/UX Patterns

**Design System**:
- Primary color: `#1E3A8A` (dark blue)
- Accent color: `#F97316` (orange)
- Rounded corners: Use `rounded-[2.5rem]` or `rounded-[2rem]` for major elements
- Hover states: Scale, color transitions, border changes
- Icons: All from `lucide-react` library
- Font weights: Bold for headings, medium for body text
- Background: `#F8F9FA` (light gray)

**Animation Classes**:
- Use Tailwind's `animate-in`, `fade-in`, `slide-in-from-bottom-4` for entry animations
- `duration-500` for smooth transitions
- `hover:scale-110` and `active:scale-95` for interactive elements

**Navigation Pattern**:
- Bottom tab bar with 4 sections (Home, Security, Dev, Notes)
- FAB in center for quick add actions
- Active state shown with color change and dot indicator

### Key Implementation Details

**Icon Loading**:
- Password entries fetch favicons using Google's favicon service
- Fallback to first letter of service name if no URL provided
- Pattern: `https://www.google.com/s2/favicons?domain=${url}&sz=128`

**ID Generation**:
- Uses `Math.random().toString(36).substr(2, 9)` for all new entries
- Timestamp stored as `Date.now()` for sorting and display

**Search/Filter Logic**:
- Search is case-insensitive using `.toLowerCase()`
- Searches across name, username, title, content depending on active tab
- Results sorted by `lastModified` (most recent first)

**Modal System**:
- Full-screen backdrop with blur effect
- Bottom sheet style for mobile (slide up animation)
- Close on backdrop click or X button
- Form submission adds to appropriate array and closes modal

## Configuration Files

**vite.config.ts**:
- Development server runs on port 3000, host 0.0.0.0
- Loads `GEMINI_API_KEY` from .env.local file
- Path alias `@/` points to project root
- React plugin configured

**tsconfig.json**:
- Target: ES2022
- JSX: react-jsx (React 17+ transform)
- Bundler module resolution
- Path alias configured: `@/*` → `./*`
- No emit (Vite handles bundling)

## Project Context (from PRD.md)

The PRD defines a comprehensive password manager with:
- AES-256 encryption and zero-knowledge architecture
- Master password with no recovery option (by design)
- Biometric authentication support
- Have I Been Pwned integration for compromised password detection
- Multi-device sync with offline support
- Browser extension for auto-fill
- Security dashboard with password health scoring

**Current MVP Status**: The codebase implements the basic UI/UX and component structure. Encryption, sync, and advanced security features are planned for future phases.

## Implementation Workflow - MANDATORY PROCESS

### Feature Development Protocol

**BEFORE implementing ANY new feature or functionality, you MUST follow this protocol:**

1. **Verify Current Date/Time**: Always check the current date first to ensure accurate documentation
   ```bash
   # On Windows
   powershell -Command "Get-Date -Format 'yyyy-MM-dd'"
   ```

2. **Create Project Document**: Create a detailed implementation document in `/docs` folder
   - **Naming Convention**: `YYYY-MM-DD-feature-name.md` (e.g., `2025-12-22-password-strength-meter.md`)
   - **Required Sections**:
     - **Obiettivo**: What problem does this solve? What will be implemented?
     - **Architettura**: Technical approach, components affected, data flow
     - **File Modificati**: List of files to be created/modified
     - **Dipendenze**: New packages or dependencies needed
     - **Testing**: How to test the feature
     - **Note di Sicurezza**: Any security considerations (if applicable)

3. **Wait for User Approval**: Present the document to the user and **WAIT for explicit confirmation** before proceeding with implementation

4. **Implementation**: Only after approval, proceed with coding

5. **Update Documentation**: After implementation, update IMPLEMENTATION_STATUS.md

**Example Workflow**:
```
User: "Add password strength meter"
Assistant: "Prima di implementare, creo il documento di progetto..."
[Creates /docs/2025-12-22-password-strength-meter.md]
Assistant: "Ho creato il documento di progetto. Posso procedere con l'implementazione?"
User: "Sì, procedi"
[Implementation begins]
```

### When This Protocol Applies

- ✅ New features (password strength meter, import/export, etc.)
- ✅ Major refactoring (changing architecture, moving files)
- ✅ Security implementations (new encryption methods, auth changes)
- ✅ Database schema changes
- ❌ Bug fixes (no document needed, fix directly)
- ❌ Typos or minor text changes
- ❌ Documentation updates

## Important Notes

- **Current Status**: Phase 1 Foundation Complete - Encryption, Auth, and Database implemented ✅
- **Data Storage**: Encrypted vault in Supabase with client-side AES-256-GCM encryption
- **Authentication**: Supabase Auth with master password (zero-knowledge architecture)
- **Real-time Sync**: Implemented via Supabase Realtime subscriptions
- **Mobile-first design**: Desktop responsiveness may need enhancement
- **Italian language** used throughout UI (per PRD specification)
- **Dev Server**: Runs on port 3002 (3000-3001 may be occupied)
