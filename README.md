# DCIMS — Data Center & Inventory Management System

An enterprise-style Data Center & Inventory Management System built as a fully client-side React application. There is no real backend — all data lives in seeded JSON files under `src/database/` and is served through an async service layer that simulates a REST API (randomized latency, in-memory CRUD, occasional simulated failures).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + hand-authored shadcn/ui-style components (Radix primitives)
- React Router v7
- TanStack Table (sorting, filtering, pagination, row selection)
- React Hook Form + Zod
- Recharts (dashboard KPIs, utilization trends, live monitoring)
- Framer Motion (page/section transitions)
- Lucide Icons

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

### Demo accounts

| Role  | Email             | Password    |
|-------|-------------------|-------------|
| Admin | admin@dcims.io    | Admin@123   |
| User  | user@dcims.io     | User@123    |

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and build for production into `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint
- `node scripts/generate-mock-data.mjs` — regenerate the mock datasets in `src/database/` (100 users, 200 clusters, 150 customer assets, 300 alerts, 150 requests, 500 monitoring records)

## Modules

Login · Dashboard · Cluster Management · Customer Asset Management · Cluster Request Management · Customer Asset Request Management · Live Monitoring · Alerts Management · User Management (Admin) · Profile · Settings

## Project structure

```
src/
  database/     mock JSON "backend" — only ever imported by services/
  services/     simulated REST layer (the only code that touches database/)
  contexts/     Auth, Theme, Density, Notification providers
  hooks/        shared hooks (pagination, debounce, confirm dialog, toast, etc.)
  components/   ui/ (primitives), common/ (DataTable, KpiCard, ...), charts/, layout/
  layouts/      AuthLayout, DashboardLayout
  routes/       router + role-based route guards
  pages/        one folder per module
  lib/          cn, csv, format, constants, zod validators
```

## Deployment

The app is a static SPA. `vercel.json` includes the client-side routing rewrite, so it deploys on Vercel out of the box — framework preset "Vite", no environment variables required.
