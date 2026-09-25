# BhoomiSetu

### Land Governance Intelligence Platform

Prototype for **SIH26019: National Digital Platform for Research, Policy Innovation, and Evidence-Based Land Governance in India**.

**Live Demo:** https://bhoomisetu.freebuff.app

**Repository:** https://github.com/manshi-1028/bhumi-vision-hub

---

## Overview

BhoomiSetu is a digital platform for **research, evidence discovery, land-governance analytics, and policy exploration**.

The platform brings research evidence, regional land indicators, statistical trend forecasts, and simplified policy simulations into a single interface for researchers, institutions, and government officials.

The prototype demonstrates how a centralized digital platform can support:

* Research discovery and evidence management
* Regional land-governance monitoring
* Interactive GIS visualization
* Statistical trend analysis
* Policy scenario exploration
* Evidence submission and official review
* Downloadable analytical reports

---

## Problem

Land governance involves multiple sources of information, including research studies, administrative indicators, development projects, and policy interventions.

When these sources are fragmented, it becomes harder to:

* discover relevant research,
* compare regional indicators,
* identify trends,
* evaluate policy scenarios,
* and move evidence through an institutional review process.

BhoomiSetu demonstrates a unified digital workflow for these activities.

---

## Key Features

### 1. National Dashboard

The dashboard provides an overview of land-governance indicators through:

* Key performance indicators
* Historical trend charts
* State-level dispute analysis
* Research output analysis
* Project progress indicators
* Interactive geographic visualization
* Downloadable CSV reports

---

### 2. Interactive GIS Map

The dashboard includes an interactive map of participating regions with switchable visualization layers.

The map provides geographic context for land-governance indicators and allows users to explore regional differences through the dashboard.

---

### 3. Research Repository

The research repository provides:

* Full-text search
* Filtering by research type
* Topic filtering
* State filtering
* Year filtering
* Research detail pages
* Related/recommended research

This allows users to discover evidence relevant to specific land-governance questions.

---

### 4. Statistical Trend Forecast

BhoomiSetu includes a **statistical trend forecast** based on historical indicator data.

The analytics pipeline uses Python with:

* Pandas
* NumPy
* Linear trend fitting

The current forecast analytics generate projections for selected indicators for future years.

The forecasting approach is intentionally simple and transparent. It is a statistical trend model, **not an AI prediction system**.

The implementation is available in:

```text
analytics/forecast.py
```

---

### 5. Policy Simulator

The policy simulator allows users to:

1. Select a state
2. Select a policy lever
3. Adjust intervention intensity
4. View modeled effects
5. Compare projected values with the baseline

The simulator uses **assumed policy effect sizes and sample data**.

Its outputs are illustrative scenario results and should not be interpreted as real-world policy predictions.

---

### 6. Evidence Submission and Review

BhoomiSetu provides a role-based evidence workflow:

```text
Researcher / Institution
        |
        v
   Submit Evidence
        |
        v
   Review Queue
        |
        v
 Official Review
        |
   +----+----+
   |         |
Approve    Reject
```

This demonstrates how research evidence could move through an institutional review process.

---

## User Roles

| Role        | Access                                                         |
| ----------- | -------------------------------------------------------------- |
| Public user | Dashboard, research repository, research details, about, login |
| Researcher  | Public features + simulator + evidence submission              |
| Institution | Public features + simulator + evidence submission              |
| Official    | Full platform access + evidence review                         |

Authentication is handled through Supabase Auth, while role-based database access is enforced through PostgreSQL Row Level Security.

---

## Technology Stack

### Frontend

* **React 19**
* **TanStack Start**
* **TanStack Router**
* **TypeScript**
* **Vite**
* **Tailwind CSS v4**
* **Recharts**
* **Radix UI**
* **React Hook Form**
* **Zod**

### Backend

* **Supabase**
* **PostgreSQL**
* **Supabase Authentication**
* **PostgreSQL Row Level Security**

### Analytics

* **Python**
* **Pandas**
* **NumPy**
* Linear statistical trend modeling

### Development

* **Bun**
* Git
* GitHub

### Deployment

* **Freebuff**

---

## Architecture

```text
                         BhoomiSetu
                              |
                    React + TanStack Start
                              |
             +----------------+----------------+
             |                |                |
             v                v                v
        Dashboard       Research Hub     Policy Simulator
             |                |                |
             +----------------+----------------+
                              |
                              v
                         Supabase
                              |
                    +---------+---------+
                    |                   |
                    v                   v
                PostgreSQL         Supabase Auth
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
     Regions     Evidence    Land Metrics
        |           |           |
        +-----------+-----------+
                    |
              Forecasts
                    |
              Submissions
                    |
              Policy Levers
```

---

## Data Model

The application uses the following primary Supabase/PostgreSQL tables:

| Table           | Purpose                                  |
| --------------- | ---------------------------------------- |
| `regions`       | Regional information and map coordinates |
| `land_metrics`  | Historical land-governance indicators    |
| `evidence`      | Research repository records              |
| `projects`      | Project and scheme progress              |
| `forecasts`     | Statistical trend forecast outputs       |
| `policy_levers` | Assumed effects used by the simulator    |
| `profiles`      | Authenticated user roles                 |
| `submissions`   | Evidence submitted for review            |

Database access is protected using **PostgreSQL Row Level Security (RLS)**.

The application does not rely only on hiding UI controls. Database-level policies provide an additional authorization layer.

---

## Forecasting Methodology

The statistical forecast uses a simple linear trend model.

For each region and selected metric:

```text
historical observations
          |
          v
     linear fitting
          |
          v
     trend equation
          |
          v
 future-year estimates
```

The Python analytics script uses:

```python
numpy.polyfit(..., 1)
```

to estimate a linear relationship between historical year and metric value.

Percentage and index-based indicators are constrained to a `0–100` range, while non-negative indicators are prevented from producing negative values.

### Important limitation

These forecasts are **illustrative statistical projections based on sample data**.

They do not represent official Government of India forecasts or predictions.

---

## Policy Simulation Methodology

The policy simulator uses predefined policy levers with assumed effect sizes.

Examples include:

* Land-record digitization
* Dispute-resolution acceleration
* Women's land-title initiatives
* Climate-resilient zoning

The simulator applies these assumptions to sample baseline data to demonstrate scenario analysis.

The results should therefore be interpreted as:

> **simplified modeled scenarios, not real-world policy impact estimates.**

---

## Data Disclaimer

All data in this prototype is **sample data prepared for the hackathon demonstration**.

The numerical values are illustrative and do not represent official Government of India statistics.

The forecast and policy simulator outputs are illustrative model outputs and should not be interpreted as official predictions, recommendations, or policy impact assessments.

---

## Security and Access Control

BhoomiSetu uses:

* Supabase Authentication for user identity
* Role information stored in the `profiles` table
* PostgreSQL Row Level Security for database authorization
* Protected application routes for role-specific functionality
* Environment variables for Supabase configuration

Sensitive credentials and Supabase secrets are not included in the repository.

---

## Demo Flow

A recommended demonstration sequence is:

```text
1. Dashboard
      |
      v
2. Explore GIS layers
      |
      v
3. Open Research Repository
      |
      v
4. Search and inspect research
      |
      v
5. View statistical trend forecast
      |
      v
6. Run a policy scenario
      |
      v
7. Login as Researcher / Institution
      |
      v
8. Submit evidence
      |
      v
9. Login as Official
      |
      v
10. Review submitted evidence
      |
      v
11. Download dashboard CSV report
```

---

## Application Routes

| Route          | Description                                 | Access              |
| -------------- | ------------------------------------------- | ------------------- |
| `/`            | Dashboard, KPIs, charts, map, report export | Public              |
| `/library`     | Research repository and search              | Public              |
| `/library/:id` | Research detail and recommendations         | Public              |
| `/simulator`   | Policy scenario simulator                   | Authenticated roles |
| `/submit`      | Evidence submission                         | Authenticated roles |
| `/review`      | Evidence review and approval workflow       | Official            |
| `/about`       | Platform overview and roadmap               | Public              |
| `/login`       | Authentication                              | Public              |

---

## Project Structure

```text
bhumi-vision-hub/
│
├── analytics/
│   └── forecast.py
│
├── public/
│   ├── favicon.ico
│   └── favicon.svg
│
├── src/
│   ├── components/
│   ├── lib/
│   ├── routes/
│   └── styles.css
│
├── supabase/
│   └── migrations/
│
├── scripts/
│   └── make-static-dist.mjs
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Local Development

### Prerequisites

* Bun
* A Supabase project
* Supabase URL
* Supabase anonymous key

### Clone

```bash
git clone https://github.com/manshi-1028/bhumi-vision-hub.git
cd bhumi-vision-hub
```

### Install dependencies

```bash
bun install
```

### Environment variables

Create a `.env` file with the required Supabase configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Start development server

```bash
bun run dev
```

### Build

```bash
bun run build
```

### Static deployment build

```bash
bun run build:static
```

---

## Development and Deployment Notes

The application uses TanStack Start in SPA/static deployment mode for the deployed prototype.

The static deployment build produces the client output expected by the hosting environment and normalizes the generated output for static hosting.

The deployment configuration is contained in:

```text
vite.config.ts
scripts/make-static-dist.mjs
```

---

## Current Scope

### Built

* Research repository
* Search and filtering
* Research recommendations
* Dashboard analytics
* Interactive GIS visualization
* CSV report generation
* Statistical trend forecasting
* Policy simulator
* Authentication
* Role-based access
* Evidence submission
* Official review workflow
* Supabase/PostgreSQL backend
* Row Level Security
* Responsive UI
* Production deployment

### Planned

The following capabilities are outside the current prototype scope:

* AI semantic search
* Literature synthesis
* Satellite and remote-sensing layers
* Collaborative research workspaces
* Innovation and hackathon portal
* OCR and full-text document ingestion
* Public APIs for integration with external government systems

---

## Limitations

This is a hackathon prototype rather than a production government information system.

Current limitations include:

* Sample rather than official datasets
* Simplified forecasting methodology
* Assumption-based policy simulation
* Limited regional coverage in the prototype dataset
* No live integration with government information systems
* No production-scale document ingestion pipeline

These limitations are intentional and define the boundary between the current prototype and future development.

---

## Roadmap

### Phase 1: Prototype

* Research repository
* Land-governance dashboard
* GIS visualization
* Statistical trend forecasting
* Policy simulation
* Evidence submission and review

### Phase 2: Evidence Intelligence

* Semantic research discovery
* Document ingestion
* OCR
* Literature synthesis
* Improved evidence linking

### Phase 3: Data Integration

* Government data integrations
* Expanded regional datasets
* Remote-sensing layers
* Public APIs

### Phase 4: Collaborative Governance

* Institutional workspaces
* Cross-organization collaboration
* Evidence lifecycle management
* Advanced policy analysis

---

## Project Information

**Problem Statement:** SIH26019

**Domain:** Land Governance, Research, Policy Innovation

**Platform:** BhoomiSetu

**Status:** Hackathon Prototype

**Live Deployment:** https://bhoomisetu.freebuff.app

---

## License

This repository is currently maintained as a hackathon project.

If the project is later released for broader reuse, an explicit open-source license should be added here.
