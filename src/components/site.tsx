import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../lib/auth";
import { Loading } from "./states";

/** Inline SVG, 1.5px strokes, currentColor. */
export function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/library", label: "Library" },
  { to: "/simulator", label: "Simulator" },
  { to: "/submit", label: "Submit" },
  { to: "/review", label: "Review" },
  { to: "/about", label: "About" },
] as const;

function SampleBadge() {
  return (
    <span className="border border-[var(--border)] px-2 py-0.5 text-[11px] tracking-wide text-[var(--muted-foreground)] uppercase">
      Sample data
    </span>
  );
}

function Header() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = NAV.filter((n) => {
    if (n.to === "/review") return user?.role === "official";
    if (n.to === "/simulator" || n.to === "/submit") return !!user;
    return true;
  });

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="min-w-0 truncate font-serif text-lg font-semibold text-[var(--primary)]">
            BhoomiSetu
          </Link>
          <span className="hidden sm:inline">
            <SampleBadge />
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="hover:underline" activeProps={{ className: "underline font-semibold" }}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 text-xs md:flex">
            {user ? (
              <>
                <span className="text-[var(--muted-foreground)]">
                  {user.fullName ?? user.email} ({user.role})
                </span>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    signOut();
                    navigate({ to: "/" });
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn">
                Login
              </Link>
            )}
          </div>
          <button type="button" className="btn-outline md:hidden" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
            <MenuIcon open={open} />
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[var(--border)] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2 text-sm">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-1">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] pt-3 text-xs">
            <SampleBadge />
            {user ? (
              <>
                <span className="text-[var(--muted-foreground)]">
                  {user.fullName ?? user.email} ({user.role})
                </span>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                    navigate({ to: "/" });
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn" onClick={() => setOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-[var(--muted-foreground)]">
        BhoomiSetu, SIH26019, {new Date().getFullYear()}
      </div>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm text-[var(--muted-foreground)]">{description}</p> : null}
    </div>
  );
}

/** Client side guard for the mock auth model. */
export function Protected({ roles, children }: { roles?: readonly string[]; children: ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.navigate({ to: "/login" });
    else if (roles && !roles.includes(user.role)) router.navigate({ to: "/" });
  }, [ready, user, roles, router]);

  if (!ready || !user || (roles && !roles.includes(user.role))) return <Loading />;
  return <>{children}</>;
}
