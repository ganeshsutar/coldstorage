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
│   └── authentication/  # Custom User model, auth views
└── manage.py            # Django CLI entry point
```

### API Communication

- Frontend uses session-based auth with CSRF protection
- API client at `frontend/src/lib/api-client.ts` handles CSRF tokens and credentials
- Backend API routes prefixed with `/api/` (e.g., `/api/auth/login/`)
- CORS configured for `localhost:5173` (Vite dev server)

## Design System

Full specification at `docs/src/ui-ux-specification.md`.

### Configuration

| Setting | Value |
|---------|-------|
| Style Preset | Vega (standard shadcn/ui) |
| Base Color | Zinc (cool grays) |
| Border Radius | 0.5rem (8px) |
| Font | Inter |
| Icons | Lucide |

### Layout Dimensions

| Element | Value |
|---------|-------|
| Header height | 56px |
| Sidebar (expanded) | 256px |
| Sidebar (collapsed) | 64px |
| Content padding | 24px |
| Content max-width | 1440px |

### Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640-1023px | Collapsible sidebar |
| Desktop | 1024-1279px | Full sidebar |
| Large | ≥ 1280px | Max-width container |

### Component Defaults

- **Button:** h-9 (36px), px-2.5, radius-md
- **Input:** h-9 (36px), px-2.5, 1px border
- **Card:** px-6, gap-6, shadow-sm
- **Focus ring:** 2px width, 2px offset

### Semantic Colors

Use CSS variables for theming (light/dark mode support):
- `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`
- `--background`, `--foreground`, `--border`, `--input`, `--ring`
- Status: Success (green #22c55e), Warning (amber #f59e0b), Error (red #ef4444), Info (blue #3b82f6)

## Verification

- **Frontend:** Run `npm run lint` to verify frontend code (faster than full build)

## Code Conventions

- **Imports:** Use `@/` alias for `frontend/src/` paths
- **TypeScript:** Strict mode with `noUnusedLocals` and `noUnusedParameters`
- **Forms:** react-hook-form with Zod schema validation
- **Styling:** Tailwind CSS with `cn()` utility for conditional classes
- **Python:** Managed via uv lockfile, settings loaded from environment variables
