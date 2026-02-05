# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cold Storage is a full-stack web application with a monorepo structure containing a Django REST Framework backend and a React/TypeScript/Vite frontend with TanStack Router.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7, TanStack Router, Tailwind CSS 4, Radix UI, react-hook-form + Zod
- **Backend:** Python 3.11, Django 5.2, Django REST Framework, PostgreSQL
- **Package Managers:** npm (frontend), uv (backend)

## Commands

### Frontend (from `frontend/` directory)

```bash
npm install              # Install dependencies
npm run dev              # Start dev server on http://localhost:5173
npm run build            # TypeScript check + Vite build
npm run lint             # Run ESLint
```

### Backend (from `backend/` directory)

```bash
uv sync                           # Install dependencies
uv run python manage.py runserver # Start Django dev server on http://localhost:8000
uv run python manage.py migrate   # Apply database migrations
uv run python manage.py makemigrations # Create new migrations
```

## Architecture

### Frontend Structure

```
frontend/src/
├── app/                 # App shell (provider.tsx, router.tsx)
├── components/
│   ├── ui/              # Reusable UI primitives (Button, Card, Dialog, etc.)
│   ├── layout/          # App shell components (sidebar, header)
│   ├── layouts/         # Page layouts (AuthLayout, DashboardLayout)
│   └── auth/            # Auth-specific components (forms)
├── routes/              # Page components organized by route
│   ├── auth/            # /auth/* pages
│   └── app/             # /app/* pages (protected)
├── features/            # Feature modules (auth, billing, inventory, warehouse, masters, etc.)
├── services/            # API service functions
├── stores/              # React context providers (auth-store, ui-store)
├── hooks/               # Custom hooks (useAuth, useTheme, useDebounce)
├── lib/                 # Utilities (api-client, utils)
├── config/              # Configuration (env, constants, navigation)
└── types/               # TypeScript type definitions
```

### Backend Structure

```
backend/
├── config/              # Django project settings
│   ├── settings.py      # Main config (uses .env for secrets)
│   └── urls.py          # Root URL routing
├── apps/                # Django apps
│   ├── authentication/  # Custom User model, org membership, auth views
│   ├── accounting/      # Financial transactions, ledgers
│   ├── billing/         # Invoicing, payments
│   ├── inventory/       # Stock tracking, commodities
│   ├── masters/         # Reference data (parties, commodities, etc.)
│   ├── system/          # System-level settings and configuration
│   └── warehouse/       # Rooms, chambers, storage management
└── manage.py            # Django CLI entry point
```

### API Communication

- Session-based auth with CSRF protection
- API client handles CSRF tokens automatically via cookies
- Backend API routes prefixed with `/api/` (e.g., `/api/auth/login/`, `/api/billing/`, `/api/masters/`)
- CORS configured for `localhost:5173` (Vite dev server)

## Design System

Full specification at `docs/src/ui-ux-specification.md`.

| Setting | Value |
|---------|-------|
| Style Preset | Vega (standard shadcn/ui) |
| Base Color | Zinc (cool grays) |
| Border Radius | 0.5rem (8px) |
| Font | Inter |
| Icons | Lucide |

### Layout Dimensions

- Header height: 56px
- Sidebar expanded: 256px, collapsed: 64px
- Content padding: 24px, max-width: 1440px

### Semantic Colors

Use CSS variables for theming: `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--background`, `--foreground`, `--border`, `--input`, `--ring`

## Verification

- **Frontend:** Run `npm run lint` to verify frontend code (faster than full build)

## Code Conventions

- **Imports:** Use `@/` alias for `frontend/src/` paths
- **TypeScript:** Strict mode with `noUnusedLocals` and `noUnusedParameters`
- **Forms:** react-hook-form with Zod schema validation
- **Styling:** Tailwind CSS with `cn()` utility for conditional classes
- **Python:** Managed via uv lockfile, settings loaded from environment variables
