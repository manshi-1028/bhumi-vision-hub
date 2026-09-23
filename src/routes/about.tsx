import { createFileRoute } from "@tanstack/react-router";
import { Page } from "../components/site";
import { Reveal } from "../components/motion";
import { TopoLines, SectionRule } from "../components/decor";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the platform | BhoomiSetu" },
      {
        name: "description",
        content: "The problem, what the platform does, what is built in this demo and what is planned for BhoomiSetu, SIH26019.",
      },
      { property: "og:title", content: "About the platform | BhoomiSetu" },
      { property: "og:description", content: "The problem, what is built in this demo, and what is planned for BhoomiSetu, SIH26019." },
    ],
  }),
  component: About,
});

const SPACES = [
  {
    title: "Research",
    body: "A curated library of policy briefs, datasets, field studies and reports on land governance.",
    icon: "M4 3h9l3 3v11H4V3Zm3 6h6M7 12.5h6",
  },
  {
    title: "Data",
    body: "Regional land metrics with historical series that feed every view on the platform.",
    icon: "M3 16.5h14M5 13V8m4 5V5.5m4 7.5V9m4 4V7",
  },
  {
    title: "Interactive maps",
    body: "A regional map with three switchable layers: records digitised, pending disputes and climate vulnerability.",
    icon: "M2.5 2.5h9v9h-9v-9Zm6 6h9v9h-9v-9Z",
  },
  {
    title: "Dashboards",
    body: "National and state indicators, longitudinal charts and comparisons, with a downloadable report.",
    icon: "M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3M3.4 3.4l2.1 2.1M10.5 10.5l2.1 2.1M12.6 3.4l-2.1 2.1M5.5 10.5l-2.1 2.1",
  },
  {
    title: "Policy testing",
    body: "A simulator that projects policy levers on state baselines, clearly labelled as illustrative.",
    icon: "M2 16 8 8l3 3 5-7M2 16h14",
  },
];

const BUILT = [
  "Research repository with type, topic, state and year filters",
  "Keyword and tag-based search, with recommendations on item pages",
  "Interactive map with three layers: records digitised, pending disputes, climate vulnerability",
  "Dashboards with a downloadable report of the visible indicators and charts",
  "Statistical trend forecast: 2019 to 2024 actuals joined to a linear trend for 2025 to 2027",
  "Policy simulator (illustrative), applying a simplified model to state baselines",
  "Role-based access for researcher, institution and official accounts",
];

const PLANNED = [
  ["AI semantic search and literature synthesis", "Meaning-based search across the library with automatic synthesis of findings across studies."],
  ["Collaborative workspaces", "Shared spaces where departments and researchers work on the same evidence base."],
  ["Innovation portal", "An open channel for startups and institutions to submit tools and pilot proposals."],
  ["Satellite and remote-sensing integration", "Parcel-level change detection from satellite imagery feeding the map layers."],
  ["OCR and Elasticsearch document management", "Full-text ingestion of scanned land documents with fast, indexed search."],
  ["APIs for government systems", "Documented interfaces for state land record systems to publish and consume data."],
];

function About() {
  return (
    <Page>
      {/* Hero */}
      <section className="dark-section relative -mx-4 -mt-6 overflow-hidden px-4 pb-12 pt-14">
        <TopoLines className="opacity-60" />
        <div className="bs-grid-overlay-dark absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl">
          <p className="eyebrow-dark anim-up">Problem statement SIH26019</p>
          <h1 className="anim-up mt-3 max-w-3xl font-serif text-3xl leading-tight text-[var(--dark-foreground)] sm:text-5xl" style={{ animationDelay: "100ms" }}>
            About <span className="text-[var(--accent-bright)]">BhoomiSetu</span>
          </h1>
          <p className="anim-up mt-4 max-w-2xl text-sm leading-7 text-[var(--dark-muted)] sm:text-base" style={{ animationDelay: "200ms" }}>
            Land governance decisions in India are taken across many departments, each holding its own records, case
            files and survey outputs.
          </p>
        </div>
      </section>

      <div className="mt-10 space-y-12">
        {/* 1. The problem */}
        <Reveal as="section" aria-label="The problem">
          <p className="eyebrow mb-2">Problem statement</p>
          <h2 className="mb-6 font-serif text-2xl">The problem</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="panel p-6">
              <p className="text-[15px] leading-7 text-[var(--foreground)]">
                Land data, research and policy decisions currently sit in separate places. Land records and case files
                stay inside department systems. Research sits in journals, university repositories and unpublished field
                reports. Policy decisions are taken in reviews where this evidence rarely arrives in usable form.
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                The result is a gap repeated across states: studies exist, data exists, but the two are not connected to
                the decisions that need them.
              </p>
            </div>
            <ul className="panel p-6 text-sm leading-7 text-[var(--muted-foreground)]">
              <li>Records held by individual departments, in incompatible systems</li>
              <li>Research scattered across journals, universities and institutions</li>
              <li>Decisions taken without a shared, current evidence base</li>
            </ul>
          </div>
        </Reveal>

        <SectionRule />

        {/* 2. What this platform does */}
        <Reveal as="section" aria-label="What this platform does">
          <p className="eyebrow mb-2">One platform</p>
          <h2 className="mb-6 font-serif text-2xl">What this platform does</h2>
          <p className="mb-6 max-w-3xl text-[15px] leading-7 text-[var(--foreground)]">
            BhoomiSetu provides one national space where research, data, interactive maps, dashboards and policy testing
            sit together for land governance.
          </p>
          <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SPACES.map((p) => (
              <article key={p.title} className="panel panel-hover h-full p-5">
                <span className="flex h-10 w-10 items-center justify-center border border-[var(--border)] bg-[var(--primary-soft)] text-[var(--primary)]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d={p.icon} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="mt-4 font-serif text-lg">{p.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{p.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <SectionRule />

        {/* 3. Built in this demo */}
        <Reveal as="section" aria-label="Built in this demo">
          <p className="eyebrow mb-2">Current build</p>
          <h2 className="mb-6 font-serif text-2xl">Built in this demo</h2>
          <p className="mb-6 max-w-3xl text-[15px] leading-7 text-[var(--foreground)]">
            Every feature below exists in this prototype and runs on demonstration data prepared for SIH26019.
          </p>
          <ul className="panel grid grid-cols-1 gap-x-10 gap-y-3 p-6 text-sm leading-6 text-[var(--foreground)] sm:grid-cols-2">
            {BUILT.map((f) => (
              <li key={f} className="list-disc marker:text-[var(--primary)]">
                {f}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Demo data disclosure */}
        <Reveal as="section">
          <div className="panel border-l-4 !border-l-[var(--accent)] p-6">
            <p className="card-label !text-[var(--accent)]">Demo data disclosure</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
              Every figure in this deployment is demonstration data prepared for the Smart India Hackathon prototype
              SIH26019. The numbers are invented for illustration and do not represent official Government of India
              statistics. Projection outputs from the policy simulator and the trend forecast are illustrative model
              outputs on sample data, not real-world predictions.
            </p>
          </div>
        </Reveal>

        <SectionRule />

        {/* 4. Planned */}
        <Reveal as="section" aria-label="Planned">
          <p className="eyebrow mb-2">Future phases</p>
          <h2 className="mb-2 font-serif text-2xl">Planned</h2>
          <p className="mb-6 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
            The features below are planned for future phases. Each one is labelled Planned and none of them is part of
            the current demo.
          </p>
          <ol className="space-y-4">
            {PLANNED.map(([t, d], i) => (
              <li key={t} className="panel panel-hover flex gap-4 p-5" style={{ animation: "bs-fade-up 560ms ease both", animationDelay: `${i * 70}ms` }}>
                <span className="metric-num text-2xl opacity-40">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-serif text-base">
                    {t}
                    <span className="card-label ml-2 inline-block border border-[var(--border)] px-1.5 py-0.5 align-middle text-[10px] !text-[var(--muted-foreground)]">
                      Planned
                    </span>
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </Page>
  );
}
