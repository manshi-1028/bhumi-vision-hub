/**
 * Decorative topographic / cadastral motifs. Purely visual, aria-hidden,
 * pointer-events-none, and safe under prefers-reduced-motion (CSS slows them).
 */

/** Animated contour lines, used behind dark hero/section surfaces. */
export function TopoLines({ className = "", opacity = 1 }: { className?: string; opacity?: number }) {
  const paths = [
    "M0 120 C 120 60, 260 180, 420 110 S 700 40, 860 120 S 1100 190, 1240 110",
    "M0 170 C 140 110, 280 230, 440 160 S 720 90, 880 170 S 1110 240, 1240 160",
    "M0 220 C 160 160, 300 280, 460 210 S 740 140, 900 220 S 1120 290, 1240 210",
    "M0 270 C 180 210, 320 330, 480 260 S 760 190, 920 270 S 1130 340, 1240 260",
  ];
  return (
    <svg
      viewBox="0 0 1240 320"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="oklch(0.72 0.13 70)"
          strokeWidth="1"
          opacity={0.14 + i * 0.04}
          className="anim-drift"
          style={{ animationDelay: `${i * -3.5}s` }}
        />
      ))}
    </svg>
  );
}

/** Cadastral parcel grid with two highlighted plots; used in light sections. */
export function ParcelMotif({ className = "" }: { className?: string }) {
  const lines: number[] = [];
  for (let i = 1; i < 8; i++) {
    lines.push(120 + (i * 640) / 8);
  }
  return (
    <svg viewBox="0 0 880 240" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: 5 }, (_, r) => (
        <line key={`h${r}`} x1="0" x2="880" y1={r * 60} y2={r * 60} stroke="var(--border)" strokeWidth="1" opacity="0.6" />
      ))}
      {lines.map((x, i) => (
        <line key={`v${i}`} x1={x} x2={x} y1="0" y2="240" stroke="var(--border)" strokeWidth="1" opacity="0.6" />
      ))}
      {/* highlighted parcels */}
      <rect x="120" y="60" width="80" height="60" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="1.25" opacity="0.9" />
      <rect x="440" y="120" width="120" height="60" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.25" opacity="0.85" />
      <rect x="680" y="0" width="80" height="60" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="1.25" opacity="0.7" />
    </svg>
  );
}

/** Thin section divider with a small land-parcel glyph. */
export function SectionRule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-[var(--border)]" />
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="1.5" width="9" height="9" stroke="var(--primary)" strokeWidth="1.25" />
        <rect x="6" y="6" width="8.5" height="8.5" stroke="var(--accent)" strokeWidth="1.25" />
      </svg>
      <span className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}
