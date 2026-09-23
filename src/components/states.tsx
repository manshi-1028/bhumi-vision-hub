import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LockIcon, TriangleAlertIcon } from "./ui/icons";

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status">
      <div className="spin-ring" aria-hidden="true" />
      <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
    </div>
  );
}

/**
 * Polished list-loading state: a quiet status line plus soft placeholder
 * rows built from the existing panel and color tokens (no external
 * skeleton dependency).
 */
export function LoadingRows({ label, rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div className="space-y-3" role="status">
      {label ? (
        <p className="flex items-center gap-2.5 text-sm text-[var(--muted-foreground)]">
          <span className="spin-ring !h-4 !w-4" aria-hidden="true" />
          {label}
        </p>
      ) : null}
      <ul className="space-y-3" aria-hidden="true">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="panel p-5" style={{ opacity: 0.9 - i * 0.2 }}>
            <div className="h-3 w-24 animate-pulse rounded-[var(--radius-md)] bg-[var(--primary-soft-strong)]" />
            <div
              className="mt-3 h-4 w-2/3 animate-pulse rounded-[var(--radius-md)] bg-[var(--primary-soft-strong)]"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="mt-2.5 h-3 w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--primary-soft)]"
              style={{ animationDelay: "300ms" }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EmptyBox({
  title,
  message,
  hint,
  action,
  icon,
}: {
  title?: string;
  message: string;
  hint?: string;
  action?: ReactNode;
  /** Optional 20x20 stroke icon rendered in the default placeholder chip. */
  icon?: ReactNode;
}) {
  return (
    <div className="panel px-6 py-10 text-center sm:px-8">
      {icon ? (
        <span
          className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-[var(--border)] bg-[var(--primary-soft)] text-[var(--muted-foreground)] opacity-80"
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="mx-auto mb-3 text-[var(--muted-foreground)] opacity-50" aria-hidden="true">
          <rect x="4" y="4" width="12" height="12" stroke="currentColor" strokeWidth="1.5" />
          <rect x="16" y="16" width="14" height="14" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 10h10M10 16v10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      )}
      {title ? <p className="font-serif text-lg text-[var(--ink)]">{title}</p> : null}
      <p className="mx-auto mt-1 max-w-md text-sm text-[var(--muted-foreground)]">{message}</p>
      {hint ? (
        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[var(--muted-foreground)] opacity-80">{hint}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="panel p-6" style={{ borderColor: "var(--accent)" }} role="alert">
      <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--accent)" }}>
        <TriangleAlertIcon className="h-4 w-4" />
        Something went wrong
      </p>
      <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">{message}</p>
      {onRetry ? (
        <button type="button" className="btn-outline mt-4" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

/** Professional blocked-workspace state for role-restricted routes. */
export function AccessRestricted({ requiredRole }: { requiredRole?: string }) {
  return (
    <div className="panel mx-auto mt-12 max-w-lg p-8 text-center" role="alert">
      <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center border border-[oklch(0.55_0.125_62/35%)] bg-[var(--accent-soft)] text-[var(--accent)]">
        <LockIcon className="h-5 w-5" />
      </span>
      <p className="eyebrow">Access restricted</p>
      <h2 className="mt-2 font-serif text-2xl">This workspace is limited</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--muted-foreground)]">
        {requiredRole
          ? `This area is available to ${requiredRole} accounts only. Your current role does not include access to it.`
          : "Your account does not have access to this area."}
      </p>
      <Link to="/" className="btn-outline mt-6">
        Return to dashboard
      </Link>
    </div>
  );
}
