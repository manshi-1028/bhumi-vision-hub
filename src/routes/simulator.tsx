import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Play } from "lucide-react";
import { Page, Protected } from "../components/site";
import { ErrorBox, Loading } from "../components/states";
import { LineChart } from "../components/charts";
import { Reveal, CountUp } from "../components/motion";
import { TopoLines } from "../components/decor";
import { getPolicyLevers, getStates, runSimulation } from "../lib/api";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Policy simulator | BhoomiSetu" },
      {
        name: "description",
        content: "Project the effect of land governance policy levers on state indicators using a simplified model on sample data.",
      },
      { property: "og:title", content: "Policy simulator | BhoomiSetu" },
      { property: "og:description", content: "Simplified projections for land governance policy levers. Sample data." },
    ],
  }),
  component: () => (
    <Protected>
      <Simulator />
    </Protected>
  ),
});

function Simulator() {
  const [state, setState] = useState("");
  const [leverId, setLeverId] = useState("");
  const [intensity, setIntensity] = useState(2);
  const [submitted, setSubmitted] = useState<{ state: string; leverId: string; intensity: number } | null>(null);

  const { data: states } = useQuery({ queryKey: ["states"], queryFn: getStates });
  const { data: levers } = useQuery({ queryKey: ["policyLevers"], queryFn: getPolicyLevers });

  if (states && states.length > 0 && !state) setState(states[0]!);
  if (levers && levers.length > 0 && !leverId) setLeverId(levers[0]!.id);

  const query = useQuery({
    queryKey: ["simulation", submitted?.state, submitted?.leverId, submitted?.intensity],
    queryFn: () => runSimulation(submitted!.state, submitted!.leverId, submitted!.intensity),
    enabled: !!submitted,
  });

  const selectedLever = levers?.find((l) => l.id === leverId);
  const submittedLever = levers?.find((l) => l.id === submitted?.leverId);
  /* True when the user has moved a control after running: the displayed
     projection no longer reflects the current control values. */
  const stale =
    !!submitted &&
    (submitted.state !== state || submitted.leverId !== leverId || submitted.intensity !== intensity);

  return (
    <Page>
      {/* Hero */}
      <section className="dark-section relative -mx-4 -mt-6 overflow-hidden px-4 pb-10 pt-12">
        <TopoLines className="opacity-50" />
        <div className="bs-grid-overlay-dark absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl">
          <p className="eyebrow-dark anim-up">Policy modelling workspace</p>
          <h1 className="anim-up mt-3 font-serif text-3xl leading-tight text-[var(--dark-foreground)] sm:text-5xl" style={{ animationDelay: "100ms" }}>
            Policy <span className="text-[var(--accent-bright)]">Simulator</span>
          </h1>
          <p className="anim-up mt-3 max-w-2xl text-sm leading-6 text-[var(--dark-muted)] sm:text-base" style={{ animationDelay: "200ms" }}>
            Explore potential policy effects on state indicators using a simplified illustrative model.
          </p>
        </div>
      </section>

      <p role="note" className="mt-6 border border-[oklch(0.55_0.125_62/35%)] bg-[var(--accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--accent)]">
        Illustrative model with assumed effects. Not a validated forecast.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(320px,2fr)_3fr]">
        {/* Controls */}
        <Reveal>
          <section className="panel p-6 lg:sticky lg:top-20" aria-label="Policy controls">
            <h2 className="card-label mb-5">Policy controls</h2>

            <label className="block text-sm">
              <span className="card-label mb-1.5 block">Region</span>
              <select value={state} onChange={(e) => setState(e.target.value)}>
                {(states ?? []).map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>

            <label className="mt-5 block text-sm">
              <span className="card-label mb-1.5 block">Policy lever</span>
              <select value={leverId} onChange={(e) => setLeverId(e.target.value)}>
                {(levers ?? []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </label>

            {selectedLever?.description ? (
              <p className="mt-3 border-l-2 border-[var(--accent)] pl-3 text-xs leading-5 text-[var(--muted-foreground)]">
                {selectedLever.description}
              </p>
            ) : null}

            <label className="mt-6 block text-sm">
              <span className="card-label mb-2 flex items-center justify-between">
                <span>Intensity (units)</span>
                <span className="metric-num text-lg !normal-case !tracking-normal">{intensity}</span>
              </span>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                aria-label="Policy intensity in units"
              />
              <span className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">
                <span>0</span><span>5</span>
              </span>
            </label>

            <button
              type="button"
              className="btn mt-6 w-full"
              disabled={query.isFetching}
              onClick={() => setSubmitted({ state, leverId, intensity })}
            >
              <Play className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Simulate
            </button>

            <p className="mt-4 text-[11px] leading-5 text-[var(--muted-foreground)]">
              Projections use a simplified model on sample data. This is a demonstration, not a real policy prediction
              system.
            </p>
          </section>
        </Reveal>

        {/* Results */}
        <div className="min-w-0 space-y-6">
          {!submitted ? (
            <div className="panel flex h-full min-h-[280px] flex-col items-center justify-center p-8 text-center">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="mb-4 text-[var(--primary)] opacity-40" aria-hidden="true">
                <path d="M6 34 18 18l7 7 13-17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="38" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.75" />
              </svg>
              <h2 className="font-serif text-xl">No projection yet</h2>
              <p className="mt-2 max-w-sm text-sm text-[var(--muted-foreground)]">
                Choose a region, policy lever and intensity, then run the simulation to see projected effects.
              </p>
            </div>
          ) : null}

          {query.isFetching && submitted ? <Loading label="Running projection..." /> : null}
          {query.isError && submitted ? <ErrorBox message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}

          {query.data && !query.isFetching ? (
            <>
              <Reveal>
                <section className="panel overflow-hidden p-0" aria-label="Projected effects">
                  <header className="border-b border-[var(--border)] bg-[var(--primary-soft)] px-6 py-4">
                    <p className="card-label">Projected effects</p>
                    <h2 className="font-serif text-xl">{submitted?.state}</h2>
                    {/* Self-describing results: the exact parameters behind this projection. */}
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Baseline: <strong className="font-semibold tabular-nums">{query.data.baselineYear}</strong> land_metrics row
                      <span aria-hidden="true"> · </span>Lever: <strong className="font-semibold">{submittedLever?.name ?? submitted?.leverId}</strong>
                      <span aria-hidden="true"> · </span>Intensity: <strong className="font-semibold tabular-nums">{submitted?.intensity}</strong>/5 units
                    </p>
                    {stale ? (
                      <p className="anim-up mt-2 inline-flex items-center gap-2 border border-[oklch(0.55_0.125_62/35%)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]" role="status">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                        Controls changed — run Simulate again to update this projection
                      </p>
                    ) : null}
                  </header>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-left">
                          <th className="px-6 py-3 font-semibold">Indicator</th>
                          <th className="px-4 py-3 font-semibold">Unit</th>
                          <th className="px-4 py-3 text-right font-semibold">Baseline</th>
                          <th className="px-4 py-3 text-right font-semibold">Projected (year 5)</th>
                          <th className="px-6 py-3 text-right font-semibold">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {query.data.computation.rows.map((r, i) => {
                          const change = r.projected - r.baseline;
                          return (
                            <tr key={r.indicator} className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--primary-soft)]" style={{ animation: "bs-fade-in 500ms ease both", animationDelay: `${i * 80}ms` }}>
                              <td className="px-6 py-3 font-medium">{r.indicator}</td>
                              <td className="px-4 py-3 text-[var(--muted-foreground)]">{r.unit}</td>
                              <td className="px-4 py-3 text-right tabular-nums text-[var(--muted-foreground)]">{r.baseline.toFixed(r.decimals)}</td>
                              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                                <CountUp value={r.projected} decimals={r.decimals} duration={700} />
                              </td>
                              <td className={`px-6 py-3 text-right font-semibold tabular-nums ${change >= 0 ? "text-[var(--primary-bright)]" : "text-[var(--accent)]"}`}>
                                {change >= 0 ? "+" : "-"}{Math.abs(change).toFixed(r.decimals)} {r.unit}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </Reveal>

              {/* One-sentence result summary, computed alongside the projection. */}
              <p className="anim-up text-sm leading-6 text-[var(--muted-foreground)]" role="note">
                <strong className="font-semibold text-[var(--foreground)]">Summary:</strong> {query.data.computation.summary}
              </p>

              <Reveal delay={120}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {query.data.computation.charts.map((c) => (
                    <LineChart
                      key={c.key}
                      title={c.title}
                      yUnit={c.unit}
                      labels={query.data!.computation.horizonYears}
                      series={[
                        { name: "Baseline", values: c.baselineSeries },
                        { name: "Projected", values: c.projectedSeries, accent: true },
                      ]}
                    />
                  ))}
                </div>
              </Reveal>

              <p className="text-xs text-[var(--muted-foreground)]">
                Projections use a simplified model on sample data. Results are illustrative and must not be used for
                decisions.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </Page>
  );
}
