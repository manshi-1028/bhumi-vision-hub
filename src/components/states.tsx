import type { ReactNode } from "react";

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="spin-ring" aria-hidden="true" />
      <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
    </div>
  );
}

export function EmptyBox({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="panel p-6 text-center">
      <p className="text-sm text-[var(--muted-foreground)]">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="panel p-6" style={{ borderColor: "var(--accent)" }}>
      <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
        Something went wrong
      </p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{message}</p>
      {onRetry ? (
        <button type="button" className="btn-outline mt-4" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
