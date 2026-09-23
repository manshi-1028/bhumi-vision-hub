/**
 * Pure policy-simulation math for the /simulator page.
 *
 * No data access lives here: src/lib/api.ts fetches the real baseline row
 * (land_metrics, latest year) and the selected policy_levers row, then calls
 * computeSimulation. For each metric and each year n of the 5-year horizon:
 *
 *   projected = baseline + intensity x lever effect x (n / 5)
 *
 * Effect units follow the policy_levers columns: eff_digitization and
 * eff_women_owned are percentage-point changes, eff_disputes_pct is a
 * percentage change applied to the baseline pending-disputes count, and
 * eff_resolution_days is a change in days. Percentages are capped at 100 and
 * counts never drop below 0.
 */

export const HORIZON_YEARS = 5;

export interface SimulationEffects {
  effDigitization: number;
  effDisputesPct: number;
  effResolutionDays: number;
  effWomenOwned: number;
}

export interface SimulationBaseline {
  year: number;
  recordsDigitizedPct: number;
  pendingDisputes: number;
  avgResolutionDays: number;
  womenOwnedPct: number;
}

export interface SimulationInput {
  state: string;
  leverName: string;
  intensity: number;
  baseline: SimulationBaseline;
  effects: SimulationEffects;
}

export interface SimulationRow {
  indicator: string;
  unit: string;
  decimals: number;
  baseline: number;
  projected: number;
}

export interface SimulationMetricChart {
  key: "digitized" | "disputes" | "resolution" | "women";
  title: string;
  /** Appended to chart ticks and hover titles ("%"," days",""). */
  unit: string;
  baselineSeries: number[];
  projectedSeries: number[];
}

export interface SimulationComputation {
  horizonYears: string[];
  rows: SimulationRow[];
  charts: SimulationMetricChart[];
  summary: string;
}

const clampPercent = (v: number): number => Math.min(100, Math.max(0, v));
const clampCount = (v: number): number => Math.max(0, v);
const roundTo = (v: number, decimals: number): number => Number(v.toFixed(decimals));
const fmt = (v: number, decimals: number): string =>
  v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const signed = (v: number, decimals: number): string => `${v >= 0 ? "+" : "-"}${fmt(Math.abs(v), decimals)}`;

/**
 * Computes the full simulation: per-metric 5-year baseline and projected
 * paths, final-year comparison rows, the chart series, and the one-sentence
 * result summary. Year 5 carries the full intensity x effect adjustment.
 */
export function computeSimulation(input: SimulationInput): SimulationComputation {
  const { intensity, baseline, effects, leverName } = input;

  const horizonYears = Array.from({ length: HORIZON_YEARS }, (_, i) => String(baseline.year + 1 + i));
  const path = (at: (n: number) => number) => Array.from({ length: HORIZON_YEARS }, (_, i) => at(i + 1));

  const digitized = path((n) =>
    roundTo(clampPercent(baseline.recordsDigitizedPct + intensity * effects.effDigitization * (n / HORIZON_YEARS)), 2),
  );
  const women = path((n) =>
    roundTo(clampPercent(baseline.womenOwnedPct + intensity * effects.effWomenOwned * (n / HORIZON_YEARS)), 2),
  );
  const disputes = path((n) =>
    roundTo(clampCount(baseline.pendingDisputes * (1 + (effects.effDisputesPct * intensity * (n / HORIZON_YEARS)) / 100)), 0),
  );
  const resolution = path((n) =>
    roundTo(clampCount(baseline.avgResolutionDays + intensity * effects.effResolutionDays * (n / HORIZON_YEARS)), 0),
  );

  const last = HORIZON_YEARS - 1;
  const rows: SimulationRow[] = [
    { indicator: "Records digitized", unit: "%", decimals: 2, baseline: baseline.recordsDigitizedPct, projected: digitized[last]! },
    { indicator: "Pending disputes", unit: "count", decimals: 0, baseline: baseline.pendingDisputes, projected: disputes[last]! },
    { indicator: "Average resolution time", unit: "days", decimals: 0, baseline: baseline.avgResolutionDays, projected: resolution[last]! },
    { indicator: "Women-owned land", unit: "%", decimals: 2, baseline: baseline.womenOwnedPct, projected: women[last]! },
  ];

  const flat = (v: number) => Array.from({ length: HORIZON_YEARS }, () => v);
  const charts: SimulationMetricChart[] = [
    { key: "digitized", title: "Records digitized", unit: "%", baselineSeries: flat(baseline.recordsDigitizedPct), projectedSeries: digitized },
    { key: "disputes", title: "Pending disputes", unit: "", baselineSeries: flat(baseline.pendingDisputes), projectedSeries: disputes },
    { key: "resolution", title: "Average resolution time", unit: " days", baselineSeries: flat(baseline.avgResolutionDays), projectedSeries: resolution },
    { key: "women", title: "Women-owned land", unit: "%", baselineSeries: flat(baseline.womenOwnedPct), projectedSeries: women },
  ];

  const disputesPctChange =
    baseline.pendingDisputes > 0 ? ((disputes[last]! - baseline.pendingDisputes) / baseline.pendingDisputes) * 100 : 0;
  const summary =
    `With ${leverName} at intensity ${intensity} through ${horizonYears[last]}, records digitized moves ${signed(digitized[last]! - baseline.recordsDigitizedPct, 2)} pp to ${fmt(digitized[last]!, 2)}%, ` +
    `pending disputes change ${signed(disputesPctChange, 1)}% to ${fmt(disputes[last]!, 0)}, average resolution time moves ${signed(resolution[last]! - baseline.avgResolutionDays, 0)} days to ${fmt(resolution[last]!, 0)}, ` +
    `and women-owned land moves ${signed(women[last]! - baseline.womenOwnedPct, 2)} pp to ${fmt(women[last]!, 2)}%.`;

  return { horizonYears, rows, charts, summary };
}
