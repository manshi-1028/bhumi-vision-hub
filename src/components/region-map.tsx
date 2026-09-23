import { useEffect, useMemo, useRef, useState } from "react";
import { CloudSun, Layers, Maximize2, Minimize2, RotateCcw, Scale, ScanLine, X } from "lucide-react";
import type { RegionMetrics } from "../lib/api";
import { CountUp } from "./motion";

/**
 * Regional intelligence workspace: the analytical centerpiece of BhoomiSetu.
 *
 * The map is UNCHANGED as a data surface: parcel cells in an approximate
 * geographic layout over a faint India silhouette, every value from
 * land_metrics via src/lib/api.ts. This pass deepens the INTERACTION layer:
 * hover spotlight, continuous hover→click language, an imperative viewBox
 * focus tween (no per-frame React renders), CountUp metric transitions,
 * iconified layer panel, keyboard-selectable regions, Esc/scrim fullscreen,
 * and a mobile bottom-sheet analysis panel.
 */

export type MapLayer = "digitized" | "disputes" | "climate";

type Cell = {
  region: string;
  code: string;
  points: string;
  labelX: number;
  labelY: number;
};

/* Approximate geographic placement over a 560x560 canvas. Region names
 * MUST match the Supabase regions table (verified 2026-09: Tamil Nadu and
 * West Bengal replaced Kerala and Punjab in the live dataset). */
const CELLS: Cell[] = [
  { region: "Uttar Pradesh", code: "UPR", points: "128,64 186,58 196,104 138,112", labelX: 162, labelY: 90 },
  { region: "Rajasthan", code: "RAJ", points: "92,124 172,116 190,190 120,206 84,162", labelX: 136, labelY: 162 },
  { region: "Bihar", code: "BIH", points: "200,120 292,128 302,196 208,204 194,160", labelX: 248, labelY: 166 },
  { region: "West Bengal", code: "WEB", points: "306,132 358,140 352,196 306,200 300,164", labelX: 330, labelY: 162 },
  { region: "Assam", code: "ASM", points: "400,150 472,142 490,178 434,192 396,182", labelX: 440, labelY: 170 },
  { region: "Gujarat", code: "GUJ", points: "60,214 138,214 148,278 96,290 56,252", labelX: 102, labelY: 252 },
  { region: "Madhya Pradesh", code: "MPR", points: "204,212 300,208 312,276 216,284 198,246", labelX: 254, labelY: 248 },
  { region: "Odisha", code: "ODI", points: "318,212 372,216 384,268 322,278 312,244", labelX: 348, labelY: 246 },
  { region: "Maharashtra", code: "MAH", points: "140,296 250,292 262,352 156,360 134,326", labelX: 198, labelY: 328 },
  { region: "Karnataka", code: "KAR", points: "176,372 268,368 276,436 188,442 170,404", labelX: 224, labelY: 408 },
  { region: "Andhra Pradesh", code: "APR", points: "276,362 356,362 368,438 284,444 272,402", labelX: 320, labelY: 404 },
  { region: "Tamil Nadu", code: "TAM", points: "182,452 232,450 224,540 196,542 176,492", labelX: 202, labelY: 496 },
];

/* Faint low-poly India silhouette for geographic context (decorative). */
const INDIA_SILHOUETTE =
  "M150 28 L118 118 L96 176 L60 206 L84 224 L120 216 L128 262 L110 300 L134 352 L150 408 L168 470 L188 530 L204 578 L218 612 L242 592 L258 540 L276 488 L300 438 L322 392 L340 348 L352 318 L398 302 L478 286 L502 318 L442 346 L398 330 L362 344 L348 296 L300 262 L246 224 L196 170 L164 112 L166 66 Z";

const LAYERS: {
  id: MapLayer;
  label: string;
  short: string;
  unit: string;
  description: string;
  Icon: typeof ScanLine;
}[] = [
  {
    id: "digitized",
    label: "Land Records Digitization",
    short: "Digitized",
    unit: "%",
    description: "Share of rural survey records digitised",
    Icon: ScanLine,
  },
  {
    id: "disputes",
    label: "Pending Land Disputes",
    short: "Disputes",
    unit: "cases",
    description: "Open cases across revenue and civil courts",
    Icon: Scale,
  },
  {
    id: "climate",
    label: "Climate Vulnerability",
    short: "Climate",
    unit: "index",
    description: "Composite climate exposure index",
    Icon: CloudSun,
  },
];

function lerpColor(a: string, b: string, t: number) {
  const pa = a.replace(/[^\d.,]/g, "").split(",").map(Number);
  const pb = b.replace(/[^\d.,]/g, "").split(",").map(Number);
  const c = pa.map((v, i) => Math.round(v + ((pb[i] ?? v) - v) * t));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

/* oklch fills interpolated in rgb for wide browser support inside SVG. */
const RAMP = {
  green: { from: [214, 235, 224], to: [26, 95, 70] },
  amber: { from: [247, 236, 214], to: [170, 98, 32] },
  rust: { from: [235, 233, 219], to: [128, 88, 40] },
} as const;

function cellColor(layer: MapLayer, value: number | null, range: { min: number; max: number }): { fill: string; dark: boolean } | null {
  if (value === null) return null;
  let t: number;
  if (layer === "digitized") t = Math.min(1, Math.max(0, value / 100));
  else if (layer === "disputes") t = range.max > 0 ? Math.min(1, Math.max(0, value / range.max)) : 0;
  else {
    /* climate_vuln_index is stored 0-100 in the live dataset (verified 2026-09);
       normalise on the actual data range so the ramp stays meaningful. */
    const span = range.max - range.min;
    t = span > 0 ? (value - range.min) / span : 0;
  }
  const ramp = layer === "digitized" ? RAMP.green : layer === "disputes" ? RAMP.amber : RAMP.rust;
  const fill = lerpColor(`rgb(${ramp.from.join(",")})`, `rgb(${ramp.to.join(",")})`, t);
  return { fill, dark: t > 0.52 };
}

function formatValue(layer: MapLayer, v: number | null): string {
  if (v === null) return "No data";
  if (layer === "digitized") return `${Math.round(v)}%`;
  if (layer === "disputes") return Math.round(v).toLocaleString("en-IN");
  return v.toFixed(2);
}

/* Numeric metric row in the analysis card: animates 0→value via the existing
   CountUp system only when the underlying value changes; static otherwise. */
function Metric({ label, value, decimals = 0, suffix = "" }: { label: string; value: number; decimals?: number; suffix?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--muted-foreground)]">{label}</dt>
      <dd className="font-bold tabular-nums text-[var(--foreground)]">
        <CountUp value={value} decimals={decimals} suffix={suffix} duration={320} />
      </dd>
    </div>
  );
}

/* Region analysis card. Rendered in one of three surfaces:
   sm+ floating card / mobile bottom sheet / inside-fullscreen card. */
function RegionCard({
  metrics,
  layerShort,
  onClose,
  sheet = false,
}: {
  metrics: RegionMetrics;
  layerShort: string;
  onClose: () => void;
  sheet?: boolean;
}) {
  return (
    <div
      className={`anim-up border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-raised)] ${
        sheet
          ? "fixed inset-x-0 bottom-0 z-40 max-h-[62vh] overflow-y-auto rounded-t-[var(--radius-lg)] border-b-0"
          : "w-full sm:w-72"
      }`}
      style={sheet ? { paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" } : undefined}
      role="complementary"
      aria-label={`Region analysis: ${metrics.region}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="card-label">Region analysis</p>
          <h4 className="font-serif text-xl leading-tight text-[var(--primary)]">{metrics.region}</h4>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
            Reporting region · {layerShort} shown
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close region analysis"
          className="flex h-6 w-6 shrink-0 items-center justify-center border border-transparent text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--accent)]"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <dl className="mt-4 space-y-2 border-t border-[var(--border)] pt-3 text-xs">
        {metrics.digitized !== null ? <Metric label="Records digitized" value={metrics.digitized} suffix="%" /> : null}
        {metrics.pendingDisputes !== null ? <Metric label="Pending disputes" value={metrics.pendingDisputes} /> : null}
        {metrics.avgResolutionDays !== null ? <Metric label="Avg resolution" value={metrics.avgResolutionDays} suffix=" days" /> : null}
        {metrics.womenOwned !== null ? <Metric label="Women-owned land" value={metrics.womenOwned} decimals={1} suffix="%" /> : null}
        {metrics.climateIndex !== null ? <Metric label="Climate vulnerability" value={metrics.climateIndex} decimals={2} /> : null}
      </dl>
      <p className="mt-3 border-t border-[var(--border)] pt-2.5 text-[10px] leading-4 text-[var(--muted-foreground)]">
        All values from the live land metrics dataset for the selected year.
      </p>
    </div>
  );
}

/* Compact square floating-map control button with tooltip. */
function MapControl({
  label,
  onClick,
  active = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`group/ctl relative flex h-8 w-8 items-center justify-center border shadow-[var(--shadow-panel)] transition-all duration-150 hover:-translate-y-px active:translate-y-0 ${
        active
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:border-[var(--primary-bright)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
      }`}
    >
      {children}
      <span
        className="pointer-events-none absolute right-full top-1/2 z-20 mr-2 -translate-y-1/2 whitespace-nowrap border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[10px] font-semibold text-[var(--foreground)] opacity-0 shadow-[var(--shadow-panel)] transition-opacity duration-150 group-hover/ctl:opacity-100"
        role="tooltip"
      >
        {label}
      </span>
    </button>
  );
}

export function RegionMap({
  metrics,
  layer,
  onLayerChange,
}: {
  metrics: RegionMetrics[];
  layer: MapLayer;
  onLayerChange: (l: MapLayer) => void;
}) {
  const [hover, setHover] = useState<{ region: string; x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tweenRef = useRef(0);

  const byRegion = useMemo(() => new Map(metrics.map((m) => [m.region, m])), [metrics]);
  const maxDisputes = useMemo(() => Math.max(1, ...metrics.map((m) => m.pendingDisputes ?? 0)), [metrics]);

  const range = useMemo(() => {
    const vals = metrics
      .map((m) => (layer === "digitized" ? m.digitized : layer === "disputes" ? m.pendingDisputes : m.climateIndex))
      .filter((v): v is number => v !== null);
    return { min: vals.length ? Math.min(...vals) : 0, max: vals.length ? Math.max(...vals) : 1 };
  }, [metrics, layer]);

  const activeLayer = LAYERS.find((l) => l.id === layer) ?? LAYERS[0]!;
  const selectedMetrics = selected ? byRegion.get(selected) : undefined;

  /* ---- Smart focus: an imperative viewBox tween (no React re-renders).
     Square side kept ≥ 200 units so India always stays in context. ---- */
  function tweenViewBox(target: { x: number; y: number; side: number }) {
    const svg = svgRef.current;
    if (!svg) return;
    window.cancelAnimationFrame(tweenRef.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const set = () => svg.setAttribute("viewBox", `${target.x} ${target.y} ${target.side} ${target.side}`);
    if (reduced) {
      set();
      return;
    }
    const start = (svg.getAttribute("viewBox") ?? "0 0 560 560").split(" ").map(Number);
    const t0 = performance.now();
    const duration = 320;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      const x = start[0]! + (target.x - start[0]!) * e;
      const y = start[1]! + (target.y - start[1]!) * e;
      const side = start[2]! + (target.side - start[2]!) * e;
      svg.setAttribute("viewBox", `${x.toFixed(2)} ${y.toFixed(2)} ${side.toFixed(2)} ${side.toFixed(2)}`);
      if (p < 1) tweenRef.current = requestAnimationFrame(step);
    };
    tweenRef.current = requestAnimationFrame(step);
  }

  function focusOnRegion(region: string) {
    const cell = CELLS.find((c) => c.region === region);
    if (!cell) return;
    const xs = cell.points.split(" ").map((p) => Number(p.split(",")[0]));
    const ys = cell.points.split(" ").map((p) => Number(p.split(",")[1]));
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const bw = Math.max(...xs) - Math.min(...xs);
    const bh = Math.max(...ys) - Math.min(...ys);
    /* Modest zoom: region framed with generous context, never cropping India. */
    const side = Math.min(560, Math.max(200, Math.max(bw, bh) * 2.6));
    const x = Math.min(560 - side, Math.max(0, cx - side / 2));
    const y = Math.min(560 - side, Math.max(0, cy - side / 2));
    tweenViewBox({ x, y, side });
  }

  function resetView() {
    tweenViewBox({ x: 0, y: 0, side: 560 });
  }

  function selectRegion(region: string | null) {
    setSelected(region);
    if (region) focusOnRegion(region);
    else resetView();
  }

  /* Esc exits fullscreen; cleanup on unmount. */
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  useEffect(() => () => window.cancelAnimationFrame(tweenRef.current), []);

  function onMove(e: React.MouseEvent, region: string) {
    /* Measure against the map box so the tooltip lands at the cursor and can
       be clamped inside the overflow-hidden container. */
    const rect = boxRef.current?.getBoundingClientRect();
    setHover({ region, x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) });
  }

  return (
    <div className="relative">
      {/* Fullscreen scrim: click anywhere outside the map exits Land Intelligence mode */}
      {expanded ? (
        <button
          type="button"
          aria-label="Exit fullscreen map"
          onClick={() => setExpanded(false)}
          className="fixed inset-0 z-30 cursor-default bg-[oklch(0.19_0.022_160/45%)]"
        />
      ) : null}

      {/* Map frame (becomes the fullscreen stage) */}
      <div
        ref={boxRef}
        className={`relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-panel)] transition-all duration-300 ${
          expanded ? "fixed inset-3 z-40 sm:inset-6" : ""
        }`}
      >
        <div className="bs-grid-overlay absolute inset-0 opacity-60" aria-hidden="true" />

        {/* Floating workspace controls, grouped: primary (layers) / utility */}
        <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5">
          <MapControl label="Layers" active={layersOpen} onClick={() => setLayersOpen((v) => !v)}>
            <Layers className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </MapControl>
          <div className="mx-2 border-t border-[var(--border)]" aria-hidden="true" />
          <MapControl label="Clear selection & reset view" onClick={() => selectRegion(null)}>
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </MapControl>
          <MapControl label={expanded ? "Exit fullscreen" : "Fullscreen map"} onClick={() => setExpanded((v) => !v)} active={expanded}>
            {expanded ? <Minimize2 className="h-4 w-4" strokeWidth={1.75} aria-hidden /> : <Maximize2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
          </MapControl>
        </div>

        {/* Refined layer panel — icon, factual description, clear active state */}
        {layersOpen ? (
          <div className="anim-up absolute right-3 top-14 z-20 w-60 border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-raised)]" role="group" aria-label="Map layers">
            <div className="mb-2 flex items-center justify-between">
              <p className="card-label">Analytical layers</p>
              <button type="button" onClick={() => setLayersOpen(false)} aria-label="Close layers panel" className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]">
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
            <ul className="space-y-1">
              {LAYERS.map((l) => {
                const active = layer === l.id;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => onLayerChange(l.id)}
                      aria-pressed={active}
                      className={`flex w-full items-start gap-2.5 border px-2.5 py-2 text-left transition-all duration-150 ${
                        active
                          ? "border-[var(--primary)] bg-[var(--primary-soft-strong)]"
                          : "border-transparent hover:border-[var(--border)] hover:bg-[var(--primary-soft)]"
                      }`}
                    >
                      <l.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} strokeWidth={1.75} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-semibold ${active ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}>{l.short}</span>
                          <span className={`h-2 w-2 shrink-0 rounded-full transition-colors ${active ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} aria-hidden="true" />
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-[var(--muted-foreground)]">{l.description}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 border-t border-[var(--border)] pt-2 text-[10px] leading-4 text-[var(--muted-foreground)]">
              Values come from the live land metrics dataset for the selected reporting year.
            </p>
          </div>
        ) : null}

        {/* First-visit cue: disappears on hover or selection */}
        {!selected && !hover ? (
          <p className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 border border-[var(--border)] bg-[var(--surface)]/95 px-3 py-1.5 text-[11px] font-semibold text-[var(--muted-foreground)] shadow-[var(--shadow-panel)]" style={{ animation: "bs-fade-in 600ms ease both" }}>
            Select a region to inspect land intelligence
          </p>
        ) : null}

        <svg
          ref={svgRef}
          viewBox="0 0 560 560"
          className="relative block w-full"
          role="img"
          aria-label={`India regional intelligence grid, ${activeLayer.label} layer`}
        >
          <path d={INDIA_SILHOUETTE} fill="var(--primary-soft)" stroke="var(--border)" strokeWidth="1.25" opacity="0.55" />
          {CELLS.map((cell, i) => {
            const m = byRegion.get(cell.region);
            const value = layer === "digitized" ? (m?.digitized ?? null) : layer === "disputes" ? (m?.pendingDisputes ?? null) : (m?.climateIndex ?? null);
            const c = cellColor(layer, value, layer === "disputes" ? { min: 0, max: maxDisputes } : range);
            const isSelected = selected === cell.region;
            const isHovered = hover?.region === cell.region;
            const dimmedBySelection = selected !== null && !isSelected;
            /* Hover spotlight only when nothing is selected, so the two
               emphasis systems never fight each other. */
            const dimmedByHover = hover !== null && !isHovered && selected === null;
            const opacity = isSelected ? 1 : isHovered ? (dimmedBySelection ? 0.75 : 1) : dimmedBySelection ? 0.45 : dimmedByHover ? 0.82 : 1;
            return (
              <g
                key={cell.region}
                className="map-cell cursor-pointer"
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`${cell.region} — ${value === null ? "no data" : formatValue(layer, value)}. ${isSelected ? "Selected" : "Press Enter to analyse"}.`}
                onMouseMove={(e) => onMove(e, cell.region)}
                onMouseLeave={() => setHover(null)}
                onClick={() => selectRegion(isSelected ? null : cell.region)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectRegion(isSelected ? null : cell.region);
                  }
                }}
                style={{ animation: `bs-fade-in 600ms ease both`, animationDelay: `${i * 60}ms`, opacity, transition: "opacity 220ms ease" }}
              >
                <polygon
                  points={cell.points}
                  fill={c ? c.fill : "oklch(0.93 0.005 95)"}
                  stroke={isSelected ? "var(--accent)" : "var(--primary)"}
                  strokeWidth={isSelected ? 2.75 : isHovered ? 2.25 : 1}
                  opacity={isHovered ? 1 : 0.94}
                  style={{ transition: "fill 500ms ease, stroke-width 180ms ease, opacity 180ms ease" }}
                />
                <text
                  x={cell.labelX}
                  y={cell.labelY}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  letterSpacing="0.06em"
                  className="map-code"
                  fill={c?.dark ? "oklch(0.97 0.01 95)" : "oklch(0.3 0.04 160)"}
                  style={{ pointerEvents: "none", transition: "fill 500ms ease" }}
                >
                  {cell.code}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend — content keyed by layer so it fades with the switch */}
        <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] border border-[var(--border)] bg-[var(--surface)]/95 px-3 py-2 text-[11px] shadow-[var(--shadow-panel)] backdrop-blur-sm">
          <div key={layer} className="anim-up flex flex-col gap-1">
            <span className="card-label">{activeLayer.label}</span>
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-20 sm:w-28"
                style={{
                  background:
                    layer === "digitized"
                      ? "linear-gradient(90deg, rgb(214 235 224), rgb(26 95 70))"
                      : layer === "disputes"
                        ? "linear-gradient(90deg, rgb(247 236 214), rgb(170 98 32))"
                        : "linear-gradient(90deg, rgb(235 233 219), rgb(128 88 40))",
                }}
                aria-hidden="true"
              />
              <span className="tabular-nums text-[var(--muted-foreground)]">
                {formatValue(layer, range.min)} – {formatValue(layer, range.max)} {layer === "disputes" ? "cases" : ""}
              </span>
            </span>
          </div>
        </div>

        {/* Hover tooltip — compact intelligence card, clamped inside the map */}
        {hover
          ? (() => {
              const boxW = boxRef.current?.clientWidth ?? 460;
              const boxH = boxRef.current?.clientHeight ?? 460;
              const m = byRegion.get(hover.region);
              return (
                <div
                  className="pointer-events-none absolute z-10 w-48 border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 shadow-[var(--shadow-raised)]"
                  style={{
                    left: Math.min(hover.x + 14, Math.max(8, boxW - 204)),
                    top: Math.min(hover.y + 14, Math.max(8, boxH - 110)),
                  }}
                >
                  <p className="border-b border-[var(--border)] pb-1.5 text-xs font-bold text-[var(--primary)]">{hover.region}</p>
                  <p className="mt-1.5 flex items-baseline justify-between gap-2 text-[11px]">
                    <span className="text-[var(--muted-foreground)]">{activeLayer.short}</span>
                    <span className="font-bold tabular-nums text-[var(--foreground)]">
                      {m ? formatValue(layer, layer === "digitized" ? m.digitized : layer === "disputes" ? m.pendingDisputes : m.climateIndex) : "No data"}
                    </span>
                  </p>
                  <p className="mt-1.5 text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">Click to analyse</p>
                </div>
              );
            })()
          : null}

        {/* Fullscreen mode keeps the analysis card on the stage itself */}
        {expanded && selectedMetrics ? (
          <div className="absolute bottom-14 right-4 left-4 sm:left-auto sm:w-72">
            <RegionCard metrics={selectedMetrics} layerShort={activeLayer.short} onClose={() => selectRegion(null)} />
          </div>
        ) : null}
      </div>

      {/* Normal mode: sm+ floating card / mobile bottom sheet */}
      {!expanded && selectedMetrics ? (
        <>
          <div className="mt-3 hidden sm:absolute sm:bottom-14 sm:right-4 sm:mt-0 sm:block">
            <RegionCard metrics={selectedMetrics} layerShort={activeLayer.short} onClose={() => selectRegion(null)} />
          </div>
          <div className="sm:hidden">
            <RegionCard metrics={selectedMetrics} layerShort={activeLayer.short} onClose={() => selectRegion(null)} sheet />
          </div>
        </>
      ) : null}
    </div>
  );
}
