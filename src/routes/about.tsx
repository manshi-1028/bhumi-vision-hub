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
        content: "Vision, current build status and roadmap of the national digital platform for evidence-based land governance.",
      },
      { property: "og:title", content: "About the platform | BhoomiSetu" },
      { property: "og:description", content: "Vision, what is built, and the roadmap for BhoomiSetu, SIH26019." },
    ],
  }),
  component: About,
});

const PILLARS = [
  {
    title: "GIS",
    body: "A parcel-level regional grid of land metrics across the reporting states, with layer switching between digitisation, disputes and climate exposure.",
    icon: "M2.5 2.5h9v9h-9v-9Zm6 6h9v9h-9v-9Z",
  },
  {
    title: "Research repository",
    body: "A searchable evidence library of policy briefs, datasets, field studies and reports with topic, region, type and year filters.",
    icon: "M4 3h9l3 3v11H4V3Zm3 6h6M7 12.5h6",
  },
  {
    title: "Analytics",
    body: "National indicators, longitudinal trend charts and per-state comparisons drawn from the land metrics tables.",
    icon: "M2 16 8 8l3 3 5-7M2 16h14",
  },
  {
    title: "Policy simulation",
    body: "An illustrative model that projects the effect of policy levers on digitisation, disputes, resolution times and ownership equity.",
    icon: "M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3M3.4 3.4l2.1 2.1M10.5 10.5l2.1 2.1M12.6 3.4l-2.1 2.1M5.5 10.5l-2.1 2.1",
  },
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
            files and survey outputs. Research that could inform those decisions is scattered across universities,
            state departments and independent institutions, and rarely reaches the officer who needs it.
          </p>
        </div>
      </section>

      <div className="mt-10 space-y-12">
        {/* Pillars */}
        <section aria-label="Platform pillars">
          <p className="eyebrow mb-2">One platform</p>
          <h2 className="mb-6 font-serif text-2xl">Four connected capabilities</h2>
          <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
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
        </section>

        <SectionRule />

        {/* What is built */}
        <Reveal as="section">
          <p className="eyebrow mb-2">Current build</p>
          <h2 className="mb-6 font-serif text-2xl">What is built</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="panel p-6">
              <p className="text-[15px] leading-7 text-[var(--foreground)]">
                The current prototype demonstrates the full evidence workflow on sample data. It includes a national
                dashboard with six headline indicators, historical trend charts, state comparisons and component-level
                progress; a research repository with search, filters, pagination and related reading; a policy
                simulator that applies a simplified model to state baselines; and a submission and review workflow with
                role-based access.
              </p>
            </div>
            <ul className="panel p-6 text-sm leading-7 text-[var(--muted-foreground)]">
              <li>Dashboard, library, simulator, submit, review and about routes</li>
              <li>Role-based access: researcher, institution, official</li>
              <li>Official-only review queue with approval RPC</li>
              <li>CSV export of the visible indicators and chart series</li>
              <li>Session authentication with profile-based roles</li>
            </ul>
          </div>
        </Reveal>

        {/* Demo data disclosure */}
        <Reveal as="section">
          <div className="panel border-l-4 !border-l-[var(--accent)] p-6">
            <p className="card-label !text-[var(--accent)]">Demo data disclosure</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
              Every figure in this deployment is demonstration data prepared for the Smart India Hackathon prototype
              SIH26019. The numbers are invented for illustration and do not represent official Government of India
              statistics. Projection outputs from the policy simulator are illustrative model outputs, not real-world
              predictions.
            </p>
          </div>
        </Reveal>

        <SectionRule />

        {/* Roadmap */}
        <Reveal as="section">
          <p className="eyebrow mb-2">Direction</p>
          <h2 className="mb-6 font-serif text-2xl">Roadmap</h2>
          <ol className="space-y-4">
            {[
              ["Live data integration", "Replace sample data with feeds from state land record systems and court case management systems."],
              ["National map layer", "Add district-level drilldown for every indicator on the GIS intelligence view."],
              ["Government identity", "Move authentication to a government identity provider with departmental roles and audit logging."],
              ["Public API", "Publish a documented API so state departments and universities can read and contribute data programmatically."],
              ["Peer-reviewed models", "Replace the simplified projection model with peer-reviewed models and published assumptions."],
              ["Access for all", "Add multilingual interfaces and accessibility conformance testing before public release."],
            ].map(([t, d], i) => (
              <li key={t} className="panel panel-hover flex gap-4 p-5" style={{ animation: "bs-fade-up 560ms ease both", animationDelay: `${i * 70}ms` }}>
                <span className="metric-num text-2xl opacity-40">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-serif text-base">{t}</h3>
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
