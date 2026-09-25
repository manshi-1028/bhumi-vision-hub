# BhoomiSetu

### Land Governance Intelligence Platform

Prototype for **SIH26019 — National Digital Platform for Research, Policy Innovation, and Evidence-Based Land Governance in India.**

**Live Demo:** https://bhoomisetu.freebuff.app/
**Repository:** https://github.com/manshi-1028/bhumi-vision-hub

---

## Overview

BhoomiSetu is a digital platform for **research discovery, land-governance analytics, evidence management, and policy scenario exploration**.

The platform brings regional land indicators, research evidence, statistical trend forecasts, geographic visualization, policy simulations, and evidence review into a unified workflow for researchers, institutions, and government officials.

### Core capabilities

* Research discovery and evidence management
* Regional land-governance monitoring
* Interactive regional/GIS visualization
* Statistical trend forecasting
* Policy scenario exploration
* Evidence submission and official review
* Downloadable analytical reports
* Role-based authentication

> **Prototype note:** Numerical datasets currently used by the application are sample data prepared for demonstration. They do not represent official Government of India statistics.

---

# Problem Statement

Land-governance information can be distributed across research studies, administrative records, regional indicators, development projects, and policy interventions.

When these sources remain fragmented, it becomes difficult to:

* Discover relevant research
* Compare regional indicators
* Identify historical trends
* Explore policy scenarios
* Connect evidence with decision-making
* Move research through an institutional review workflow

BhoomiSetu demonstrates a unified digital workflow for these activities.

---

# Key Features

## 1. National Land-Governance Dashboard

The dashboard provides a consolidated view of regional land-governance indicators.

### Includes

* National-level KPIs
* Historical trend charts
* State-level dispute analysis
* Research output indicators
* Project progress indicators
* Interactive regional map visualization
* Reporting-year selection
* CSV report download

![BhoomiSetu Dashboard](screenshots/dashboard.png)

---

## 2. Interactive Regional/GIS Visualization

The dashboard provides map-based regional exploration of land-governance indicators.

Users can explore regional differences through available map layers, including indicators related to:

* Records digitisation
* Pending disputes
* Resolution time
* Women's land ownership
* Climate vulnerability
* Built-up land

The map is integrated directly into the dashboard alongside the analytical indicators.

> **Current scope:** The visualization is a prototype using sample regional data. Advanced spatial analysis, satellite/remote-sensing layers, and broader geographic datasets are planned for future development.

---

## 3. Research & Evidence Repository

The research library provides a searchable repository for land-governance research and evidence records.

### Features

* Text search
* Research-type filtering
* Topic filtering
* State filtering
* Year filtering
* Research detail pages
* Related/recommended research

![Research Library](screenshots/research-library.png)

---

## 4. Statistical Trend Forecast

BhoomiSetu includes a transparent **statistical trend forecast** based on historical indicator data.

The analytics pipeline uses:

* Python
* Pandas
* NumPy
* Linear trend fitting

The implementation is available at:

```text
analytics/forecast.py
```

For each region and selected metric, historical observations are fitted using a simple linear model:

```text
Historical observations
        ↓
Linear fitting
        ↓
Trend equation
        ↓
Future-year estimates
```

The implementation uses `numpy.polyfit(..., 1)` to estimate the linear relationship between year and metric value.

Percentage and index-based indicators are constrained to a `0–100` range, while non-negative indicators are prevented from producing negative values.

### Important limitation

This is a **statistical trend model, not an AI prediction system**.

The forecasts are illustrative projections generated from sample data and should not be interpreted as official Government of India forecasts.

---

## 5. Policy Simulator

The policy simulator allows users to explore simplified policy scenarios.

Users can:

1. Select a region
2. Select a policy lever
3. Adjust intervention intensity
4. Run the simulation
5. Compare baseline and projected values
6. View modeled changes through tables and charts

![Policy Simulator](screenshots/policy-simulator.png)

The simulator uses predefined policy levers with assumed effect sizes, including examples such as:

* Land-record digitization
* Dispute-resolution acceleration
* Women's land-title initiatives
* Climate-resilient zoning

> **Important:** Simulator outputs are simplified modeled scenarios based on assumptions and sample data. They are not real-world policy impact estimates or policy recommendations.

---

## 6. Evidence Submission Workflow

Researchers and institutions can submit research evidence through the platform.

The workflow is:

```text
Researcher / Institution
          ↓
    Submit Evidence
          ↓
     Review Queue
          ↓
    Official Review
       ↙       ↘
   Approve     Reject
```

The submission interface captures relevant research information including:

* Title
* Research type
* Topic
* State
* Summary

![Evidence Submission](screenshots/submission.png)

---

## 7. Official Review Workspace

Government-official accounts can access the review workspace.

Officials can:

* View pending submissions
* Inspect research information
* Approve submissions
* Reject submissions

This provides a basic evidence-review workflow between researchers, institutions, and authorized officials.

![Review Workspace](screenshots/review.png)

---

## 8. Authentication & Role-Based Access

BhoomiSetu uses **Supabase Authentication** for user identity and role information stored in the `profiles` table.

The current roles are:

| Role        | Access                                                         |
| ----------- | -------------------------------------------------------------- |
| Public User | Dashboard, research repository, research details, About, Login |
| Researcher  | Public features + simulator + evidence submission              |
| Institution | Public features + simulator + evidence submission              |
| Official    | Full platform access + evidence review                         |

Protected routes include:

```text
/simulator
/submit
/review
```

The review workspace is restricted to users with the appropriate official role.

![Login](screenshots/login.png)

### Demo credentials

Authentication credentials are **not committed to the repository**.

For evaluation of protected workflows, demo credentials should be shared separately by the project team rather than exposed in source control.

---

# Technology Stack

## Frontend

* React 19
* TanStack Start
* TanStack Router
* TypeScript
* Vite
* Tailwind CSS v4
* Recharts
* Radix UI
* React Hook Form
* Zod

## Backend & Database

* Supabase
* PostgreSQL
* Supabase Authentication
* PostgreSQL Row Level Security (RLS)

## Analytics

* Python
* Pandas
* NumPy
* Linear statistical trend modeling

## Development

* Bun
* Git
* GitHub

---

# Architecture

```text
                         BhoomiSetu
                              |
                    React + TanStack Start
                              |
          +-------------------+-------------------+
          |                   |                   |
          ↓                   ↓                   ↓
     Dashboard          Research Hub       Policy Simulator
          |                   |                   |
          +-------------------+-------------------+
                              |
                              ↓
                          Supabase
                              |
                    +---------+---------+
                    |                   |
                    ↓                   ↓
               PostgreSQL         Supabase Auth
                    |
        +-----------+-----------+
        |           |           |
        ↓           ↓           ↓
     Regions     Evidence   Land Metrics
        |           |           |
        +-----------+-----------+
                    |
          +---------+---------+
          |                   |
          ↓                   ↓
      Forecasts          Submissions
                              |
                              ↓
                       Policy Levers
```

---

# Data Model

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

Database access is protected using PostgreSQL Row Level Security.

---

# Security & Access Control

BhoomiSetu uses:

* Supabase Authentication for user identity
* Role information stored in `profiles`
* PostgreSQL Row Level Security
* Protected application routes
* Environment variables for Supabase configuration

Sensitive credentials and Supabase secrets are not included in the repository.

---

# Application Routes

| Route          | Description                                 | Access        |
| -------------- | ------------------------------------------- | ------------- |
| `/`            | Dashboard, KPIs, charts, map and CSV report | Public        |
| `/library`     | Research repository and search              | Public        |
| `/library/:id` | Research detail and recommendations         | Public        |
| `/simulator`   | Policy scenario simulator                   | Authenticated |
| `/submit`      | Evidence submission                         | Authenticated |
| `/review`      | Evidence review workflow                    | Official      |
| `/about`       | Platform overview and roadmap               | Public        |
| `/login`       | Authentication                              | Public        |

---

# Recommended Demo Flow

```text
1. Open Dashboard
        ↓
2. Explore regional indicators and map layers
        ↓
3. Open Research Repository
        ↓
4. Search and inspect evidence
        ↓
5. View statistical trend forecast
        ↓
6. Run a policy scenario
        ↓
7. Login as Researcher / Institution
        ↓
8. Submit evidence
        ↓
9. Login as Official
        ↓
10. Review the submission
        ↓
11. Approve / Reject
        ↓
12. Download dashboard CSV report
```

---

# Screenshots

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Research Library

![Research Library](screenshots/research-library.png)

### Policy Simulator

![Policy Simulator](screenshots/policy-simulator.png)

### Evidence Submission

![Evidence Submission](screenshots/submission.png)

### Official Review

![Review Workspace](screenshots/review.png)

### Login

![Login](screenshots/login.png)

---

# Local Development

## Prerequisites

You will need:

* Bun
* A Supabase project
* Supabase project URL
* Supabase anonymous key

## Clone the repository

```bash
git clone https://github.com/manshi-1028/bhumi-vision-hub.git

cd bhumi-vision-hub
```

## Install dependencies

```bash
bun install
```

## Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use your own Supabase project URL and anonymous key when running the project locally.

**Do not commit private credentials or secrets to GitHub.**

## Start development server

```bash
bun run dev
```

## Build

```bash
bun run build
```

## Static deployment build

```bash
bun run build:static
```

---

# Deployment

The current prototype is deployed using **Freebuff**.

**Live deployment:**

https://bhoomisetu.freebuff.app/

Static deployment configuration is handled through:

```text
vite.config.ts
scripts/make-static-dist.mjs
```

The deployment build generates the static client output required by the hosting environment.

---

# Current Scope

## Implemented

* Research repository
* Search and filtering
* Research recommendations
* Land-governance dashboard
* Interactive regional/GIS visualization
* CSV report generation
* Statistical trend forecasting
* Policy simulator
* Authentication
* Role-based access
* Evidence submission
* Official review workflow
* Supabase/PostgreSQL backend
* Row Level Security
* Responsive interface
* Deployed prototype

## Planned

* AI semantic search
* Literature synthesis
* Satellite and remote-sensing layers
* Collaborative research workspaces
* Innovation and hackathon portal
* OCR and full-text document ingestion
* Public APIs for integration with external government systems
* Expanded geographic and administrative datasets

---

# Limitations

BhoomiSetu is a **hackathon prototype**, not a production government information system.

Current limitations include:

* Sample rather than official datasets
* Simplified statistical forecasting methodology
* Assumption-based policy simulation
* Limited regional coverage in the prototype dataset
* No live integration with government information systems
* No production-scale document ingestion pipeline
* Prototype-level GIS visualization

These limitations define the boundary between the current prototype and future development.

---

# Roadmap

### Phase 1 — Prototype

* Research repository
* Land-governance dashboard
* Regional/GIS visualization
* Statistical trend forecasting
* Policy simulation
* Evidence submission and review

### Phase 2 — Evidence Intelligence

* Semantic research discovery
* Document ingestion
* OCR
* Literature synthesis
* Improved evidence linking

### Phase 3 — Data Integration

* Government data integrations
* Expanded regional datasets
* Remote-sensing layers
* Public APIs

### Phase 4 — Collaborative Governance

* Institutional workspaces
* Cross-organization collaboration
* Evidence lifecycle management
* Advanced policy analysis

---

# Problem Statement

**SIH26019**

**National Digital Platform for Research, Policy Innovation, and Evidence-Based Land Governance in India**

**Domain:** Land Governance, Research & Policy Innovation

**Platform:** BhoomiSetu

**Status:** Hackathon Prototype

---

# License

This repository is currently maintained as a hackathon project.

No open-source license is currently declared for the repository. If the project is later released for broader reuse, an explicit open-source license can be added.

---

# Project Links

**Live Demo:**
https://bhoomisetu.freebuff.app/

**GitHub Repository:**
https://github.com/manshi-1028/bhumi-vision-hub
