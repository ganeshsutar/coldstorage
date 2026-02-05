# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cold Storage (ColdVault) is a full-stack web application for cold storage facility management — handling inventory, billing, warehouse operations, trading, loans, and accounting. Monorepo with Django REST Framework backend and React/TypeScript/Vite frontend.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 7, TanStack Router, TanStack React Query, Tailwind CSS 4, shadcn/ui (Radix), react-hook-form + Zod
- **Backend:** Python 3.11, Django 5.2, Django REST Framework, PostgreSQL
- **Package Managers:** npm (frontend), uv (backend)

## Commands

### Frontend (from `frontend/` directory)

```bash
npm install              # Install dependencies
npm run dev              # Start dev server on http://localhost:5173
npm run build            # TypeScript check + Vite build
npm run lint             # Run ESLint (preferred for verification — faster than build)
```

### Backend (from `backend/` directory)

```bash
uv sync                                    # Install dependencies
uv run python manage.py runserver          # Start Django dev server on http://localhost:8000
uv run python manage.py migrate            # Apply database migrations
uv run python manage.py makemigrations     # Create new migrations
uv run python manage.py makemigrations <app_name>  # Create migrations for specific app
```

**Note:** No test infrastructure exists yet (no pytest/vitest). Verification is via `npm run lint` (frontend) and running the dev server (backend).

## Architecture

### Backend Apps

All apps live in `backend/apps/`. Each app follows the same structure: `models.py`, `serializers.py`, `views.py`, `services.py`, `urls.py`, `admin.py`.

| App | Purpose | API Prefix |
|-----|---------|------------|
| authentication | Custom User model, Organization, OrganizationMembership, auth views | `/api/auth/` |
| accounting | Chart of Accounts (tree), PartyLedger, Daybook, Interest Calculations | `/api/accounting/` |
| inventory | Amad (receipts), Nikasi (dispatch), Commodity config, Takpatti | `/api/inventory/` |
| warehouse | Loading/Unloading/Shifting, Rack occupancy, Temperature monitoring | `/api/warehouse/` |
| masters | Reference data: Parties, Commodities, GstRate | `/api/masters/` |
| billing | RentBill, Receipt, ChargeComponent, GstType (INTRA/INTER) | `/api/billing/` |
| bardana | Bardana Issue/Return vouchers, stock tracking | `/api/bardana/` |
| trading | Sauda (deals), GatePass, Grading, DealStatus | `/api/trading/` |
| loans | Advances, Loans, LoanRepayment, LoanLedger | `/api/loans/` |
| system | System-level settings and configuration | `/api/system/` |

**INSTALLED_APPS order matters** — new apps go after `trading` and before `system`.

### Backend Patterns

- **Multi-tenancy:** `OrganizationMixin` (defined in `apps.accounting.views`) filters querysets by user's active organization. All ViewSets inherit from it.
- **UUID primary keys** on all models, with `organization = FK(Organization, CASCADE)`.
- **Auto-number generation:** `PREFIX/YYYY-NNNNN` pattern (e.g., `KB/2025-00001`). Implemented in each model's `_generate_*_no()` method, called in `save()`.
- **Triple serializer pattern:** `<Model>ListSerializer`, `<Model>DetailSerializer`, `<Model>CreateSerializer` for each model.
- **Services layer:** Business logic in `services.py` with `@transaction.atomic` on mutation functions.
- **PartyLedger:** Entries created in services with `VoucherType` (DR/CR/JV/CV/BH). Always call `party.recalculate_balance()` after ledger mutations.
- **Session-based auth** with CSRF protection. CSRF token endpoint at `/api/auth/csrf-token/`.

### Frontend Structure

```
frontend/src/
├── app/                 # App shell: provider.tsx (QueryClient→Auth→UI), router.tsx
├── components/
│   ├── ui/              # shadcn/ui primitives (Button, Card, Dialog, Table, etc.)
│   ├── layout/          # Sidebar, Header
│   └── layouts/         # AuthLayout, DashboardLayout
├── routes/app/<name>/   # Page components wrapped in DashboardLayout
├── features/<name>/     # Feature modules: api/, hooks/, types/, utils/, components/, index.ts
├── stores/              # Context providers: auth-store, ui-store, organization-store
├── lib/                 # api-client.ts (fetch wrapper with CSRF), utils.ts (cn())
├── config/              # navigation.ts, env.ts (VITE_API_URL), constants.ts
└── types/               # Shared TypeScript types
```

### Frontend Patterns

- **Router:** TanStack Router with flat route definitions in `frontend/src/app/router.tsx`. All routes use `getParentRoute: () => rootRoute`. 60+ routes.
- **API client:** `apiClient` from `@/lib/api-client` — wraps fetch with CSRF token handling, session cookies (`credentials: include`), methods: `get`, `post`, `patch`, `delete`.
- **Hooks:** Follow `use<Entity>(filters?)` and `use<Entity>Detail(id)` patterns using `useState`/`useCallback`/`useEffect`.
- **Navigation:** Configured in `frontend/src/config/navigation.ts` — `mainNavItems`, `operationsNavItems`, `systemNavItems`, `quickCreateItems`.
- **Page routes:** Each page in `routes/app/<name>/` wraps content in `<DashboardLayout activeNavItemId="...">`.
- **Formatting:** `formatCurrency()` → en-IN INR, `formatDate()` → en-IN dd-MMM-yyyy.

### Adding a New Feature (Checklist)

**Backend:**
1. Create app in `backend/apps/<name>/` with models, serializers (List/Detail/Create), views (OrganizationMixin), services, urls
2. Add to `INSTALLED_APPS` in `backend/config/settings.py` (after trading, before system)
3. Add URL route in `backend/config/urls.py`: `path("api/<name>/", include("apps.<name>.urls"))`
4. Run `makemigrations` and `migrate`

**Frontend:**
1. Create feature in `frontend/src/features/<name>/` with types/, api/, hooks/, components/, index.ts
2. Create route pages in `frontend/src/routes/app/<name>/`
3. Add routes to `frontend/src/app/router.tsx` (flat, `getParentRoute: () => rootRoute`)
4. Add navigation entry in `frontend/src/config/navigation.ts`

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

## Code Conventions

- **Imports:** Use `@/` alias for `frontend/src/` paths
- **TypeScript:** Strict mode with `noUnusedLocals` and `noUnusedParameters`
- **Forms:** react-hook-form with Zod schema validation
- **Styling:** Tailwind CSS with `cn()` utility for conditional classes
- **Badge variants:** `"default"` | `"secondary"` | `"destructive"` | `"outline"`
- **Python:** Managed via uv lockfile, settings loaded from environment variables

## Verification

- **Frontend:** Run `npm run lint` from `frontend/` to verify (faster than full build)
- **Known issue:** `npm run build` has pre-existing TS errors in billing/warehouse/system features — lint still passes
