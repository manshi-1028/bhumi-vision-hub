import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Page, PageHeading, Protected } from "../components/site";
import { ErrorBox, Loading } from "../components/states";
import { LineChart } from "../components/charts";
import { LEVERS, getStates, runSimulation, type Lever } from "../lib/api";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Policy simulator | BhoomiSetu" },
      {
        name: "description",
        content: "Project the effect of land governance policy levers on state indicators using a simplified model on sample data.",
      },
      { property: "og:title", content: "Policy simulator | BhoomiSetu" },
      { property: "og:description", content: "Simplified projections for four land governance policy levers. Sample data." },
    ],
  }),
  component: () => (
    <Protected>
      <Simulator />
    </Protected>
  ),
});

function Simulator() {
  const [state, setState] = useState("Bihar");
  const [lever, setLever] = useState<Lever>("Land records digitization");
  const [intensity, setIntensity] = useState(50);

  const query = useQuery({
    queryKey: ["simulation", state, lever, intensity],
    queryFn: () => runSimulation(state, lever, intensity),
  });

  return (
    <Page>
      <PageHeading
        title="Policy simulator"
        description="Projections use a simplified model on sample data. Results are illustrative and must not be used for decisions."
      />

      <div className="panel mb-6 grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted-foreground)]">State</span>
          <select value={state} onChange={(e) => setState(e.target.value)}>
            {getStates().map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted-foreground)]">Policy lever</span>
          <select value={lever} onChange={(e) => setLever(e.target.value as Lever)}>
            {LEVERS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted-foreground)]">Intensity: {intensity}</span>
          <input type="range" min={0} max={100} step={1} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} />
        </label>
      </div>

      {query.isPending ? <Loading /> : null}
      {query.isError ? <ErrorBox message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}

      {query.data ? (
        <div className="space-y-6">
          <section className="panel p-4">
            <h2 className="mb-3 text-sm font-semibold">Projected effects for {state}</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left">
                    <th className="py-2 pr-3 font-semibold">Indicator</th>
                    <th className="py-2 pr-3 font-semibold">Unit</th>
                    <th className="py-2 pr-3 text-right font-semibold">Baseline</th>
                    <th className="py-2 pr-3 text-right font-semibold">Projected</th>
                    <th className="py-2 text-right font-semibold">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.rows.map((r) => {
                    const change = r.projected - r.baseline;
                    return (
                      <tr key={r.indicator} className="border-b border-[var(--border)]">
                        <td className="py-2 pr-3">{r.indicator}</td>
                        <td className="py-2 pr-3 text-[var(--muted-foreground)]">{r.unit}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{r.baseline}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{r.projected}</td>
                        <td className="py-2 text-right tabular-nums">
                          {change >= 0 ? "+" : ""}
                          {change.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <LineChart
            title={`Before and after projection, ${query.data.headline}`}
            labels={query.data.years}
            series={[
              { name: "Baseline", values: query.data.baselineSeries },
              { name: "With policy lever", values: query.data.projectedSeries, accent: true },
            ]}
          />
        </div>
      ) : null}
    </Page>
  );
}
