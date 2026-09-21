/** Flat SVG charts: monochrome green plus one amber accent. No libraries. */

interface LineSeries {
  name: string;
  values: number[];
  accent?: boolean;
}

function niceMax(v: number) {
  if (v <= 1) return Math.ceil(v * 10) / 10;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / (mag / 2)) * (mag / 2);
}

export function LineChart({
  labels,
  series,
  yUnit = "",
  title,
}: {
  labels: string[];
  series: LineSeries[];
  yUnit?: string;
  title: string;
}) {
  const w = Math.max(560, labels.length * 58);
  const h = 260;
  const pad = { l: 52, r: 16, t: 16, b: 40 };
  const all = series.flatMap((s) => s.values);
  const max = niceMax(Math.max(...all, 1));
  const min = 0;
  const plotW = w - pad.l - pad.r;
  const plotH = h - pad.t - pad.b;
  const x = (i: number) => pad.l + (labels.length === 1 ? plotW / 2 : (i * plotW) / (labels.length - 1));
  const y = (v: number) => pad.t + plotH - ((v - min) / (max - min)) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => min + f * (max - min));

  return (
    <figure className="panel p-4">
      <figcaption className="mb-3 text-sm font-semibold">{title}</figcaption>
      <div className="overflow-x-auto">
        <svg width={w} height={h} role="img" aria-label={title} className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth="1" />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">
                {Number(t.toFixed(2))}
                {yUnit}
              </text>
            </g>
          ))}
          {labels.map((l, i) => (
            <text key={l + i} x={x(i)} y={h - pad.b + 18} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
              {l}
            </text>
          ))}
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
                  strokeWidth="1.5"
                  strokeDasharray={s.accent ? "5 4" : undefined}
                />
                {s.values.map((v, i) => (
                  <circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill={color} />
                ))}
              </g>
            );
          })}
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + plotH} y2={pad.t + plotH} stroke="var(--primary)" strokeWidth="1" />
          <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + plotH} stroke="var(--primary)" strokeWidth="1" />
        </svg>
      </div>
      {series.length > 1 ? (
        <ul className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--muted-foreground)]">
          {series.map((s) => (
            <li key={s.name} className="flex items-center gap-2">
              <span
                className="inline-block h-0 w-6 border-t"
                style={{ borderColor: s.accent ? "var(--accent)" : "var(--primary)", borderTopWidth: 2 }}
              />
              {s.name}
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}

export function BarChart({
  data,
  title,
  unit = "",
}: {
  data: { label: string; value: number }[];
  title: string;
  unit?: string;
}) {
  const barW = 54;
  const w = Math.max(560, data.length * barW + 80);
  const h = 300;
  const pad = { l: 56, r: 16, t: 16, b: 96 };
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const plotH = h - pad.t - pad.b;
  const y = (v: number) => pad.t + plotH - (v / max) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);

  return (
    <figure className="panel p-4">
      <figcaption className="mb-3 text-sm font-semibold">{title}</figcaption>
      <div className="overflow-x-auto">
        <svg width={w} height={h} role="img" aria-label={title} className="block">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth="1" />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">
                {Math.round(t)}
                {unit}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = pad.l + 14 + i * barW;
            return (
              <g key={d.label}>
                <rect x={cx} y={y(d.value)} width={barW - 20} height={pad.t + plotH - y(d.value)} fill="var(--primary)" />
                <text
                  x={cx + (barW - 20) / 2}
                  y={pad.t + plotH + 12}
                  fontSize="11"
                  fill="var(--muted-foreground)"
                  textAnchor="end"
                  transform={`rotate(-40 ${cx + (barW - 20) / 2} ${pad.t + plotH + 12})`}
                >
                  {d.label.length > 18 ? `${d.label.slice(0, 17)}.` : d.label}
                </text>
              </g>
            );
          })}
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + plotH} y2={pad.t + plotH} stroke="var(--primary)" strokeWidth="1" />
          <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + plotH} stroke="var(--primary)" strokeWidth="1" />
        </svg>
      </div>
    </figure>
  );
}

export function ProgressList({ data, title }: { data: { label: string; value: number }[]; title: string }) {
  return (
    <section className="panel p-4">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <ul className="space-y-3">
        {data.map((d) => (
          <li key={d.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">{d.label}</span>
              <span className="shrink-0 tabular-nums text-[var(--muted-foreground)]">{d.value}%</span>
            </div>
            <div className="mt-1 h-2 w-full border border-[var(--border)] bg-[var(--background)]">
              <div className="h-full bg-[var(--primary)]" style={{ width: `${d.value}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
