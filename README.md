# BhoomiSetu

### National Digital Platform for Research, Policy Innovation, and Evidence-Based Land Governance in India

**SIH2026 — Problem Statement SIH26019**

BhoomiSetu is a demonstration platform designed to connect land-governance data, research evidence, statistical analysis, policy simulation, and evidence submission into a single digital workspace.

The platform brings together a national dashboard, research repository, GIS-oriented regional insights, statistical trend forecasts, an assumption-based policy simulator, and a role-based research submission and review workflow.

> **Prototype / Demonstration Environment:** The deployed application uses demonstration and sample data. It is not an official Government of India system.

---

## 🔗 Links

* **Live Demo:** https://bhoomisetu.freebuff.app/
* **GitHub Repository:** https://github.com/manshi-1028/bhumi-vision-hub
* **YouTube Demo:** `ADD_YOUR_YOUTUBE_LINK_HERE`

---

## 📌 Problem

Land governance involves large amounts of information distributed across different systems and institutions.

Research publications, land records, dispute information, development indicators, ownership data, and policy decisions often exist separately. This makes it difficult to connect evidence with the decisions that depend on it.

BhoomiSetu explores a unified platform where:

* Land-governance indicators can be viewed together.
* Research and evidence can be searched through a structured repository.
* Regional data can be explored through dashboards and maps.
* Historical indicators can be used for statistical trend forecasting.
* Policy assumptions can be tested through a simplified simulator.
* Researchers and institutions can submit evidence.
* Government-official roles can review submitted evidence.

---

# 🚀 Key Features

## 1. National Land Governance Dashboard

The dashboard provides an overview of major land-governance indicators across reporting regions.

It includes indicators such as:

* Records digitized
* Pending land disputes
* Average dispute-resolution time
* Women-owned land
* Climate vulnerability
* Built-up land percentage
* Research and evidence activity

The dashboard also supports reporting-year selection and downloadable CSV reports.

### Dashboard

![BhoomiSetu Dashboard](screenshots/dashboard.png)

---

## 2. Research & Evidence Repository

The Research Library provides a searchable repository for research and evidence records.

Users can filter records by:

* Type
* Topic
* State
* Year

The repository is designed to connect research outputs with regional land-governance issues.

### Research Library

![Research Library](screenshots/research-library.png)

---

## 3. Regional / GIS Insights

The dashboard provides regional land-governance visualization and map-based exploration.

Regional data can be examined using indicators related to:

* Land digitisation
* Disputes
* Resolution time
* Ownership equity
* Climate exposure
* Built-up land

The goal is to make geographically distributed land-governance information easier to compare and interpret.

---

## 4. Statistical Trend Forecast

BhoomiSetu includes a statistical forecasting component implemented in Python.

The forecasting script is located at:

```text
analytics/forecast.py
```

The implementation uses:

* Python
* Pandas
* NumPy
* Linear trend estimation

The model fits a simple linear trend to historical sample data and generates estimated values for future years.

### Important

This is a **statistical trend forecast**, not an AI prediction system.

The current demonstration forecasts selected indicators for future years using a linear trend.

Example metrics include:

```text
records_digitized_pct
pending_disputes
avg_resolution_days
women_owned_pct
climate_vuln_index
built_up_pct
```

The generated forecast output is written to:

```text
forecasts.csv
```

This approach is intentionally transparent and easy to inspect for the prototype.

---

## 5. Policy Simulator

The Policy Simulator allows users to explore the assumed effects of different policy interventions.

Users can select:

* Region
* Policy lever
* Intensity

The simulator then displays:

* Baseline values
* Projected values
* Absolute changes
* Percentage changes
* Five-year comparison charts

### Policy Simulator

![Policy Simulator](screenshots/policy-simulator.png)

### Important limitation

The simulator is **not a real policy prediction engine**.

Its projections are based on simplified, explicitly defined assumptions for demonstration purposes. The results should therefore be interpreted as scenario exploration rather than real-world policy forecasts.

---

## 6. Research Submission Workflow

Researchers and institutions can submit research or evidence records through the platform.

Submission fields include:

* Title
* Type
* Topic
* State
* Summary

Submitted records enter a review workflow before publication.

### Submission

![Research Submission](screenshots/submission.png)

---

## 7. Role-Based Review System

BhoomiSetu uses role-based access for different types of users.

### Researcher

Researchers can:

* Explore the research repository
* Submit research/evidence
* Access the platform's analytical features available to their role

### Institution

Institutions can:

* Explore research and evidence
* Submit evidence
* Participate in the research workflow

### Government Official

Officials can:

* Access the review workspace
* Review submitted records
* Approve submissions
* Reject submissions

Approved records can then appear in the public research repository.

### Review Workspace

![Review Workspace](screenshots/review.png)

---

# 🔐 Authentication

BhoomiSetu includes a dedicated login system using **Supabase Authentication**.

The login page provides account-based access to protected platform functionality.

![BhoomiSetu Login](screenshots/login.png)

The deployed application is configured as a demonstration environment with provisioned accounts for the supported roles.

**No passwords or credentials are stored in this repository or README.**

---

# 🏗️ Technology Stack

## Frontend

* React 19
* TypeScript
* TanStack Start
* TanStack Router
* Vite
* Tailwind CSS
* Lucide Icons
* Recharts / charting components

## Backend / Data

* Supabase
* PostgreSQL
* Supabase Authentication
* Row Level Security (RLS)
* Supabase RPC functions

## Analytics

* Python
* Pandas
* NumPy
* Linear trend analysis

## Development

* Git
* GitHub
* Bun
* PowerShell / Windows development environment

---

# 🧩 Architecture

```text
                        ┌──────────────────────┐
                        │      BhoomiSetu      │
                        │    React Frontend    │
                        └──────────┬───────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
       ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
       │   Dashboard │      │   Research  │      │  Simulator  │
       │   & GIS     │      │  Repository │      │             │
       └─────────────┘      └─────────────┘      └─────────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ▼
                         ┌──────────────────┐
                         │     Supabase     │
                         │ Auth + PostgreSQL│
                         │      + RLS       │
                         └──────────────────┘

                         ┌──────────────────┐
                         │ Python Analytics │
                         │   Pandas/NumPy   │
                         └────────┬─────────┘
                                  ▼
                           Statistical
                         Trend Forecasts
```

---

# 🗃️ Data Architecture

The application uses Supabase/PostgreSQL for structured platform data.

Core data areas include:

```text
regions
land_metrics
evidence
projects
forecasts
policy_levers
profiles
submissions
```

Authentication and role information are integrated with the application access model.

Row Level Security is used to control access to protected data and workflows.

---

# 📊 Forecasting Methodology

The forecasting script follows a simple linear trend approach.

For each region and metric:

1. Historical observations are grouped by region.
2. Observations are sorted by year.
3. A linear relationship is fitted using NumPy.
4. Future values are calculated from the fitted trend.
5. Percentage/index metrics are constrained to the `0–100` range.
6. Count/time metrics are prevented from becoming negative.
7. Results are exported as CSV.

Conceptually:

```text
Historical data
      │
      ▼
Group by region
      │
      ▼
Sort by year
      │
      ▼
Linear trend fitting
      │
      ▼
Future-year estimates
      │
      ▼
forecasts.csv
```

This deliberately keeps the methodology transparent rather than presenting a simple statistical model as artificial intelligence.

---

# 🧪 Demonstration Data

The deployed prototype uses demonstration/sample data.

Some research records, land indicators, policy effects, and regional values are illustrative and are intended to demonstrate the platform's functionality.

Therefore:

* Dashboard values should not be interpreted as official government statistics.
* Research records may be fictional or illustrative.
* Forecasts are generated from sample data.
* Simulator outputs are assumption-based scenarios.
* The application should not be used as a basis for real-world policy decisions.

---

# 🔒 Security & Configuration

Environment variables are used for Supabase configuration.

Create a local `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do **not** commit your `.env` file or private credentials to GitHub.

The Supabase anonymous/publishable client key is intended for frontend use when Row Level Security and appropriate database policies are configured. Never expose a Supabase service-role key in frontend code.

---

# 🛠️ Local Development

## Prerequisites

Install:

* Node.js / Bun
* Git
* Python 3.x for the analytics script
* A Supabase project for database-backed local development

Clone the repository:

```bash
git clone https://github.com/manshi-1028/bhumi-vision-hub.git
cd bhumi-vision-hub
```

Install dependencies:

```bash
bun install
```

Create your environment file:

```text
.env
```

Add:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:

```bash
bun run dev
```

---

# 🐍 Running the Forecast Script

The forecasting script is located at:

```text
analytics/forecast.py
```

Install the required Python packages if necessary:

```bash
pip install pandas numpy
```

Then run:

```bash
python analytics/forecast.py
```

The script reads:

```text
land_metrics.csv
```

and generates:

```text
forecasts.csv
```

---

# 📁 Project Structure

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
├── scripts/
│   └── make-static-dist.mjs
│
├── src/
│   ├── components/
│   │   ├── charts.tsx
│   │   ├── states.tsx
│   │   └── ui/
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── simulate.ts
│   │   ├── supabase.ts
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── library.index.tsx
│   │   ├── library.$id.tsx
│   │   ├── simulator.tsx
│   │   ├── submit.tsx
│   │   ├── review.tsx
│   │   ├── login.tsx
│   │   └── about.tsx
│   │
│   └── styles.css
│
├── screenshots/
│   ├── dashboard.png
│   ├── login.png
│   ├── policy-simulator.png
│   ├── research-library.png
│   ├── review.png
│   └── submission.png
│
├── package.json
├── vite.config.ts
└── README.md
```

---

# 🧭 Application Routes

| Route          | Purpose                          |
| -------------- | -------------------------------- |
| `/`            | National dashboard               |
| `/library`     | Research and evidence repository |
| `/library/:id` | Evidence/research detail         |
| `/simulator`   | Policy simulation                |
| `/submit`      | Evidence submission              |
| `/review`      | Official review workspace        |
| `/login`       | Authentication                   |
| `/about`       | Platform information             |

Protected routes require appropriate authentication and role access.

---

# 🎥 Demo

A complete walkthrough of BhoomiSetu is available here:

**YouTube:** `ADD_YOUR_YOUTUBE_LINK_HERE`

The demonstration covers:

1. Dashboard and national indicators
2. Research repository
3. Search and filtering
4. Statistical forecast
5. Policy simulator
6. Research submission
7. Official review workflow
8. Role-based authentication

---

# 🎯 Demo Flow

A recommended demonstration sequence is:

```text
Login
  ↓
Dashboard
  ↓
Explore regional indicators
  ↓
Research Library
  ↓
Search / filter evidence
  ↓
Statistical Forecast
  ↓
Policy Simulator
  ↓
Submit Evidence
  ↓
Official Review
  ↓
Approve / Reject
```

This demonstrates the complete evidence-to-decision workflow represented by the prototype.

---

# ⚠️ Scope & Limitations

BhoomiSetu is currently a prototype / demonstration implementation.

### Current limitations

* Uses sample/demonstration data.
* Statistical forecasts use simple linear trends.
* Policy simulation uses predefined assumptions.
* The simulator does not model the full complexity of real policy outcomes.
* Research records are illustrative where indicated.
* GIS and regional visualisations are demonstration-oriented.
* Production-scale data ingestion and government-system integrations are outside the current prototype scope.

These limitations are intentionally disclosed so that demonstration functionality is not presented as production-grade policy intelligence.

---

# 🔮 Future Scope

Potential future development includes:

* Integration with verified government datasets.
* Automated data ingestion pipelines.
* More sophisticated statistical forecasting methods.
* Spatial analysis and richer GIS layers.
* Evidence provenance and citation tracking.
* Advanced research discovery and semantic search.
* Multilingual accessibility.
* Government-system integrations.
* More comprehensive policy impact modelling.
* Production-grade monitoring, auditing and security.
* Scalable deployment for large datasets and concurrent users.

---

# 🏁 Project Status

**Current status: Prototype / Demonstration**

Implemented:

* ✅ National dashboard
* ✅ Regional land-governance indicators
* ✅ Research & evidence repository
* ✅ Search and filtering
* ✅ GIS-oriented regional exploration
* ✅ CSV reporting
* ✅ Statistical trend forecasting
* ✅ Policy simulator
* ✅ Evidence submission workflow
* ✅ Official review workflow
* ✅ Role-based access
* ✅ Supabase authentication
* ✅ Responsive UI
* ✅ Static deployment configuration

---

# 📜 Disclaimer

BhoomiSetu is an academic/prototype implementation created for **Smart India Hackathon 2026 — SIH26019**.

The application and its datasets are intended to demonstrate a possible digital approach to research, evidence, analytics, and land-governance workflows.

The demonstration data, forecasts, and policy-simulation outputs should **not** be interpreted as official government statistics, official policy recommendations, or real-world predictions.

---

## 👩‍💻 Built For

**Smart India Hackathon 2026**

**Problem Statement:** SIH26019
**Project:** BhoomiSetu
**Domain:** Land Governance, Research & Policy Innovation

---

## ⭐ Repository

If you find the project useful or interesting, consider starring the repository:

https://github.com/manshi-1028/bhumi-vision-hub
