import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Page } from "../components/site";
import { useAuth } from "../lib/auth";
import { BrandMark } from "../components/brand";
import { TopoLines } from "../components/decor";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | BhoomiSetu" },
      { name: "description", content: "Sign in to submit research or review submissions on the BhoomiSetu platform." },
      { property: "og:title", content: "Login | BhoomiSetu" },
      { property: "og:description", content: "Sign in for the BhoomiSetu platform, SIH26019." },
    ],
  }),
  component: Login,
});

function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate({ to: "/" });
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("Invalid login")) {
        setError("Invalid email or password. Please check your credentials.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
        {/* Brand panel */}
        <section className="dark-section relative overflow-hidden p-8 sm:p-10">
          <TopoLines opacity={0.6} />
          <div className="bs-grid-overlay-dark absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative flex h-full flex-col">
            <BrandMark size={40} className="anim-up text-[var(--accent-bright)]" />
            <h1 className="anim-up mt-6 font-serif text-3xl leading-tight text-[var(--dark-foreground)]" style={{ animationDelay: "100ms" }}>
              Sign in to the
              <br />
              land intelligence
              <br />
              <span className="text-[var(--accent-bright)]">platform</span>
            </h1>
            <p className="anim-up mt-4 max-w-sm text-sm leading-6 text-[var(--dark-muted)]" style={{ animationDelay: "200ms" }}>
              One account for the national dashboard, research repository, policy simulator and evidence submission.
            </p>
            <ul className="anim-up mt-auto space-y-2.5 pt-8 text-sm text-[var(--dark-muted)]" style={{ animationDelay: "300ms" }}>
              {[
                "Researchers and institutions submit evidence",
                "Government officials review submissions",
                "Session-based access with role-aware navigation",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-bright)]" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Form panel */}
        <section className="panel p-8 sm:p-10">
          <p className="eyebrow mb-2">Account access</p>
          <h2 className="font-serif text-2xl">Welcome back</h2>

          <form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <label className="block">
              <span className="card-label mb-1.5 block">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="name@department.gov.in"
              />
            </label>
            <label className="block">
              <span className="card-label mb-1.5 block">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Your account password"
              />
            </label>

            {error ? (
              <p className="anim-up border p-3.5 text-sm" style={{ borderColor: "var(--accent)", color: "var(--accent)" }} role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn w-full" disabled={busy}>
              {busy ? (
                <>
                  <span className="spin-ring !h-4 !w-4" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <p className="card-label mb-2">Demo environment</p>
            <p className="text-xs leading-5 text-[var(--muted-foreground)]">
              This deployment runs on demonstration data. Accounts for researcher, institution and official roles are
              provisioned in the demo environment. The password for every demo account is <code className="border border-[var(--border)] bg-[var(--primary-soft)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--primary)]">demo123</code>.
            </p>
          </div>
        </section>
      </div>
    </Page>
  );
}
