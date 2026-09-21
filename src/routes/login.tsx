import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Page, PageHeading } from "../components/site";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | BhoomiSetu" },
      { name: "description", content: "Sign in to submit research or review submissions on the BhoomiSetu prototype." },
      { property: "og:title", content: "Login | BhoomiSetu" },
      { property: "og:description", content: "Demo sign in for the BhoomiSetu prototype, SIH26019." },
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
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <PageHeading title="Sign in" description="Demonstration accounts only. No real credentials are stored." />
      <div className="grid gap-6 md:grid-cols-2">
        <form className="panel space-y-4 p-5" onSubmit={onSubmit}>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error ? (
            <p className="border p-3 text-sm" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <section className="panel p-5 text-sm">
          <h2 className="text-lg">Demo accounts</h2>
          <p className="mt-2 text-[var(--muted-foreground)]">Password for every account is demo123.</p>
          <ul className="disc mt-3 space-y-1 text-[var(--muted-foreground)]">
            <li>official@example.gov.in, full access including the review queue.</li>
            <li>institution@example.ac.in, dashboard, library, simulator and submissions.</li>
            <li>researcher@example.ac.in, dashboard, library, simulator and submissions.</li>
            <li>Any other address is treated as a researcher.</li>
          </ul>
        </section>
      </div>
    </Page>
  );
}
