import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../lib/auth";
import { Loading } from "./states";
import { BrandMark } from "./brand";

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
  { to: "/library", label: "Research Library" },
  { to: "/simulator", label: "Simulator" },
  { to: "/submit", label: "Submit" },
  { to: "/review", label: "Review" },
  { to: "/about", label: "About" },
] as const;

function SampleBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 border border-[oklch(0.72_0.13_70/45%)] bg-[oklch(0.72_0.13_70/12%)] px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-[var(--accent-bright)] uppercase">
      <span className="anim-pulse-soft inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-bright)]" aria-hidden="true" />
      Demo Data
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
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[oklch(0.977_0.008_95/88%)] backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 text-[var(--primary)]">
            <BrandMark size={30} />
            <span className="font-serif text-lg font-semibold tracking-tight">BhoomiSetu</span>
          </Link>
          <span className="hidden sm:inline">
            <SampleBadge />
</span>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <nav className="hidden items-center gap-5 text-sm md:flex" aria-label="Primary">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="nav-link"
                activeProps={{ className: "nav-link active" }}
              >
                {l.label}
                <span className="nav-underline" aria-hidden="true" />
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 text-xs md:flex">
            {user ? (
              <>
                <span className="flex flex-col items-end leading-tight">
                  <span className="font-semibold text-[var(--foreground)]">{user.fullName ?? user.email}</span>
                  <span className="font-semibold uppercase tracking-wide text-[var(--accent)]">{user.role}</span>
                </span>
                <button
                  type="button"
                  className="btn-outline !px-3 !py-1.5"
                  onClick={() => {
                    signOut();
                    navigate({ to: "/" });
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn !px-3.5 !py-1.5">
                Login
              </Link>
            )}
          </div>
          <button type="button" className="btn-outline md:hidden !px-2.5 !py-1.5" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <MenuIcon open={open} />
          </button>
        </div>
      </div>
      {open ? (
        <div className="anim-up border-t border-[var(--border)] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1 text-sm" aria-label="Mobile">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-[var(--radius-md)] px-2 py-1.5 hover:bg-[var(--primary-soft)]">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] pt-3 text-xs">
            <SampleBadge />
            {user ? (
              <>
                <span className="flex flex-col leading-tight">
                  <span className="font-semibold">{user.fullName ?? user.email}</span>
                  <span className="font-semibold uppercase tracking-wide text-[var(--accent)]">{user.role}</span>
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
    <footer className="mt-10 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 text-xs text-[var(--muted-foreground)]">
        <span className="flex items-center gap-2">
          <BrandMark size={16} />
          BhoomiSetu, SIH26019, {new Date().getFullYear()}
        </span>
        <span className="hidden sm:inline">National land governance intelligence, demonstration environment</span>
      </div>
      <p className="sr-only">All displayed figures are sample data prepared for the SIH26019 prototype.</p>
      </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="page-enter mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="anim-up mb-8">
      {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-3xl leading-tight sm:text-4xl">{title}</h1>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">{description}</p> : null}
    </div>
  );
}

/** Client side role guard. Redirects unauthenticated users to /login. */
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
