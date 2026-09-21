import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Page, PageHeading } from "../components/site";
import { Loading, ErrorBox } from "../components/states";
import { BarChart, LineChart, ProgressList } from "../components/charts";
import { buildDashboardCsv, getDashboard, getYears } from "../lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "National land governance dashboard | BhoomiSetu" },
      {
        name: "description",
        content:
          "National indicators on land record digitisation, disputes, women's land ownership, climate vulnerability and research outputs.",
      },
      { property: "og:title", content: "National land governance dashboard | BhoomiSetu" },
      {
        property: "og:description",
        content: "Evidence dashboard for research, policy innovation and land governance in India. Sample data.",
      },
    ],
  }),
  component: Dashboard,
});

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="panel p-4">
      <p className="text-xs tracking-wide text-[var(--muted-foreground)] uppercase">{label}</p>
      <p className="mt-2 font-serif text-2xl text-[var(--primary)] tabular-nums">{value}</p>
      {note ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{note}</p> : null}
    </div>
  );
}

function Dashboard() {
  const [year, setYear] = useState(2025);
  const yearsQuery = useQuery({ queryKey: ["years"], queryFn: getYears });
  const years = yearsQuery.data ?? [];
  const query = useQuery({ queryKey: ["dashboard", year], queryFn: () => getDashboard(year) });

  function downloadCsv() {
    if (!query.data) return;
    const blob = new Blob([buildDashboardCsv(query.data)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bhoomisetu-report-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Page>
      <PageHeading
        title="National land governance dashboard"
        description="Indicators on land record digitisation, pending disputes, ownership equity, climate exposure and research output. All values are sample data prepared for SIH26019."
      />

      <div className="panel mb-6 flex flex-wrap items-end justify-between gap-4 p-4">
        <label className="w-full max-w-[200px] text-sm">
          <span className="mb-1 block text-[var(--muted-foreground)]">Reporting year</span>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn" onClick={downloadCsv} disabled={!query.data}>
          Download report (CSV)
        </button>
      </div>

      {query.isPending ? <Loading /> : null}
      {query.isError ? <ErrorBox message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}

      {query.data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Kpi label="Records digitized" value={`${query.data.kpis.digitized}%`} note="Share of rural survey records" />
            <Kpi
              label="Pending land disputes"
              value={query.data.kpis.pendingDisputes.toLocaleString("en-IN")}
              note="Cases open across revenue and civil courts"
            />
            <Kpi label="Average resolution time" value={`${query.data.kpis.avgResolutionDays} days`} />
            <Kpi label="Women-owned land" value={`${query.data.kpis.womenOwned}%`} note="Titles recorded in a woman's name" />
            <Kpi label="Climate vulnerability index" value={query.data.kpis.climateIndex.toFixed(2)} note="0 low, 1 high" />
            <Kpi label="Research outputs" value={String(query.data.kpis.researchOutputs)} note="Items indexed in the repository" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <LineChart
              title="Records digitized over time (%)"
              labels={query.data.digitizedSeries.labels}
              series={[{ name: "Records digitized", values: query.data.digitizedSeries.values }]}
              yUnit="%"
            />
            <LineChart
              title="Built-up land over time (%)"
              labels={query.data.builtUpSeries.labels}
              series={[{ name: "Built-up land", values: query.data.builtUpSeries.values }]}
              yUnit="%"
            />
          </div>

          <BarChart title="Pending disputes by state, top 10 (thousands of cases)" data={query.data.disputesByState} />
          <BarChart title="Research outputs by topic" data={query.data.researchByTopic} />

          <ProgressList title="Project progress by component" data={query.data.progress} />

          <section className="panel flex min-h-[220px] items-center justify-center p-6 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">National map, integration pending</p>
          </section>
        </div>
      ) : null}
    </Page>
  );
}
