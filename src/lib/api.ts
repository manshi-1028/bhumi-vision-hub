/**
 * Single data access layer. All Supabase queries go through here.
 * React components must never call Supabase directly.
 */

import { supabase } from "./supabase";

export type Role = "researcher" | "institution" | "official";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
}

/* -------------------------------- reference ------------------------------- */

export async function getStates(): Promise<string[]> {
  const { data, error } = await supabase.from("regions").select("name").order("name");
  if (error) throw new Error("Failed to load states.");
  return (data ?? []).map((r) => r.name);
}

export async function getTopics(): Promise<string[]> {
  const { data, error } = await supabase.from("evidence").select("topic").order("topic");
  if (error) throw new Error("Failed to load topics.");
  return [...new Set((data ?? []).map((e) => e.topic).filter(Boolean))];
}

export async function getTypes(): Promise<string[]> {
  const { data, error } = await supabase.from("evidence").select("type").order("type");
  if (error) throw new Error("Failed to load types.");
  return [...new Set((data ?? []).map((e) => e.type).filter(Boolean))];
}

export async function getYears(): Promise<number[]> {
  const { data, error } = await supabase
    .from("land_metrics")
    .select("year")
    .order("year", { ascending: false });
  if (error) throw new Error("Failed to load years.");
  return [...new Set((data ?? []).map((e) => e.year))];
}

/* -------------------------------- dashboard ------------------------------- */

export interface RegionMetrics {
  region: string;
  digitized: number | null;
  pendingDisputes: number | null;
  avgResolutionDays: number | null;
  womenOwned: number | null;
  climateIndex: number | null;
  builtUp: number | null;
}

export async function getRegionMetrics(year: number): Promise<RegionMetrics[]> {
  const { data, error } = await supabase
    .from("land_metrics")
    .select(`
      records_digitized_pct, pending_disputes, avg_resolution_days,
      women_owned_pct, climate_vuln_index, built_up_pct,
      regions (name)
    `)
    .eq("year", year)
    .order("year", { ascending: false });

  if (error) throw new Error("Failed to load regional metrics.");

  return (data ?? [])
    .map((m) => ({
      region: (m.regions as unknown as { name: string } | null)?.name ?? "Unknown",
      digitized: m.records_digitized_pct ?? null,
      pendingDisputes: m.pending_disputes ?? null,
      avgResolutionDays: m.avg_resolution_days ?? null,
      womenOwned: m.women_owned_pct ?? null,
      climateIndex: m.climate_vuln_index ?? null,
      builtUp: m.built_up_pct ?? null,
    }))
    .sort((a, b) => a.region.localeCompare(b.region));
}

export interface DashboardData {
  year: number;
  kpis: {
    digitized: number;
    pendingDisputes: number;
    avgResolutionDays: number;
    womenOwned: number;
    climateIndex: number;
    researchOutputs: number;
  };
  digitizedSeries: { labels: string[]; values: number[] };
  builtUpSeries: { labels: string[]; values: number[] };
  disputesByState: { label: string; value: number }[];
  researchByTopic: { label: string; value: number }[];
  progress: { label: string; value: number; status: string | null }[];
}

export async function getDashboard(year: number): Promise<DashboardData> {
  // Fetch land metrics for the selected year (all regions)
  const { data: metrics, error: mErr } = await supabase
    .from("land_metrics")
    .select(`
      records_digitized_pct, pending_disputes, avg_resolution_days,
      women_owned_pct, climate_vuln_index, built_up_pct,
      region_id, regions (name)
    `)
    .eq("year", year);

  if (mErr) throw new Error("Failed to load dashboard metrics.");
  if (!metrics || metrics.length === 0) throw new Error(`No data available for ${year}.`);

  // Aggregate national KPIs (average across regions)
  const n = metrics.length;
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const digitized = Math.round(sum(metrics.map((m) => m.records_digitized_pct ?? 0)) / n);
  const pendingDisputes = Math.round(sum(metrics.map((m) => m.pending_disputes ?? 0)));
  const avgResolutionDays = Math.round(sum(metrics.map((m) => m.avg_resolution_days ?? 0)) / n);
  const womenOwned = Math.round((sum(metrics.map((m) => m.women_owned_pct ?? 0)) / n) * 10) / 10;
  const climateIndex = Math.round((sum(metrics.map((m) => m.climate_vuln_index ?? 0)) / n) * 100) / 100;

  // Research outputs count
  const { count: researchOutputs, error: rErr } = await supabase
    .from("evidence")
    .select("id", { count: "exact", head: true })
    .lte("year", year);
  if (rErr) throw new Error("Failed to load research output count.");

  // Time series: aggregate across all regions for each year
  const { data: allMetrics, error: tsErr } = await supabase
    .from("land_metrics")
    .select("year, records_digitized_pct, built_up_pct")
    .order("year");
  if (tsErr) throw new Error("Failed to load time series data.");

  const yearMap = new Map<number, { dig: number[]; bu: number[] }>();
  for (const m of allMetrics ?? []) {
    const key = m.year;
    if (!yearMap.has(key)) yearMap.set(key, { dig: [], bu: [] });
    yearMap.get(key)!.dig.push(m.records_digitized_pct ?? 0);
    yearMap.get(key)!.bu.push(m.built_up_pct ?? 0);
  }

  const sortedYears = [...yearMap.keys()].sort((a, b) => a - b);
  const digitizedSeries = {
    labels: sortedYears.map(String),
    values: sortedYears.map((y) => Math.round((sum(yearMap.get(y)!.dig) / yearMap.get(y)!.dig.length) * 10) / 10),
  };
  const builtUpSeries = {
    labels: sortedYears.map(String),
    values: sortedYears.map((y) => Math.round((sum(yearMap.get(y)!.bu) / yearMap.get(y)!.bu.length) * 10) / 10),
  };

  // Disputes by state (top 10)
  const disputesByState = metrics
    .map((m) => ({
      label: (m.regions as unknown as { name: string } | null)?.name ?? "Unknown",
      value: Math.round((m.pending_disputes ?? 0) / 1000),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Research by topic
  const { data: evidence, error: evErr } = await supabase
    .from("evidence")
    .select("topic")
    .lte("year", year);
  if (evErr) throw new Error("Failed to load research by topic.");
  const topicCount = new Map<string, number>();
  for (const e of evidence ?? []) {
    if (e.topic) topicCount.set(e.topic, (topicCount.get(e.topic) ?? 0) + 1);
  }
  const researchByTopic = [...topicCount.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  // Project progress
  const { data: projects, error: pErr } = await supabase
    .from("projects")
    .select("title, status, progress_pct")
    .order("title");
  if (pErr) throw new Error("Failed to load project progress.");
  const progress = (projects ?? []).map((p) => ({
    label: p.title,
    value: p.progress_pct ?? 0,
    status: p.status ?? null,
  }));

  return {
    year,
    kpis: {
      digitized,
      pendingDisputes,
      avgResolutionDays,
      womenOwned,
      climateIndex,
      researchOutputs: researchOutputs ?? 0,
    },
    digitizedSeries,
    builtUpSeries,
    disputesByState,
    researchByTopic,
    progress,
  };
}

/* --------------------------------- library -------------------------------- */

export interface LibraryItem {
  /** Normalized to a string at this boundary: the live evidence table uses a
   *  bigint id column (not uuid), and UI helpers call String methods on it. */
  id: string;
  title: string;
  type: string;
  topic: string;
  state: string;
  year: number;
  summary: string;
  tags: string[];
  source: string;
}

export interface LibraryQuery {
  q?: string;
  type?: string;
  topic?: string;
  state?: string;
  year?: string;
  page?: number;
  pageSize?: number;
}

export interface LibraryResult {
  items: LibraryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function searchLibrary(query: LibraryQuery): Promise<LibraryResult> {
  const pageSize = query.pageSize ?? 10;
  const page = query.page ?? 1;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const q = query.q?.trim() ?? "";

  // Builds the repository query with the requested text-match strategy plus all
  // active filters. A factory (not a shared builder) because the full-text
  // attempt is re-issued with the case-insensitive fallback when it misses.
  const buildQuery = (match: "fts" | "ilike") => {
    const selectRelation = query.state ? "regions!inner (name)" : "regions (name)";
    let db = supabase
      .from("evidence")
      .select(
        `
        id, title, summary, type, topic, tags, year, source,
        region_id, ${selectRelation}
      `,
        { count: "exact" },
      );

    if (q) {
      if (match === "fts") {
        // Postgres full-text search on the precomputed fts column (websearch syntax).
        db = db.textSearch("fts", q, { type: "websearch" });
      } else {
        // Fallback: case-insensitive match against title and summary. Values are
        // double-quoted per PostgREST or= syntax; embedded quotes are doubled.
        const pattern = `%${q.replace(/"/g, '""')}%`;
        db = db.or(`title.ilike."${pattern}",summary.ilike."${pattern}"`);
      }
    }
    if (query.type) db = db.eq("type", query.type);
    if (query.topic) db = db.eq("topic", query.topic);
    if (query.year) db = db.eq("year", Number(query.year));
    if (query.state) db = db.eq("regions.name", query.state);

    return db.order("created_at", { ascending: false }).range(from, to);
  };

  let { data, error, count } = await buildQuery("fts");
  if (error) throw new Error("Failed to search the repository.");

  // Full-text matching can miss short or partial words; retry once with a plain
  // case-insensitive title/summary match before reporting zero results.
  if ((count ?? 0) === 0 && q) {
    ({ data, error, count } = await buildQuery("ilike"));
    if (error) throw new Error("Failed to search the repository.");
  }

  const items: LibraryItem[] = (data ?? []).map((e) => ({
    id: String(e.id),
    title: e.title,
    type: e.type ?? "",
    topic: e.topic ?? "",
    state: (e.regions as unknown as { name: string } | null)?.name ?? "",
    year: e.year ?? 0,
    summary: e.summary ?? "",
    tags: e.tags ?? [],
    source: e.source ?? "",
  }));

  const total = count ?? 0;
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getResearchItem(id: string): Promise<LibraryItem> {
  const { data, error } = await supabase
    .from("evidence")
    .select(`
      id, title, summary, type, topic, tags, year, source,
      region_id, regions (name)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Failed to load the research item.");
  if (!data) throw new Error(`No research item found with reference ${id}.`);

  return {
    id: String(data.id),
    title: data.title,
    type: data.type ?? "",
    topic: data.topic ?? "",
    state: (data.regions as unknown as { name: string } | null)?.name ?? "",
    year: data.year ?? 0,
    summary: data.summary ?? "",
    tags: data.tags ?? [],
    source: data.source ?? "",
  };
}

export async function getRecommended(id: string): Promise<LibraryItem[]> {
  // Fetch the current item to derive the topic and tags used for matching.
  const { data: current } = await supabase
    .from("evidence")
    .select("topic, tags")
    .eq("id", id)
    .maybeSingle();

  if (!current) return [];

  const currentTags: string[] = current.tags ?? [];
  const sharedTagCount = (tags: unknown): number => {
    const set = new Set(currentTags);
    let n = 0;
    for (const t of (tags as string[] | null) ?? []) {
      if (set.has(t)) n++;
    }
    return n;
  };

  const toItem = (e: {
    id: unknown;
    title: string;
    type: string | null;
    topic: string | null;
    regions: unknown;
    year: number | null;
    summary: string | null;
    tags: string[] | null;
    source: string | null;
  }): LibraryItem => ({
    id: String(e.id),
    title: e.title,
    type: e.type ?? "",
    topic: e.topic ?? "",
    state: (e.regions as unknown as { name: string } | null)?.name ?? "",
    year: e.year ?? 0,
    summary: e.summary ?? "",
    tags: e.tags ?? [],
    source: e.source ?? "",
  });

  const RECOMMEND_SELECT = `
      id, title, summary, type, topic, tags, year, source,
      region_id, regions (name)
    `;

  // Candidates: same topic OR overlapping tags, always excluding this item.
  // Two simple queries (the repository is small) avoid fragile or() strings.
  const candidates = new Map<string, { item: LibraryItem; sharedTags: number }>();

  if (current.topic) {
    const { data } = await supabase
      .from("evidence")
      .select(RECOMMEND_SELECT)
      .eq("topic", current.topic)
      .neq("id", id)
      .order("year", { ascending: false })
      .limit(50);
    for (const e of data ?? []) {
      candidates.set(String(e.id), { item: toItem(e), sharedTags: sharedTagCount(e.tags) });
    }
  }

  if (currentTags.length > 0) {
    const { data } = await supabase
      .from("evidence")
      .select(RECOMMEND_SELECT)
      .overlaps("tags", currentTags)
      .neq("id", id)
      .limit(50);
    for (const e of data ?? []) {
      const key = String(e.id);
      if (!candidates.has(key)) {
        candidates.set(key, { item: toItem(e), sharedTags: sharedTagCount(e.tags) });
      }
    }
  }

  // Order: most shared tags first, then newest year. At most 4 items.
  return [...candidates.values()]
    .sort((a, b) => b.sharedTags - a.sharedTags || b.item.year - a.item.year)
    .slice(0, 4)
    .map((c) => c.item);
}

/* ------------------------------- submissions ------------------------------ */

export interface Submission {
  /** Normalized to a string at this boundary (see LibraryItem.id). */
  id: string;
  title: string;
  topic: string;
  body: string;
  status: string;
  createdAt: string;
  userId: string;
}

export async function submitResearch(input: {
  title: string;
  topic: string;
  body: string;
}): Promise<Submission> {
  if (!input.title.trim()) throw new Error("Title is required.");
  if (!input.body.trim()) throw new Error("Summary is required.");

  const { data: userData, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw new Error("Unable to verify your session. Please sign in again.");
  if (!userData.user) throw new Error("You must be signed in to submit.");

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      user_id: userData.user.id,
      title: input.title,
      topic: input.topic,
      body: input.body,
      status: "pending",
    })
    .select("id, title, topic, body, status, created_at, user_id")
    .single();

  if (error) throw new Error("Failed to submit your research. Please try again.");

  return {
    id: String(data.id),
    title: data.title,
    topic: data.topic ?? "",
    body: data.body ?? "",
    status: data.status,
    createdAt: data.created_at,
    userId: data.user_id,
  };
}

export async function getSubmissions(): Promise<Submission[]> {
  const { data, error } = await supabase
    .from("submissions")
    .select("id, title, topic, body, status, created_at, user_id")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to load submissions.");

  return (data ?? []).map((s) => ({
    id: String(s.id),
    title: s.title,
    topic: s.topic ?? "",
    body: s.body ?? "",
    status: s.status,
    createdAt: s.created_at,
    userId: s.user_id,
  }));
}

export async function decideSubmission(id: string, decision: "approve" | "reject"): Promise<void> {
  const status = decision === "approve" ? "approved" : "rejected";

  // Preferred path: the project's server-side approval RPC (if it exists).
  const { error: rpcError } = await supabase.rpc("approve_submission", {
    p_id: id,
    p_status: status,
  });
  if (!rpcError) return;

  // The live database does not define approve_submission (PGRST202) — fall back
  // to a direct status update, which the submissions RLS policies still guard:
  // only sessions the policies allow can change a row. Any other RPC failure is
  // surfaced instead of silently swallowed.
  if (rpcError.code !== "PGRST202") {
    throw new Error(rpcError.message || "Failed to update submission status.");
  }

  const { error: updateError } = await supabase
    .from("submissions")
    .update({ status })
    .eq("id", id)
    .eq("status", "pending"); // only pending rows are decidable
  if (updateError) {
    throw new Error(
      updateError.code === "42501"
        ? "Your account is not permitted to review submissions."
        : updateError.message || "Failed to update submission status.",
    );
  }
}

/* -------------------------------- simulator ------------------------------- */

export interface PolicyLever {
  id: string;
  name: string;
  description: string;
  effDigitization: number;
  effDisputesPct: number;
  effResolutionDays: number;
  effWomenOwned: number;
}

export async function getPolicyLevers(): Promise<PolicyLever[]> {
  const { data, error } = await supabase
    .from("policy_levers")
    .select("id, name, description, eff_digitization, eff_disputes_pct, eff_resolution_days, eff_women_owned")
    .order("name");

  if (error) throw new Error("Failed to load policy levers.");

  return (data ?? []).map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description ?? "",
    effDigitization: l.eff_digitization ?? 0,
    effDisputesPct: l.eff_disputes_pct ?? 0,
    effResolutionDays: l.eff_resolution_days ?? 0,
    effWomenOwned: l.eff_women_owned ?? 0,
  }));
}

export interface SimulationRow {
  indicator: string;
  unit: string;
  baseline: number;
  projected: number;
}

export interface SimulationResult {
  rows: SimulationRow[];
  years: string[];
  baselineSeries: number[];
  projectedSeries: number[];
  headline: string;
}

export async function runSimulation(
  state: string,
  leverId: string,
  intensity: number,
): Promise<SimulationResult> {
  if (!state) throw new Error("Select a state before running a projection.");

  // Get the region's latest metrics as baseline
  const { data: region } = await supabase
    .from("regions")
    .select("id")
    .eq("name", state)
    .maybeSingle();
  if (!region) throw new Error(`No data for ${state}.`);

  const { data: metrics, error: metErr } = await supabase
    .from("land_metrics")
    .select("records_digitized_pct, pending_disputes, avg_resolution_days, women_owned_pct, climate_vuln_index")
    .eq("region_id", region.id)
    .order("year", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (metErr) throw new Error(`Failed to load metrics for ${state}.`);
  if (!metrics) throw new Error(`No metrics found for ${state}.`);

  // Get the selected policy lever
  const { data: lever, error: leverErr } = await supabase
    .from("policy_levers")
    .select("name, eff_digitization, eff_disputes_pct, eff_resolution_days, eff_women_owned")
    .eq("id", leverId)
    .maybeSingle();

  if (leverErr) throw new Error("Failed to load the selected policy lever.");
  if (!lever) throw new Error("Policy lever not found.");

  const k = intensity / 100;

  const baseline = {
    digitized: metrics.records_digitized_pct ?? 70,
    disputes: (metrics.pending_disputes ?? 100000) / 1000,
    resolution: metrics.avg_resolution_days ?? 900,
    women: metrics.women_owned_pct ?? 15,
    climate: metrics.climate_vuln_index ?? 0.6,
  };

  const rows: SimulationRow[] = [
    {
      indicator: "Records digitized",
      unit: "%",
      baseline: Number(baseline.digitized.toFixed(2)),
      projected: Number((baseline.digitized + lever.eff_digitization * k).toFixed(2)),
    },
    {
      indicator: "Pending disputes",
      unit: "thousands",
      baseline: Number(baseline.disputes.toFixed(2)),
      projected: Number((baseline.disputes * (1 + (lever.eff_disputes_pct / 100) * k)).toFixed(2)),
    },
    {
      indicator: "Average resolution time",
      unit: "days",
      baseline: Number(baseline.resolution.toFixed(2)),
      projected: Number((baseline.resolution + lever.eff_resolution_days * k).toFixed(2)),
    },
    {
      indicator: "Women-owned land",
      unit: "%",
      baseline: Number(baseline.women.toFixed(2)),
      projected: Number((baseline.women + lever.eff_women_owned * k).toFixed(2)),
    },
    {
      indicator: "Climate vulnerability",
      unit: "index",
      baseline: Number(baseline.climate.toFixed(2)),
      projected: Number((baseline.climate * (1 - 0.03 * k)).toFixed(2)),
    },
  ];

  const headlineRow = rows[0]!;
  const years = ["2026", "2027", "2028", "2029", "2030"];
  const baselineSeries = years.map((_, i) => Number((headlineRow.baseline + i * 1.2).toFixed(2)));
  const projectedSeries = years.map((_, i) =>
    Number((headlineRow.baseline + i * 1.2 + (headlineRow.projected - headlineRow.baseline) * ((i + 1) / years.length)).toFixed(2)),
  );

  return {
    rows,
    years,
    baselineSeries,
    projectedSeries,
    headline: `${headlineRow.indicator} (${headlineRow.unit})`,
  };
}

/* ----------------------------------- csv ---------------------------------- */

/**
 * Per-region CSV export for the selected reporting year.
 * Columns: state, year, records_digitized_pct, pending_disputes,
 * avg_resolution_days, women_owned_pct, climate_vuln_index, built_up_pct.
 * One row per reporting region (12 states) straight from Supabase land_metrics.
 */
export function buildDashboardCsv(data: DashboardData, regions: RegionMetrics[]): string {
  const esc = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = [
    "state",
    "year",
    "records_digitized_pct",
    "pending_disputes",
    "avg_resolution_days",
    "women_owned_pct",
    "climate_vuln_index",
    "built_up_pct",
  ];
  const lines = [header.join(",")];
  for (const r of regions) {
    lines.push(
      [
        r.region,
        data.year,
        r.digitized,
        r.pendingDisputes,
        r.avgResolutionDays,
        r.womenOwned,
        r.climateIndex,
        r.builtUp,
      ]
        .map(esc)
        .join(","),
    );
  }
  return lines.join("\n");
}
