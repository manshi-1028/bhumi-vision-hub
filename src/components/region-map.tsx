import { useMemo, useRef, useState } from "react";
import type { RegionMetrics } from "../lib/api";

/**
 * Regional intelligence grid: parcel-shaped cells arranged in an approximate
 * geographic layout over a faint low-poly India silhouette. Only the 12
 * reporting regions are shown - coverage is honest, not a full state GIS.
 * All values come from land_metrics via src/lib/api.ts.
 * Mobile: hover coordinates are measured against the map box itself, the
 * tooltip is clamped inside it, parcel codes hide below 480px (see styles.css),
 * and the detail panel flows under the map instead of covering it.
 */

export type MapLayer = "digitized" | "disputes" | "climate";

type Cell = {
  region: string;
  code: string;
  points: string;
  labelX: number;
  labelY: number;
};

/* Approximate geographic placement over a 560x640 canvas. Region names
 * MUST match the Supabase regions table (verified 2026-09: Tamil Nadu and
 * West Bengal replaced Kerala and Punjab in the live dataset). */
const CELLS: Cell[] = [
  { region: "Uttar Pradesh", code: "UPR", points: "128,64 186,58 196,104 138,112", labelX: 162, labelY: 90 },
  { region: "Rajasthan", code: "RAJ", points: "92,124 172,116 190,190 120,206 84,162", labelX: 136, labelY: 162 },
  { region: "Bihar", code: "BIH", points: "200,120 292,128 302,196 208,204 194,160", labelX: 248, labelY: 166 },
  { region: "West Bengal", code: "WEB", points: "306,132 358,140 352,196 306,200 300,164", labelX: 330, labelY: 172 },
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

const LAYERS: { id: MapLayer; label: string; short: string; unit: string }[] = [
  { id: "digitized", label: "Records Digitization", short: "Digitized", unit: "%" },
  { id: "disputes", label: "Pending Disputes", short: "Disputes", unit: "cases" },
  { id: "climate", label: "Climate Vulnerability", short: "Climate", unit: "index" },
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
  if (layer === "digitized") t = Math.min(1, Math.max(0, (value - 0) / 100));
  else if (layer === "disputes") t = range.max > 0 ? Math.min(1, Math.max(0, value / range.max)) : 0;
  else {
    /* climate_vuln_index is stored 0-100 in the live dataset (verified 2026-09);
       normalise on the actual data range so the ramp stays meaningful. */
    const span = range.max - range.min;
    t = span > 0 ? (value - range.min) / span : 0;
  }
  const ramp = layer === "digitized" ? RAMP.green : layer === "disputes" ? RAMP.amber : RAMP.rust;
  const fill = lerpColor(
    `rgb(${ramp.from.join(",")})`,
    `rgb(${ramp.to.join(",")})`,
    t,
  );
  return { fill, dark: t > 0.52 };
}

function formatValue(layer: MapLayer, v: number | null): string {
  if (v === null) return "No data";
  if (layer === "digitized") return `${Math.round(v)}%`;
  if (layer === "disputes") return Math.round(v).toLocaleString("en-IN");
  return v.toFixed(2);
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
  const boxRef = useRef<HTMLDivElement | null>(null);

  const byRegion = useMemo(() => new Map(metrics.map((m) => [m.region, m])), [metrics]);
  const maxDisputes = useMemo(
    () => Math.max(1, ...metrics.map((m) => m.pendingDisputes ?? 0)),
    [metrics],
  );

  const range = useMemo(() => {
    const vals = metrics
      .map((m) => (layer === "digitized" ? m.digitized : layer === "disputes" ? m.pendingDisputes : m.climateIndex))
      .filter((v): v is number => v !== null);
    return { min: vals.length ? Math.min(...vals) : 0, max: vals.length ? Math.max(...vals) : 1 };
  }, [metrics, layer]);

  const unit = LAYERS.find((l) => l.id === layer)?.unit ?? "";
  const selectedMetrics = selected ? byRegion.get(selected) : undefined;

  function onMove(e: React.MouseEvent, region: string) {
    /* Measure against the map box (not the outer wrapper, which also contains
       the layer buttons) so the tooltip lands at the cursor and can be clamped
       inside the overflow-hidden container. */
    const rect = boxRef.current?.getBoundingClientRect();
    setHover({ region, x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) });
  }

  return (
    <div className="relative">
      {/* Layer switcher (equal thirds on mobile with short labels, natural width on sm+) */}
      <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Map layer">
        {LAYERS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={layer === l.id}
            onClick={() => onLayerChange(l.id)}
            className={`border px-3 py-1.5 text-xs font-semibold transition-all duration-200 flex-1 sm:flex-none text-center ${
              layer === l.id
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:border-[var(--primary-bright)] hover:text-[var(--primary)]"
            }`}
          >
            <span className="sm:hidden">{l.short}</span>
            <span className="hidden sm:inline">{l.label}</span>
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]" ref={boxRef}>
        <div className="bs-grid-overlay absolute inset-0 opacity-60" aria-hidden="true" />
        <svg viewBox="0 0 560 560" className="relative block w-full" role="img" aria-label={`India regional intelligence grid, ${LAYERS.find((l) => l.id === layer)?.label} layer`}>
          <path d={INDIA_SILHOUETTE} fill="var(--primary-soft)" stroke="var(--border)" strokeWidth="1.25" opacity="0.55" />
          {CELLS.map((cell, i) => {
            const m = byRegion.get(cell.region);
            const value =
              layer === "digitized" ? (m?.digitized ?? null) : layer === "disputes" ? (m?.pendingDisputes ?? null) : (m?.climateIndex ?? null);
            const c = cellColor(layer, value, layer === "disputes" ? { min: 0, max: maxDisputes } : range);
            const isSelected = selected === cell.region;
            const isHovered = hover?.region === cell.region;
            return (
              <g
                key={cell.region}
                onMouseMove={(e) => onMove(e, cell.region)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelected(isSelected ? null : cell.region)}
                className="cursor-pointer"
                style={{ animation: `bs-fade-in 600ms ease both`, animationDelay: `${i * 60}ms` }}
              >
                <polygon
                  points={cell.points}
                  fill={c ? c.fill : "oklch(0.93 0.005 95)"}
                  stroke={isSelected ? "var(--accent)" : "var(--primary)"}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                  opacity={isHovered ? 1 : 0.94}
                  style={{ transition: "fill 500ms ease, stroke-width 160ms ease, opacity 160ms ease" }}
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

        {/* Legend (wrap-safe on small screens) */}
        <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-x-3 gap-y-1 border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[11px] shadow-[var(--shadow-panel)]">
          <span className="card-label">{LAYERS.find((l) => l.id === layer)?.label}</span>
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-16 sm:w-24"
              style={{
                background:
                  layer === "digitized"
                    ? "linear-gradient(90deg, rgb(214 235 224), rgb(26 95 70))"
                    : layer === "disputes"
                      ? "linear-gradient(90deg, rgb(247 236 214), rgb(170 98 32))"
                      : "linear-gradient(90deg, rgb(235 233 219), rgb(128 88 40))",
              }}
            />
            <span className="tabular-nums text-[var(--muted-foreground)]">
              {formatValue(layer, range.min)} – {formatValue(layer, range.max)}
            </span>
          </span>
        </div>

        {/* Hover tooltip, clamped inside the visible map area on both axes */}
        {hover
          ? (() => {
              const boxW = boxRef.current?.clientWidth ?? 460;
              const boxH = boxRef.current?.clientHeight ?? 460;
              return (
                <div
                  className="pointer-events-none absolute z-10 max-w-[190px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-[var(--shadow-raised)]"
                  style={{
                    left: Math.min(hover.x + 14, Math.max(8, boxW - 200)),
                    top: Math.min(hover.y + 14, Math.max(8, boxH - 92)),
                  }}
                >
                  <p className="font-semibold text-[var(--primary)]">{hover.region}</p>
                  {(() => {
                    const m = byRegion.get(hover.region);
                    if (!m) return <p className="text-[var(--muted-foreground)]">No reporting data</p>;
                    return <p className="tabular-nums text-[var(--muted-foreground)]">{formatValue(layer, layer === "digitized" ? m.digitized : layer === "disputes" ? m.pendingDisputes : m.climateIndex)} {unit !== "%" && layer === "disputes" ? "pending cases" : ""}</p>;
                  })()}
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">Click for details</p>
                </div>
              );
            })()
          : null}
      </div>

      {/* Selected region info panel: in-flow below the map on mobile, floating panel on sm+ */}
      {selectedMetrics ? (
        <div className="anim-up mt-3 w-full border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-raised)] sm:absolute sm:bottom-14 sm:right-4 sm:mt-0 sm:w-64">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="card-label">Region detail</p>
              <h4 className="font-serif text-lg leading-tight text-[var(--primary)]">{selectedMetrics.region}</h4>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close region detail"
              className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--accent)]"
            >
              ✕
            </button>
          </div>
          <dl className="mt-3 space-y-1.5 text-xs">
            {[
              ["Records digitized", selectedMetrics.digitized === null ? null : `${Math.round(selectedMetrics.digitized)}%`],
              ["Pending disputes", selectedMetrics.pendingDisputes === null ? null : selectedMetrics.pendingDisputes.toLocaleString("en-IN")],
              ["Avg resolution", selectedMetrics.avgResolutionDays === null ? null : `${Math.round(selectedMetrics.avgResolutionDays)} days`],
              ["Women-owned land", selectedMetrics.womenOwned === null ? null : `${selectedMetrics.womenOwned.toFixed(1)}%`],
              ["Climate vulnerability", selectedMetrics.climateIndex === null ? null : selectedMetrics.climateIndex.toFixed(2)],
            ]
              .filter(([, v]) => v !== null)
              .map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-3">
                  <dt className="text-[var(--muted-foreground)]">{k}</dt>
                  <dd className="font-semibold tabular-nums text-[var(--foreground)]">{v}</dd>
                </div>
              ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
