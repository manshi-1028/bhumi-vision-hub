/**
 * BhoomiSetu brand mark: a land-parcel plot bisected by a connection stroke
 * (setu = bridge). Inline SVG, 1.75px strokes, currentColor only.
 */
export function BrandMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* parcel: outer plot */}
      <path
        d="M5 4h14l8 6v14l-10 4H5V4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* internal parcel subdivision lines */}
      <path d="M5 13h13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.55" />
      <path d="M18 4v9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" opacity="0.55" />
      {/* bridge stroke across the parcel */}
      <path
        d="M2 22c6-6 10-6 15-2s9 4 13-1"
        stroke="var(--accent)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
