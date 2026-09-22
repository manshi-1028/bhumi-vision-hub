import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
  const [intensity, setIntensity] = useState(50);
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
                <span>Intensity</span>
                <span className="metric-num text-lg !normal-case !tracking-normal">{intensity}</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                aria-label="Policy intensity"
              />
              <span className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">
                <span>Low</span><span>High</span>
              </span>
            </label>

            <button
              type="button"
              className="btn mt-6 w-full"
              onClick={() => setSubmitted({ state, leverId, intensity })}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3M3.4 3.4l2.1 2.1M10.5 10.5l2.1 2.1M12.6 3.4l-2.1 2.1M5.5 10.5l-2.1 2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
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
                  </header>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-left">
                          <th className="px-6 py-3 font-semibold">Indicator</th>
                          <th className="px-4 py-3 font-semibold">Unit</th>
                          <th className="px-4 py-3 text-right font-semibold">Baseline</th>
                          <th className="px-4 py-3 text-right font-semibold">Projected</th>
                          <th className="px-6 py-3 text-right font-semibold">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {query.data.rows.map((r, i) => {
                          const change = r.projected - r.baseline;
                          return (
                            <tr key={r.indicator} className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--primary-soft)]" style={{ animation: "bs-fade-in 500ms ease both", animationDelay: `${i * 80}ms` }}>
                              <td className="px-6 py-3 font-medium">{r.indicator}</td>
                              <td className="px-4 py-3 text-[var(--muted-foreground)]">{r.unit}</td>
                              <td className="px-4 py-3 text-right tabular-nums text-[var(--muted-foreground)]">{r.baseline.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                                <CountUp value={r.projected} decimals={2} duration={700} />
                              </td>
                              <td className={`px-6 py-3 text-right font-semibold tabular-nums ${change >= 0 ? "text-[var(--primary-bright)]" : "text-[var(--accent)]"}`}>
                                {change >= 0 ? "+" : ""}{change.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </Reveal>

              <Reveal delay={120}>
                <LineChart
                  title={`Before and after projection, ${query.data.headline}`}
                  labels={query.data.years}
                  series={[
                    { name: "Baseline", values: query.data.baselineSeries },
                    { name: "With policy lever", values: query.data.projectedSeries, accent: true },
                  ]}
                />
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
