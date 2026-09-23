import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Page } from "../components/site";
import { Loading, ErrorBox, EmptyBox } from "../components/states";
import { BarChart, LineChart, ProgressList, niceMax } from "../components/charts";
import { RegionMap, type MapLayer } from "../components/region-map";
import { Reveal, CountUp } from "../components/motion";
import { TopoLines, SectionRule } from "../components/decor";
import { buildDashboardCsv, getDashboard, getRegionMetrics, getStates, getTrendForecast, getYears, FORECAST_METRICS, type DashboardData, type ForecastMetric } from "../lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BhoomiSetu, national land governance intelligence platform" },
      {
        name: "description",
        content:
          "National indicators on land record digitisation, disputes, women's land ownership, climate vulnerability and research outputs.",
      },
      { property: "og:title", content: "BhoomiSetu, land governance intelligence" },
      {
        property: "og:description",
        content: "Evidence dashboard for research, policy innovation and land governance in India. Sample data.",
      },
    ],
  }),
  component: Dashboard,
});

/* ------------------------------- hero ------------------------------- */

function Hero({ year, years, onYear, onDownload, canDownload }: {
  year: number;
  years: number[];
  onYear: (y: number) => void;
  onDownload: () => void;
  canDownload: boolean;
}) {
  return (
    <section className="dark-section relative -mx-4 -mt-6 overflow-hidden px-4 pb-12 pt-14 sm:pb-16 sm:pt-20">
      <TopoLines className="opacity-70" />
      <div className="bs-grid-overlay-dark absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <div className="anim-up flex flex-wrap items-center gap-3">
          <span className="eyebrow-dark">Government of India, Prototype</span>
          <span className="inline-flex items-center gap-1.5 border border-[oklch(0.72_0.13_70/45%)] bg-[oklch(0.72_0.13_70/12%)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent-bright)]">
            <span className="anim-pulse-soft inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-bright)]" aria-hidden="true" />
            Demo Environment
          </span>
        </div>
        <h1 className="anim-up mt-5 max-w-3xl font-serif text-4xl leading-[1.08] text-[var(--dark-foreground)] sm:text-6xl" style={{ animationDelay: "120ms" }}>
          Land Governance
          <br />
          <span className="text-[var(--accent-bright)]">Intelligence Platform</span>
        </h1>
        <p className="anim-up mt-5 max-w-2xl text-base leading-7 text-[var(--dark-muted)] sm:text-lg" style={{ animationDelay: "240ms" }}>
          Evidence, analytics and policy intelligence for India's evolving land ecosystem.
          Indicators on digitisation, disputes, ownership equity, climate exposure and research output.
        </p>
        <div className="anim-up mt-8 flex flex-wrap items-end gap-4" style={{ animationDelay: "360ms" }}>
          <label className="block text-sm">
            <span className="card-label mb-1.5 block text-[var(--dark-muted)]">Reporting year</span>
            <select
              value={year}
              onChange={(e) => onYear(Number(e.target.value))}
              className="!w-40 dark:!border-[var(--dark-border)] dark:!bg-[var(--dark-raised)] dark:!text-[var(--dark-foreground)]"
              aria-label="Reporting year"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
          <button type="button" className="btn-dark" onClick={onDownload} disabled={!canDownload}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 2v8m0 0 3.5-3.5M8 10 4.5 6.5M2.5 13.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download report (CSV)
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- KPIs ------------------------------- */

type KpiDef = {
  key: keyof DashboardData["kpis"];
  label: string;
  decimals: number;
  unit?: string;
  note: string;
  icon: React.ReactNode;
  accent?: boolean;
};

const KPI_DEFS: KpiDef[] = [
  {
    key: "digitized",
    label: "Records Digitized",
    decimals: 0,
    unit: "%",
    note: "Share of rural survey records",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8.5" y="8.5" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    accent: true,
  },
  {
    key: "pendingDisputes",
    label: "Pending Land Disputes",
    decimals: 0,
    note: "Cases open across revenue and civil courts",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2.5 17.5 17h-15L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="14.4" r="0.9" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "avgResolutionDays",
    label: "Avg Resolution Time",
    decimals: 0,
    unit: "days",
    note: "Mean days to dispute resolution",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 5.5V10l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "womenOwned",
    label: "Women-Owned Land",
    decimals: 1,
    unit: "%",
    note: "Titles recorded in a woman's name",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 13.5c1.5-2 3.5-2 5 0M13 13.5c-1.5-2-3.5-2-5 0M15.5 9.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "climateIndex",
    label: "Climate Vulnerability",
    decimals: 2,
    note: "Composite index, 0 low to 1 high",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 14c2.5-4 4.5-4 7 0s4.5 4 7 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3 8.5c2.5-4 4.5-4 7 0s4.5 4 7 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    key: "researchOutputs",
    label: "Research Outputs",
    decimals: 0,
    note: "Items indexed in the repository",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 3h9l3 3v11H4V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 9h6M7 12.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

function KpiCard({ def, data, index }: {
  def: KpiDef;
  data: DashboardData;
  index: number;
}) {
  const value = data.kpis[def.key];
  /* Historical context from the same endpoint's time series where available. */
  const spark: number[] | null = def.key === "digitized" ? data.digitizedSeries.values : null;
  const prevValue =
    def.key === "digitized" && spark && spark.length >= 2 ? spark[spark.length - 2] : null;
  const trend =
    prevValue !== null && prevValue !== undefined && prevValue !== 0
      ? value - prevValue
      : null;
  const isPrimary = def.accent === true;

  return (
    <Reveal delay={index * 70} className={isPrimary ? "sm:col-span-2 lg:col-span-1" : ""}>
      <article
        className={`panel panel-hover group relative h-full p-5 ${isPrimary ? "border-[var(--primary)] border-l-4" : ""}`}
        style={{ minHeight: 150 }}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="card-label">{def.label}</p>
          <span
            className={`shrink-0 transition-colors duration-300 ${isPrimary ? "text-[var(--accent)]" : "text-[var(--primary-bright)] group-hover:text-[var(--primary)]"}`}
          >
            {def.icon}
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`metric-num ${isPrimary ? "text-5xl" : "text-4xl"} anim-count`}>
            <CountUp value={value} decimals={def.decimals} />
          </span>
          {def.unit ? <span className="text-sm font-semibold text-[var(--muted-foreground)]">{def.unit}</span> : null}
          {trend !== null && trend !== 0 ? (
            <span
              className={`ml-auto inline-flex items-center gap-0.5 text-xs font-semibold ${trend > 0 ? "text-[var(--primary-bright)]" : "text-[var(--accent)]"}`}
              title={`Change from previous reporting period in the series`}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                {trend > 0 ? <path d="M5 1.5 8.5 8h-7L5 1.5Z" fill="currentColor" /> : <path d="M5 8.5 1.5 2h7L5 8.5Z" fill="currentColor" />}
              </svg>
              {Math.abs(trend).toFixed(def.decimals)}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{def.note}</p>
        {spark && spark.length >= 2 ? (
          <svg viewBox={`0 0 ${spark.length * 12} 26`} className="mt-3 h-7 w-full" preserveAspectRatio="none" aria-hidden="true">
            <polyline
              points={spark.map((v, i) => `${i * 12 + 4},${26 - ((v / Math.max(...spark, 1)) * 22 + 2)}`).join(" ")}
              fill="none"
              stroke="var(--primary-bright)"
              strokeWidth="1.5"
              className="anim-line"
              style={{ "--bs-dash-len": 400 } as React.CSSProperties}
            />
          </svg>
        ) : null}
      </article>
    </Reveal>
  );
}

/* ------------------------------ insights ------------------------------ */

function KeyInsights({ data, metrics }: { data: DashboardData; metrics: Awaited<ReturnType<typeof getRegionMetrics>> }) {
  type Insight = { title: string; body: string; tone: "primary" | "accent" | "neutral" };
  const insights: Insight[] = [];

  const dig = data.digitizedSeries.values;
  if (dig.length >= 2) {
    const delta = dig[dig.length - 1]! - dig[0]!;
    insights.push({
      title: "Digitisation trend",
      body:
        delta > 0
          ? `Records digitisation has risen from ${Math.round(dig[0]!)}% to ${Math.round(dig[dig.length - 1]!)}% across the reporting period shown.`
          : delta < 0
            ? `Records digitisation has declined from ${Math.round(dig[0]!)}% to ${Math.round(dig[dig.length - 1]!)}% across the reporting period shown.`
            : "Records digitisation has remained stable across the reporting period shown.",
      tone: "primary",
    });
  }

  const withDisputes = metrics.filter((m) => m.pendingDisputes !== null);
  if (withDisputes.length > 0) {
    const sorted = [...withDisputes].sort((a, b) => (b.pendingDisputes ?? 0) - (a.pendingDisputes ?? 0));
    const top = sorted.slice(0, 3);
    insights.push({
      title: "Dispute pressure",
      body: `${top.map((m) => m.region).join(", ")} carry the highest pending dispute volumes for ${data.year}.`,
      tone: "accent",
    });
  }

  const withClimate = metrics.filter((m) => m.climateIndex !== null);
  if (withClimate.length > 0) {
    const avg = withClimate.reduce((s, m) => s + (m.climateIndex ?? 0), 0) / withClimate.length;
    const high = withClimate.filter((m) => (m.climateIndex ?? 0) > avg);
    insights.push({
      title: "Climate exposure",
      body: high.length > 0
        ? `${high.length} of ${withClimate.length} reporting regions sit above the average climate vulnerability index of ${avg.toFixed(2)}.`
        : `All reporting regions sit at or below the average climate vulnerability index of ${avg.toFixed(2)}.`,
      tone: "neutral",
    });
  }

  if (insights.length === 0) {
    return (
      <div className="panel h-full p-6">
        <h3 className="font-serif text-lg">Key insights</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Insights will appear once regional reporting data is available for the selected year.
        </p>
      </div>
    );
  }

  const toneClass: Record<Insight["tone"], string> = {
    primary: "text-[var(--primary)] border-[var(--primary)]/30 bg-[var(--primary-soft)]",
    accent: "text-[var(--accent)] border-[oklch(0.55_0.125_62/30%)] bg-[var(--accent-soft)]",
    neutral: "text-[var(--foreground)] border-[var(--border)] bg-[var(--surface)]",
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <h3 className="font-serif text-xl">Key insights, {data.year}</h3>
      <ul className="stagger flex flex-1 flex-col gap-3">
        {insights.map((i) => (
          <li key={i.title} className={`border p-4 ${toneClass[i.tone]} transition-transform duration-200 hover:translate-x-1`}>
            <p className="text-xs font-bold uppercase tracking-[0.1em]">{i.title}</p>
            <p className="mt-1.5 text-sm leading-6 text-[var(--foreground)] opacity-90">{i.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------ trend forecast ------------------------------ */

/**
 * "Trend forecast" card: one state, one metric, actual 2019-2024 history from
 * land_metrics joined to the 2025-2027 linear-trend values from the forecasts
 * table. The forecast half is dashed and accent-colored; both halves stay
 * visually connected by sharing the 2024 junction point.
 */
function TrendForecastCard() {
  const statesQuery = useQuery({ queryKey: ["states"], queryFn: getStates });
  const [state, setState] = useState("");
  const [metric, setMetric] = useState<ForecastMetric>("records_digitized_pct");

  /* Adopt the first loaded state, matching the simulator's control pattern. */
  if (statesQuery.data && statesQuery.data.length > 0 && !state) setState(statesQuery.data[0]!);

  const query = useQuery({
    queryKey: ["trendForecast", state, metric],
    queryFn: () => getTrendForecast(state, metric),
    enabled: state !== "",
  });

  const meta = FORECAST_METRICS.find((m) => m.key === metric) ?? FORECAST_METRICS[0]!;
  const hasData = !!query.data && (query.data.actual.length > 0 || query.data.forecast.length > 0);

  /* Combined label axis: actual years first, then forecast years. The chart
     re-states the 2024 value in the forecast path so its dashed line starts
     exactly where the solid line ends. */
  const labels = hasData
    ? [...query.data!.actual.map((p) => String(p.year)), ...query.data!.forecast.map((p) => String(p.year))]
    : [];
  const actualValues = hasData ? query.data!.actual.map((p) => p.value) : [];
  /* Forecast path includes the 2024 junction so the dashed segment connects. */
  const forecastValues = hasData
    ? [query.data!.actual.at(-1)?.value ?? null, ...query.data!.forecast.map((p) => p.value)]
    : [];
  const forecastStartIndex = hasData ? query.data!.actual.length - 1 : 0;

  return (
    <figure className="panel panel-hover p-5">
      <figcaption className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <span className="text-sm font-semibold text-[var(--ink)]">
          Trend forecast, {state || "select a state"}
          <span className="mt-0.5 block text-xs font-normal leading-5 text-[var(--muted-foreground)]">
            Actual values 2019 to 2024 from land_metrics, joined to linear trend values 2025 to 2027 from the forecasts
            table.
          </span>
        </span>
        <ul className="flex flex-wrap gap-4 text-xs text-[var(--muted-foreground)]">
          <li className="flex items-center gap-2">
            <span className="inline-block h-0 w-6" style={{ borderTop: "2px solid var(--primary)" }} />
            Actual
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-0 w-6" style={{ borderTop: "2px dashed var(--accent)" }} />
            Forecast
          </li>
        </ul>
      </figcaption>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="card-label mb-1.5 block">State</span>
          <select value={state} onChange={(e) => setState(e.target.value)} aria-label="Forecast state">
            {(statesQuery.data ?? []).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="card-label mb-1.5 block">Metric</span>
          <select value={metric} onChange={(e) => setMetric(e.target.value as ForecastMetric)} aria-label="Forecast metric">
            {FORECAST_METRICS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {query.isPending ? <Loading /> : null}
      {query.isError ? <ErrorBox message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}
      {hasData ? (
        <>
          <div className="overflow-x-auto">
            <TrendForecastChart
              labels={labels}
              actualValues={actualValues}
              forecastValues={forecastValues}
              forecastStartIndex={forecastStartIndex}
              unit={meta.unit}
              decimals={meta.decimals}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Linear trend forecast on sample data. Not a prediction of real outcomes.
          </p>
        </>
      ) : null}
      {!query.isPending && !query.isError && !hasData ? (
        <EmptyBox
          title="No forecast data"
          message={`No historical or forecast values are available for ${state || "this state"} and ${meta.label.toLowerCase()}.`}
        />
      ) : null}
    </figure>
  );
}

/**
 * SVG chart for the trend forecast card, following the existing chart visual
 * language (gridlines, tabular ticks, hover titles). The actual line is solid
 * primary; the forecast line is dashed accent. Both are drawn from the same
 * coordinate space so the halves read as one continuous series.
 */
function TrendForecastChart({ labels, actualValues, forecastValues, forecastStartIndex, unit, decimals }: {
  labels: string[];
  actualValues: (number | null)[];
  /** Length labels.length; index 0 is the 2024 junction point. */
  forecastValues: (number | null)[];
  forecastStartIndex: number;
  unit: string;
  decimals: number;
}) {
  const w = Math.max(560, labels.length * 58);
  const h = 280;
  const pad = { l: 56, r: 20, t: 18, b: 40 };
  const all = [...actualValues, ...forecastValues].filter((v): v is number => v !== null);
  const max = niceMax(Math.max(...all, 1));
  const min = 0;
  const plotW = w - pad.l - pad.r;
  const plotH = h - pad.t - pad.b;
  const x = (i: number) => pad.l + (labels.length === 1 ? plotW / 2 : (i * plotW) / (labels.length - 1));
  const y = (v: number) => pad.t + plotH - ((v - min) / (max - min)) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + f * (max - min));

  const toPath = (values: (number | null)[], startIndex: number) => {
    let d = "";
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v === null || v === undefined) continue;
      d += `${d === "" ? "M" : "L"}${x(startIndex + i).toFixed(1)},${y(v).toFixed(1)} `;
    }
    return d.trim();
  };

  const actualPath = toPath(actualValues, 0);
  const forecastPath = toPath(forecastValues, forecastStartIndex);
  const junction = actualValues[forecastStartIndex];
  const fmt = (v: number) => v.toLocaleString("en-IN", { maximumFractionDigits: decimals });

  return (
    <svg width={w} height={h} role="img" aria-label="Trend forecast chart, actual history with linear trend forecast" className="block">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--grid-line)" strokeWidth="1" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)" style={{ fontVariantNumeric: "tabular-nums" }}>
            {Number(t.toFixed(2))}
            {unit}
          </text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text
          key={l + i}
          x={x(i)}
          y={h - pad.b + 20}
          textAnchor="middle"
          fontSize="11"
          fontWeight={i > forecastStartIndex ? "600" : undefined}
          fill={i > forecastStartIndex ? "var(--primary)" : "var(--muted-foreground)"}
        >
          {l}
        </text>
      ))}

      {/* Forecast zone: subtle vertical separator at the junction year. */}
      <line
        x1={x(forecastStartIndex)}
        x2={x(forecastStartIndex)}
        y1={pad.t}
        y2={pad.t + plotH}
        stroke="var(--border)"
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      <path d={actualPath} fill="none" stroke="var(--primary)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="anim-line" style={{ "--bs-dash-len": 2400 } as React.CSSProperties} />
      <path d={forecastPath} fill="none" stroke="var(--accent)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 5" />

      {actualValues.map((v, i) =>
        v === null ? null : (
          <g key={`a${i}`}>
            <circle cx={x(i)} cy={y(v)} r="7" fill="transparent">
              <title>{`${labels[i]}: ${fmt(v)}${unit}`}</title>
            </circle>
            <circle cx={x(i)} cy={y(v)} r="3" fill="var(--surface)" stroke="var(--primary)" strokeWidth="1.75" />
          </g>
        ),
      )}
      {/* Forecast points offset by one slot (index 0 is the shared junction). */}
      {forecastValues.map((v, i) =>
        i === 0 || v === null ? null : (
          <g key={`f${i}`}>
            <circle cx={x(forecastStartIndex + i)} cy={y(v)} r="7" fill="transparent">
              <title>{`${labels[forecastStartIndex + i]}: ${fmt(v)}${unit} (forecast)`}</title>
            </circle>
            <circle cx={x(forecastStartIndex + i)} cy={y(v)} r="3" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.75" strokeDasharray="2 2" />
          </g>
        ),
      )}
      {/* Junction marker shared by both halves. */}
      {junction !== null && junction !== undefined ? (
        <circle cx={x(forecastStartIndex)} cy={y(junction)} r="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.75" />
      ) : null}

      <line x1={pad.l} x2={w - pad.r} y1={pad.t + plotH} y2={pad.t + plotH} stroke="var(--primary)" strokeWidth="1" opacity="0.5" />
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + plotH} stroke="var(--primary)" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

/* ------------------------------ dashboard ------------------------------ */

function Dashboard() {
  /* Start unset and adopt the newest year the live dataset actually contains,
     so the first paint always lands on real data (no hardcoded year). */
  const [year, setYear] = useState<number | null>(null);
  const [layer, setLayer] = useState<MapLayer>("digitized");
  const yearsQuery = useQuery({ queryKey: ["years"], queryFn: getYears });
  const years = yearsQuery.data ?? [];

  useEffect(() => {
    if (year === null && yearsQuery.data && yearsQuery.data.length > 0) {
      setYear(yearsQuery.data[0]!);
    }
  }, [year, yearsQuery.data]);

  const activeYear = year ?? yearsQuery.data?.[0] ?? null;
  const query = useQuery({
    queryKey: ["dashboard", activeYear],
    queryFn: () => getDashboard(activeYear!),
    enabled: activeYear !== null,
  });
  const regionQuery = useQuery({
    queryKey: ["regionMetrics", activeYear],
    queryFn: () => getRegionMetrics(activeYear!),
    enabled: activeYear !== null,
  });

  function downloadCsv() {
    if (!query.data || !regionQuery.data || activeYear === null) return;
    const blob = new Blob([buildDashboardCsv(query.data, regionQuery.data)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `land-report-${activeYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Page>
      {activeYear !== null ? (
        <Hero
          year={activeYear}
          years={years.length > 0 ? years : [activeYear]}
          onYear={setYear}
          onDownload={downloadCsv}
          canDownload={!!query.data}
        />
      ) : null}

      <div className="mt-10 space-y-10">
        {/* KPI overview */}
        <section aria-label="National indicators overview">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-1">National indicators</p>
              <h2 className="font-serif text-2xl">Overview, {year}</h2>
            </div>
            <span className="hidden text-xs text-[var(--muted-foreground)] sm:block">Aggregated across reporting regions</span>
          </div>
          {query.isPending ? <Loading /> : null}
          {query.isError ? <ErrorBox message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}
        {query.data ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {KPI_DEFS.map((def, i) => (
              <KpiCard key={def.key} def={def} data={query.data!} index={i} />
            ))}
          </div>
        ) : null}
        </section>

        <SectionRule />

        {/* GIS intelligence + insights */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]" aria-label="Regional intelligence">
          <Reveal>
            <div className="mb-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow mb-1">Regional intelligence</p>
                  <h2 className="font-serif text-2xl">Land intelligence map</h2>
                </div>
                {/* Context chips — every value derived from live state */}
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em]">
                  <span className="chip">{regionQuery.data?.length ?? 12} regions</span>
                  <span className="chip">Land metrics dataset</span>
                  <span className="chip !border-[var(--primary)] !text-[var(--primary)]">
                    Layer: {layer === "digitized" ? "Digitized" : layer === "disputes" ? "Disputes" : "Climate"}
                  </span>
                </div>
              </div>
              <p className="mt-2 max-w-xl text-sm text-[var(--muted-foreground)]">
                Explore regional land indicators across India. Hover a region for a quick value, click to analyse its
                full metric panel; switch layers to transform the view.
              </p>
            </div>
            {regionQuery.isPending ? <Loading /> : null}
            {regionQuery.isError ? <ErrorBox message={(regionQuery.error as Error).message} onRetry={() => regionQuery.refetch()} /> : null}
            {regionQuery.data ? <RegionMap metrics={regionQuery.data} layer={layer} onLayerChange={setLayer} /> : null}
          </Reveal>
          <Reveal delay={140}>
            {query.isError || regionQuery.isError ? (
              <div className="panel h-full p-6">
                <h3 className="font-serif text-lg">Key insights</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Insights are unavailable because dashboard data could not be loaded. See the error details above.
                </p>
              </div>
            ) : query.data && regionQuery.data ? (
              <KeyInsights data={query.data} metrics={regionQuery.data} />
            ) : (
              <div className="panel h-full p-6">
                <h3 className="font-serif text-lg">Key insights</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">Loading dashboard context...</p>
              </div>
            )}
          </Reveal>
        </section>

        <SectionRule />

        {/* Trend charts */}
        {query.data ? (
          <section className="space-y-8" aria-label="Trend charts">
            <div>
              <p className="eyebrow mb-1">Longitudinal view</p>
              <h2 className="font-serif text-2xl">Trend analysis</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Reveal>
                <LineChart
                  title="Records digitized over time (%)"
                  description="National share of rural survey records digitised, by reporting year."
                  labels={query.data.digitizedSeries.labels}
                  series={[{ name: "Records digitized", values: query.data.digitizedSeries.values }]}
                  yUnit="%"
                />
              </Reveal>
              <Reveal delay={120}>
                <LineChart
                  title="Built-up land over time (%)"
                  description="National share of land under built-up use, by reporting year."
                  labels={query.data.builtUpSeries.labels}
                  series={[{ name: "Built-up land", values: query.data.builtUpSeries.values }]}
                  yUnit="%"
                />
              </Reveal>
            </div>
            <TrendForecastCard />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Reveal delay={60}>
                <BarChart
                  title="Pending disputes by state, top 10 (thousands of cases)"
                  description="Regions with the highest open dispute volumes for the selected year."
                  data={query.data.disputesByState}
                />
              </Reveal>
              <Reveal delay={180}>
                <BarChart
                  title="Research outputs by topic"
                  description="Records indexed in the BhoomiSetu evidence repository."
                  data={query.data.researchByTopic}
                />
              </Reveal>
            </div>
          </section>
        ) : null}

        {/* Projects + report note */}
        {query.data ? (
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.4fr]" aria-label="Programme progress">
            <Reveal>
              <ProgressList title="Project progress by component" data={query.data.progress} />
            </Reveal>
            <Reveal delay={120}>
              <div className="dark-section relative overflow-hidden p-6 sm:p-8">
                <TopoLines opacity={0.5} />
                <div className="relative">
                  <p className="eyebrow-dark mb-2">Reporting</p>
                  <h3 className="font-serif text-2xl text-[var(--dark-foreground)]">Download the current briefing</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[var(--dark-muted)]">
                    Export the visible KPIs and chart series for {query.data.year} as a CSV briefing pack for offline
                    analysis or annexing to a policy note.
                  </p>
                  <button type="button" className="btn-dark mt-5" onClick={downloadCsv}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M8 2v8m0 0 3.5-3.5M8 10 4.5 6.5M2.5 13.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Download report (CSV)
                  </button>
                </div>
              </div>
            </Reveal>
          </section>
        ) : null}
      </div>
    </Page>
  );
}
