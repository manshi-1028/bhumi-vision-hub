import { createFileRoute } from "@tanstack/react-router";
import { Page, PageHeading } from "../components/site";

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

function About() {
  return (
    <Page>
      <PageHeading title="About BhoomiSetu" description="Problem statement SIH26019. Platform names under consideration: BhoomiSetu, Bhoomi Darpan, Land Evidence Commons." />

      <div className="space-y-6">
        <section className="panel p-5">
          <h2 className="text-xl">Vision</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            Land governance decisions in India are taken across many departments, each holding its own records, case files and
            survey outputs. Research that could inform those decisions is scattered across universities, state departments and
            independent institutions, and rarely reaches the officer who needs it. This platform brings indicators, research
            and simple projection tools into one place so that policy choices on records, disputes, ownership equity and
            climate exposure can be argued from evidence rather than from anecdote.
          </p>
        </section>

        <section className="panel p-5">
          <h2 className="text-xl">What is built</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            The current prototype demonstrates the full workflow on sample data. It includes:
          </p>
          <ul className="disc mt-3 space-y-1 text-sm leading-6 text-[var(--muted-foreground)]">
            <li>A national dashboard with six headline indicators, historical trend charts, state comparisons and component level progress.</li>
            <li>A research repository of sample items with search, filters by type, topic, state and year, pagination and detail pages with related reading.</li>
            <li>A policy simulator that applies a simplified model to sample state baselines for four policy levers.</li>
            <li>A submission form for researchers and institutions, and a review queue for government officials.</li>
            <li>Role based access, with public reading and restricted contribution and review.</li>
            <li>A CSV export of the indicators and chart series currently on screen.</li>
          </ul>
        </section>

        <section className="panel p-5">
          <h2 className="text-xl">Roadmap</h2>
          <ul className="disc mt-3 space-y-1 text-sm leading-6 text-[var(--muted-foreground)]">
            <li>Replace sample data with live feeds from state land record systems and court case management systems.</li>
            <li>Add the national map layer with district level drilldown for every indicator.</li>
            <li>Move authentication to a government identity provider with departmental roles and audit logging.</li>
            <li>Publish a documented API so state departments and universities can read and contribute data programmatically.</li>
            <li>Replace the simplified projection model with peer reviewed models and published assumptions.</li>
            <li>Add multilingual interfaces and accessibility conformance testing before public release.</li>
          </ul>
        </section>
      </div>
    </Page>
  );
}
