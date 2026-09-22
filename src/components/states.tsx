import type { ReactNode } from "react";

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status">
      <div className="spin-ring" aria-hidden="true" />
      <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
    </div>
  );
}

export function EmptyBox({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="panel p-8 text-center">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="mx-auto mb-3 text-[var(--muted-foreground)] opacity-50" aria-hidden="true">
        <rect x="4" y="4" width="12" height="12" stroke="currentColor" strokeWidth="1.5" />
        <rect x="16" y="16" width="14" height="14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 10h10M10 16v10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
      <p className="text-sm text-[var(--muted-foreground)]">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="panel p-6" style={{ borderColor: "var(--accent)" }} role="alert">
      <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--accent)" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 1.5 15 14H1L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11.6" r="0.8" fill="currentColor" />
        </svg>
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
