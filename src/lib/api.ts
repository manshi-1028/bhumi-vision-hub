/**
 * Single data access layer. Components must never read storage or the sample
 * data files directly. Everything here is sample/demo data.
 *
 * Mock auth: any email with password "demo123" is accepted.
 * Role is derived from the email prefix:
 *   official@...      -> "official"      (full access, including /review)
 *   institution@...   -> "institution"
 *   researcher@...    -> "researcher"    (default for every other address)
 */

import {
  BUILT_UP_SERIES,
  DIGITIZED_SERIES,
  DISPUTES_BY_STATE,
  KPIS_BY_YEAR,
  PROGRESS_COMPONENTS,
  RESEARCH_ITEMS,
  STATES,
  TIME_SERIES_YEARS,
  TOPICS,
  TYPES,
  YEARS,
  type Kpis,
  type ResearchItem,
} from "./data";

export type Role = "researcher" | "institution" | "official";

export interface User {
  email: string;
  role: Role;
}

const STORAGE_USER = "bhoomisetu.user";
const STORAGE_SUBMISSIONS = "bhoomisetu.submissions";

const delay = (ms = 260) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------------- auth --------------------------------- */

export function roleForEmail(email: string): Role {
  const prefix = email.trim().toLowerCase().split("@")[0];
  if (prefix === "official") return "official";
  if (prefix === "institution") return "institution";
  return "researcher";
}

export async function login(email: string, password: string): Promise<User> {
  await delay(320);
  if (!email.includes("@")) throw new Error("Enter a valid email address.");
  if (password !== "demo123") throw new Error("Incorrect password. Demo accounts use the password demo123.");
  const user: User = { email: email.trim().toLowerCase(), role: roleForEmail(email) };
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  return user;
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_USER);
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function canAccess(user: User | null, path: string): boolean {
  if (path.startsWith("/review")) return user?.role === "official";
  if (path.startsWith("/simulator") || path.startsWith("/submit")) return !!user;
  return true;
}

/* -------------------------------- reference ------------------------------- */

export function getStates() {
  return STATES;
}
export function getTopics() {
  return TOPICS;
}
export function getTypes() {
  return TYPES;
}
export function getYears() {
  return YEARS;
}

/* -------------------------------- dashboard ------------------------------- */

export interface DashboardData {
  year: number;
  kpis: Kpis;
  digitizedSeries: { labels: string[]; values: number[] };
  builtUpSeries: { labels: string[]; values: number[] };
  disputesByState: { label: string; value: number }[];
  researchByTopic: { label: string; value: number }[];
  progress: { label: string; value: number }[];
}

export async function getDashboard(year: number): Promise<DashboardData> {
  await delay();
  const kpis = KPIS_BY_YEAR[year];
  if (!kpis) throw new Error(`No sample data available for ${year}.`);
  const labels = TIME_SERIES_YEARS.map(String);
  const researchByTopic = TOPICS.map((t) => ({
    label: t,
    value: RESEARCH_ITEMS.filter((i) => i.topic === t && i.year <= year).length * 9 + 12,
  }));
  return {
    year,
    kpis,
    digitizedSeries: { labels, values: DIGITIZED_SERIES },
    builtUpSeries: { labels, values: BUILT_UP_SERIES },
    disputesByState: DISPUTES_BY_STATE[year],
    researchByTopic,
    progress: PROGRESS_COMPONENTS,
  };
}

/* --------------------------------- library -------------------------------- */

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
  items: ResearchItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function allItems(): ResearchItem[] {
  return [...RESEARCH_ITEMS, ...readSubmissions().filter((i) => i.status === "approved")];
}

export async function searchLibrary(query: LibraryQuery): Promise<LibraryResult> {
  await delay();
  const pageSize = query.pageSize ?? 10;
  const page = query.page ?? 1;
  const q = (query.q ?? "").trim().toLowerCase();
  const filtered = allItems().filter((i) => {
    if (q && !(i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q) || i.tags.join(" ").includes(q)))
      return false;
    if (query.type && i.type !== query.type) return false;
    if (query.topic && i.topic !== query.topic) return false;
    if (query.state && i.state !== query.state) return false;
    if (query.year && String(i.year) !== query.year) return false;
    return true;
  });
  const total = filtered.length;
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getResearchItem(id: string): Promise<ResearchItem> {
  await delay();
  const item = allItems().find((i) => i.id === id);
  if (!item) throw new Error(`No research item found with reference ${id}.`);
  return item;
}

export async function getRecommended(id: string): Promise<ResearchItem[]> {
  await delay(160);
  const item = allItems().find((i) => i.id === id);
  if (!item) return [];
  return allItems()
    .filter((i) => i.id !== id && (i.topic === item.topic || i.state === item.state))
    .slice(0, 5);
}

/* ------------------------------- submissions ------------------------------ */

function readSubmissions(): ResearchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_SUBMISSIONS);
    return raw ? (JSON.parse(raw) as ResearchItem[]) : [];
  } catch {
    return [];
  }
}

function writeSubmissions(items: ResearchItem[]) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(items));
}

export async function submitResearch(input: Omit<ResearchItem, "id" | "status">): Promise<ResearchItem> {
  await delay(320);
  if (!input.title.trim()) throw new Error("Title is required.");
  if (!input.summary.trim()) throw new Error("Summary is required.");
  const item: ResearchItem = { ...input, id: `SU-${Date.now().toString().slice(-6)}`, status: "pending" };
  writeSubmissions([item, ...readSubmissions()]);
  return item;
}

export async function getSubmissions(): Promise<ResearchItem[]> {
  await delay();
  return readSubmissions();
}

export async function decideSubmission(id: string, decision: "approve" | "reject"): Promise<void> {
  await delay(200);
  const items = readSubmissions();
  writeSubmissions(
    decision === "reject"
      ? items.filter((i) => i.id !== id)
      : items.map((i) => (i.id === id ? { ...i, status: "approved" } : i)),
  );
}

/* -------------------------------- simulator ------------------------------- */

export type Lever =
  | "Land records digitization"
  | "Dispute resolution fast-track"
  | "Women's land title drive"
  | "Climate-resilient zoning";

export const LEVERS: Lever[] = [
  "Land records digitization",
  "Dispute resolution fast-track",
  "Women's land title drive",
  "Climate-resilient zoning",
];

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

export async function runSimulation(state: string, lever: Lever, intensity: number): Promise<SimulationResult> {
  await delay(300);
  if (!state) throw new Error("Select a state before running a projection.");
  const k = intensity / 100;
  const seed = (STATES.indexOf(state) + 1) / 12;
  const base: Record<string, { unit: string; value: number; effect: number }> = {
    "Records digitized": { unit: "%", value: 70 + seed * 14, effect: lever === "Land records digitization" ? 22 : 5 },
    "Pending disputes": { unit: "thousands", value: 180 - seed * 60, effect: lever === "Dispute resolution fast-track" ? -34 : -9 },
    "Average resolution time": { unit: "days", value: 980 - seed * 180, effect: lever === "Dispute resolution fast-track" ? -30 : -7 },
    "Women-owned land": { unit: "%", value: 15 + seed * 6, effect: lever === "Women's land title drive" ? 42 : 4 },
    "Climate vulnerability": { unit: "index", value: 0.68 - seed * 0.1, effect: lever === "Climate-resilient zoning" ? -21 : -3 },
  };
  const rows: SimulationRow[] = Object.entries(base).map(([indicator, cfg]) => ({
    indicator,
    unit: cfg.unit,
    baseline: Number(cfg.value.toFixed(2)),
    projected: Number((cfg.value * (1 + (cfg.effect / 100) * k)).toFixed(2)),
  }));

  const headlineRow = rows[0];
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

export function buildDashboardCsv(data: DashboardData): string {
  const lines: string[] = [];
  const push = (...cells: (string | number)[]) => lines.push(cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
  push("BhoomiSetu sample data export", `Year ${data.year}`);
  push("");
  push("Section", "Label", "Value");
  push("KPI", "Records digitized (%)", data.kpis.digitized);
  push("KPI", "Pending land disputes", data.kpis.pendingDisputes);
  push("KPI", "Average dispute resolution (days)", data.kpis.avgResolutionDays);
  push("KPI", "Women-owned land (%)", data.kpis.womenOwned);
  push("KPI", "Climate vulnerability index", data.kpis.climateIndex);
  push("KPI", "Research outputs", data.kpis.researchOutputs);
  data.digitizedSeries.labels.forEach((l, i) => push("Records digitized over time (%)", l, data.digitizedSeries.values[i]));
  data.builtUpSeries.labels.forEach((l, i) => push("Built-up land over time (%)", l, data.builtUpSeries.values[i]));
  data.disputesByState.forEach((d) => push("Pending disputes by state (thousands)", d.label, d.value));
  data.researchByTopic.forEach((d) => push("Research outputs by topic", d.label, d.value));
  data.progress.forEach((d) => push("Project progress by component (%)", d.label, d.value));
  return lines.join("\n");
}
