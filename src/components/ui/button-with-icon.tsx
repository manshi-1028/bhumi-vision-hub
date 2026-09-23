import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Primary call-to-action: label plus a bordered circular arrow chip that
 * shifts right and rotates 45deg on hover. Intentionally reserved for the
 * most important actions on a page (download briefing, open the platform);
 * regular controls keep the standard .btn / .btn-outline styles.
 *
 * Implemented with the existing token system and CSS transitions so it stays
 * inside the single motion language (no second animation library).
 */
export function ButtonWithIcon({
  children,
  variant = "default",
  className = "",
  arrowClass = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /** "default" = primary green for light surfaces, "dark" = amber-on-dark for dark sections. */
  variant?: "default" | "dark";
  className?: string;
  arrowClass?: string;
}) {
  const base =
    variant === "dark"
      ? "border-[oklch(0.72_0.13_70/60%)] bg-[oklch(0.72_0.13_70/14%)] text-[var(--accent-bright)] hover:bg-[oklch(0.72_0.13_70/24%)] hover:border-[oklch(0.72_0.13_70/80%)] hover:shadow-[0_0_0_3px_oklch(0.72_0.13_70/14%)]"
      : "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[oklch(0.29_0.052_160)] hover:shadow-[var(--glow-primary)]";
  const chip =
    variant === "dark"
      ? "border-[oklch(0.72_0.13_70/45%)] bg-[oklch(0.72_0.13_70/12%)] text-[var(--accent-bright)]"
      : "border-[oklch(0.985_0.005_95/28%)] bg-[oklch(0.985_0.005_95/12%)] text-[var(--primary-foreground)]";

  return (
    <button
      type="button"
      className={`group inline-flex items-center gap-3 border px-5 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 ${base} ${className}`}
      {...props}
    >
      <span>{children}</span>
      <span
        className={`flex h-6 w-6 items-center justify-center border transition-all duration-200 group-hover:translate-x-0.5 group-hover:rotate-45 ${chip} ${arrowClass}`}
        aria-hidden="true"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6h7m0 0L6.2 2.7M9.5 6 6.2 9.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}
