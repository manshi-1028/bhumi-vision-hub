# BhoomiSetu — Land Governance Intelligence Platform

Prototype for **SIH26019**: *National Digital Platform for Research, Policy
Innovation, and Evidence-Based Land Governance* (Ministry of Rural
Development, Department of Land Resources).

**Live demo:** https://bhoomisetu.freebuff.app
**Demo login:** any of `researcher@…`, `institution@…`, `official@…` ·
password `demo123` (see `/login` for the exact demo email addresses)

> All data in this deployment is sample data prepared for the hackathon
> prototype. Numbers are invented for illustration and do not represent
> official Government of India statistics. The policy simulator and trend
> forecast are illustrative model outputs, not real predictions.

## What this is

A national knowledge platform where researchers, institutions and government
officials can browse land-governance research, see land indicators on an
interactive map and dashboard, test policy ideas in a simulator before
real-world rollout, and submit new evidence for official review.

## Pages

| Route | What it does | Access |
|---|---|---|
| `/` | Dashboard: KPI cards, trend charts, disputes-by-state, research-by-topic, project progress, downloadable CSV report, interactive map with 3 switchable layers | Public |
| `/library` | Research repository: full-text search, filters (type/topic/state/year), 25 sample items | Public |
| `/library/:id` | Item detail with tag-based "Recommended" items | Public |
| `/simulator` | Policy simulator: pick a state and a policy lever, set intensity, see a 5-year projection against baseline | Researcher, Institution, Official |
| `/submit` | Submit new evidence for review | Researcher, Institution, Official |
| `/review` | Approve/reject submitted evidence | Official only |
| `/about` | Problem statement, what's built vs. planned | Public |
| `/login` | Email/password sign-in, demo accounts documented on the page | Public |

## Tech stack

This is what's actually in `package.json` — see note below on why this
differs from an earlier draft of this README.

- **Frontend:** React 19 + [TanStack Start](https://tanstack.com/start) +
  TanStack Router, built with **Vite** and served via **Nitro**.
- **Backend:** [Supabase](https://supabase.com) — Postgres database, Auth
  (email/password), row-level security, auto-generated REST API.
- **UI:** Tailwind CSS v4 + Radix UI primitives, Recharts for charts,
  react-hook-form + zod for the submit form.
- **Package manager:** Bun (`bun.lock`).
- **Deployment:** freebuff.app.

## Data model (Supabase / Postgres)

- `regions` — 12 Indian states with coordinates for the map.
- `land_metrics` — yearly indicators per state, 2019–2024 (digitization %,
  pending disputes, resolution days, women-owned %, climate vulnerability,
  built-up %).
- `evidence` — research repository items with full-text search.
- `projects` — scheme/project progress shown on the dashboard.
- `forecasts` — 2025–2027 linear-trend projections per state/metric.
- `policy_levers` — the simulator's assumed effect sizes per lever.
- `profiles` — role per authenticated user (`researcher` / `institution` /
  `official`).
- `submissions` — user-submitted evidence, with a status the review queue
  acts on.

Access is enforced with Postgres row-level security policies, not just by
hiding navigation links in the UI.

## What's built vs. planned

**Built:** repository with search/filters/recommendations, dashboard with a
downloadable report, interactive map with 3 layers, statistical trend
forecast, illustrative policy simulator, role-based access, submit → review
workflow.

**Planned (not in this prototype):** AI semantic search and literature
synthesis, satellite/remote-sensing map layers, collaborative workspaces, an
innovation/hackathon portal, OCR + full-text document ingestion, public APIs
for other government systems.

## Local development

```bash
git clone https://github.com/manshi-1028/bhumi-vision-hub.git
cd bhumi-vision-hub
bun install
bun run dev
```

You'll need a Supabase project and its URL/anon key as environment
variables — see `supabase/migrations` for the schema to apply.

## Note on this README

An earlier version of this file described a Next.js app with mock-only data
and no real backend — that was the *original build prompt*, not the shipped
app. This version documents what is actually deployed: TanStack Start (not
Next.js) on the frontend, and a real Supabase Postgres backend with RLS,
auth, and a working write path (`/submit` → `/review`), not just mock data.
Keep this file in sync with the code — the next person to read it (a judge,
a teammate, or future you) will trust it over the demo unless they check.
