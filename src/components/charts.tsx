/** BhoomiSetu v2 SVG charts: gradient area lines, animated draw-in, hover values. No libraries. */

interface LineSeries {
  name: string;
  values: number[];
  accent?: boolean;
}

/** Round a chart maximum up to a tidy tick-friendly value (shared). */
export function niceMax(v: number) {
  if (v <= 1) return Math.ceil(v * 10) / 10;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / (mag / 2)) * (mag / 2);
}

let uid = 0;
function nextId() {
  uid += 1;
  return `bsg${uid}`;
}

export function LineChart({
  labels,
  series,
  yUnit = "",
  title,
  description,
}: {
  labels: string[];
  series: LineSeries[];
  yUnit?: string;
  title: string;
  description?: string;
}) {
  const w = Math.max(560, labels.length * 58);
  const h = 280;
  const pad = { l: 56, r: 20, t: 18, b: 40 };
  const all = series.flatMap((s) => s.values);
  const max = niceMax(Math.max(...all, 1));
  const min = 0;
  const plotW = w - pad.l - pad.r;
  const plotH = h - pad.t - pad.b;
  const x = (i: number) => pad.l + (labels.length === 1 ? plotW / 2 : (i * plotW) / (labels.length - 1));
  const y = (v: number) => pad.t + plotH - ((v - min) / (max - min)) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + f * (max - min));
  const gid = nextId();

  return (
    <figure className="panel panel-hover p-5">
      <figcaption className="mb-4 flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-[var(--ink)]">
          {title}
          {description ? <span className="mt-0.5 block text-xs font-normal leading-5 text-[var(--muted-foreground)]">{description}</span> : null}
        </span>
        {series.length > 1 ? (
          <ul className="flex flex-wrap gap-4 text-xs text-[var(--muted-foreground)]">
            {series.map((s) => (
              <li key={s.name} className="flex items-center gap-2">
                <span
                  className="inline-block h-0 w-6"
                  style={{
                    borderTop: `2px ${s.accent ? "dashed" : "solid"} ${s.accent ? "var(--accent)" : "var(--primary)"}`,
                  }}
                />
                {s.name}
              </li>
            ))}
          </ul>
        ) : null}
      </figcaption>
      <div className="overflow-x-auto">
        <svg width={w} height={h} role="img" aria-label={title} className="block">
          <defs>
            <linearGradient id={`${gid}-primary`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id={`${gid}-accent`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--grid-line)" strokeWidth="1" />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)" style={{ fontVariantNumeric: "tabular-nums" }}>
                {Number(t.toFixed(2))}
                {yUnit}
              </text>
            </g>
          ))}
          {labels.map((l, i) => (
            <text key={l + i} x={x(i)} y={h - pad.b + 20} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
              {l}
            </text>
          ))}

          {/* Area fill (single-series only, drawn under the line) */}
          {series.length === 1
            ? series.map((s) => {
                const area =
                  `M${x(0)},${pad.t + plotH} ` +
                  s.values.map((v, i) => `L${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ") +
                  ` L${x(s.values.length - 1)},${pad.t + plotH} Z`;
                return <path key={s.name} d={area} fill={`url(#${gid}-${s.accent ? "accent" : "primary"})`} className="anim-in" />;
              })
            : null}

          {series.map((s) => {
            const color = s.accent ? "var(--accent)" : "var(--primary)";
            const d = s.values
              .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
              .join(" ");
            return (
              <g key={s.name}>
                <path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={s.accent ? "6 5" : undefined}
                  className={s.accent ? undefined : "anim-line"}
                  style={{ "--bs-dash-len": 2400 } as React.CSSProperties}
                />
                {s.values.map((v, i) => (
                  <g key={i}>
                    <circle cx={x(i)} cy={y(v)} r="7" fill="transparent">
                      <title>{`${l0(labels[i])}: ${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}${yUnit}`}</title>
                    </circle>
                    <circle cx={x(i)} cy={y(v)} r="3" fill="var(--surface)" stroke={color} strokeWidth="1.75" />
                  </g>
                ))}
              </g>
            );
          })}
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + plotH} y2={pad.t + plotH} stroke="var(--primary)" strokeWidth="1" opacity="0.5" />
          <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + plotH} stroke="var(--primary)" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>
    </figure>
  );
}

function l0(l: string | undefined) {
  return l ?? "";
}

export function BarChart({
  data,
  title,
  unit = "",
  description,
}: {
  data: { label: string; value: number }[];
  title: string;
  unit?: string;
  description?: string;
}) {
  const barW = 56;
  const w = Math.max(560, data.length * barW + 90);
  const h = 310;
  const pad = { l: 60, r: 18, t: 18, b: 96 };
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const plotH = h - pad.t - pad.b;
  const y = (v: number) => pad.t + plotH - (v / max) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const gid = nextId();

  return (
    <figure className="panel panel-hover p-5">
      <figcaption className="mb-4 flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-[var(--ink)]">
          {title}
          {description ? <span className="mt-0.5 block text-xs font-normal leading-5 text-[var(--muted-foreground)]">{description}</span> : null}
        </span>
        {unit ? <span className="text-xs text-[var(--muted-foreground)]">{unit}</span> : null}
      </figcaption>
      <div className="overflow-x-auto">
        <svg width={w} height={h} role="img" aria-label={title} className="block">
          <defs>
            <linearGradient id={`${gid}-bar`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-bright)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--grid-line)" strokeWidth="1" />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)" style={{ fontVariantNumeric: "tabular-nums" }}>
                {Math.round(t).toLocaleString("en-IN")}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = pad.l + 14 + i * barW;
            const bw = barW - 22;
            const ty = y(d.value);
            return (
              <g key={d.label} style={{ animation: "bs-rise 900ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: `${i * 70}ms`, transformOrigin: `${cx + bw / 2}px ${pad.t + plotH}px` }}>
                <rect x={cx} y={ty} width={bw} height={pad.t + plotH - ty} rx="2" fill={`url(#${gid}-bar)`} />
                <text x={cx + bw / 2} y={ty - 6} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--primary)" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {d.value.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                </text>
                <text
                  x={cx + bw / 2}
                  y={pad.t + plotH + 14}
                  fontSize="11"
                  fill="var(--muted-foreground)"
                  textAnchor="end"
                  transform={`rotate(-40 ${cx + bw / 2} ${pad.t + plotH + 14})`}
                >
                  {d.label.length > 18 ? `${d.label.slice(0, 17)}…` : d.label}
                </text>
              </g>
            );
          })}
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + plotH} y2={pad.t + plotH} stroke="var(--primary)" strokeWidth="1" opacity="0.5" />
          <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + plotH} stroke="var(--primary)" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>
    </figure>
  );
}

export function ProgressList({
  data,
  title,
}: {
  data: { label: string; value: number; status?: string | null }[];
  title: string;
}) {
  return (
    <section className="panel p-5">
      <h3 className="mb-4 text-sm font-semibold text-[var(--ink)]">{title}</h3>
      <ul className="space-y-3.5">
        {data.map((d, i) => (
          <li key={d.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 truncate">{d.label}</span>
                {d.status ? (
                  <span
                    className={`shrink-0 border px-1.5 py-px text-[9px] font-bold uppercase tracking-wide ${
                      d.status === "ongoing" || d.status === "active"
                        ? "border-[var(--primary)] text-[var(--primary)]"
                        : d.status === "completed"
                          ? "border-[oklch(0.55_0.125_62/45%)] text-[var(--accent)]"
                          : "border-[var(--border)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {d.status}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-[var(--primary)]">{d.value}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden border border-[var(--border)] bg-[var(--background)]">
              <div
                className="anim-grow h-full"
                style={{
                  width: `${Math.min(100, Math.max(0, d.value))}%`,
                  background: "linear-gradient(90deg, var(--primary), var(--primary-bright))",
                  animationDelay: `${i * 90}ms`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
