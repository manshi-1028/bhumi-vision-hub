import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Page, PageHeading, Protected } from "../components/site";
import { getStates, getTopics, getTypes, submitResearch } from "../lib/api";
import { Reveal } from "../components/motion";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit research | BhoomiSetu" },
      { name: "description", content: "Researchers and institutions can submit land governance research to the repository for review." },
      { property: "og:title", content: "Submit research | BhoomiSetu" },
      { property: "og:description", content: "Submit a research item to the BhoomiSetu repository for official review." },
    ],
  }),
  component: () => (
    <Protected>
      <SubmitPage />
    </Protected>
  ),
});

function SubmitPage() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const { data: topics } = useQuery({ queryKey: ["topics"], queryFn: getTopics });
  const { data: states } = useQuery({ queryKey: ["states"], queryFn: getStates });
  const { data: types } = useQuery({ queryKey: ["types"], queryFn: getTypes });

  const [state, setState] = useState("");
  const [type, setType] = useState("");

  if (topics && topics.length > 0 && !topic) setTopic(topics[0]!);
  if (states && states.length > 0 && !state) setState(states[0]!);
  if (types && types.length > 0 && !type) setType(types[0]!);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const item = await submitResearch({
        title,
        topic,
        body: summary,
      });
      setDone(`Submission received. Reference ${item.id.slice(0, 8)}. It is now pending official review.`);
      setTitle("");
      setSummary("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <PageHeading
        eyebrow="Contribute to the evidence base"
        title="Submit research"
        description="Submissions enter the official review queue and appear in the public repository once an official approves them. Researchers and institutions can both contribute."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <form className="panel space-y-7 p-6 sm:p-8" onSubmit={onSubmit} aria-label="Research submission form" aria-busy={busy}>
            <p className="border-b border-[var(--border)] pb-4 text-xs text-[var(--muted-foreground)]">
              Fields marked <span className="font-bold text-[var(--accent)]" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span> are required.
            </p>

            {/* Step 1 — Title */}
            <section aria-label="Record title">
              <p className="card-label mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center border border-[var(--border)] text-[9px] font-bold text-[var(--muted-foreground)]" aria-hidden="true">1</span>
                Record details
              </p>
              <label className="block">
                <span className="mb-1.5 flex items-baseline gap-1 text-sm font-semibold text-[var(--foreground)]">
                  Title
                  <span className="font-bold text-[var(--accent)]" aria-hidden="true">*</span>
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  aria-required="true"
                  placeholder="Full title of the research output"
                  className="!text-base"
                />
              </label>
            </section>

            {/* Step 2 — Classification */}
            <section aria-label="Classification">
              <p className="card-label mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center border border-[var(--border)] text-[9px] font-bold text-[var(--muted-foreground)]" aria-hidden="true">2</span>
                Classification
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <label className="block">
                  <span className="card-label mb-1.5 block">Type</span>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    {(types ?? []).map((t) => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="card-label mb-1.5 block">Topic</span>
                  <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                    {(topics ?? []).map((t) => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="card-label mb-1.5 block">State</span>
                  <select value={state} onChange={(e) => setState(e.target.value)}>
                    {(states ?? []).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </div>
            </section>

            {/* Step 3 — Summary */}
            <section aria-label="Summary">
              <p className="card-label mb-3 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center border border-[var(--border)] text-[9px] font-bold text-[var(--muted-foreground)]" aria-hidden="true">3</span>
                Description
              </p>
              <label className="block">
                <span className="mb-1.5 flex items-baseline justify-between gap-2">
                  <span className="flex items-baseline gap-1 text-sm font-semibold text-[var(--foreground)]">
                    Summary
                    <span className="font-bold text-[var(--accent)]" aria-hidden="true">*</span>
                  </span>
                  <span className="text-[10px] normal-case tracking-normal text-[var(--muted-foreground)]">
                    {summary.trim().length} characters
                  </span>
                </span>
                <textarea
                  rows={7}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                  aria-required="true"
                  placeholder="Abstract or key findings. Describe the method, the region and period covered, and the headline result."
                  className="!leading-7"
                />
              </label>
            </section>

            {error ? (
              <div className="anim-up border p-4" style={{ borderColor: "var(--accent)" }} role="alert">
                <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--accent)" }}>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 1.5 15 14H1L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="8" cy="11.6" r="0.8" fill="currentColor" />
                  </svg>
                  Submission failed
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{error}</p>
                <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                  Check the highlighted fields and your connection, then submit again.
                </p>
              </div>
            ) : null}
            {done ? (
              <div className="anim-up flex items-start gap-3 border border-[var(--primary)] bg-[var(--primary-soft)] p-4 text-sm" role="status">
                <svg className="mt-0.5 shrink-0 text-[var(--primary)]" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="9" cy="9" r="7.25" stroke="currentColor" strokeWidth="1.5" />
                  <path d="m5.75 9.25 2.25 2.25 4.25-4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[var(--foreground)]">
                  <strong className="font-semibold">Submission received.</strong> {done.replace("Submission received. ", "")}
                </span>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-5">
              <button type="submit" className="btn w-full sm:w-auto" disabled={busy} aria-busy={busy}>
                {busy ? (
                  <>
                    <span className="spin-ring !h-4 !w-4 !border" aria-hidden="true" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit for review
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M2 8h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
              <p className="text-xs text-[var(--muted-foreground)]">
                {busy ? "Sending your record to the review queue..." : "Your record is reviewed by an official before publication."}
              </p>
            </div>
          </form>
        </Reveal>

        <Reveal delay={140}>
          <aside className="space-y-4">
            <section className="panel p-5">
              <h2 className="card-label mb-3">What happens next</h2>
              <ol className="space-y-3.5 text-sm">
                {[
                  ["Submitted", "Your record enters the review queue with pending status."],
                  ["Official review", "A government official checks the abstract, region and classification."],
                  ["Published", "Approved records appear in the public research repository."],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--primary)] text-[11px] font-bold text-[var(--primary)]">
                      {i + 1}
                    </span>
                    <span>
                      <strong className="font-semibold">{t}.</strong>{" "}
                      <span className="text-[var(--muted-foreground)]">{d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
            <section className="dark-section relative overflow-hidden p-5">
              <p className="eyebrow-dark mb-2">Roles</p>
              <p className="text-sm leading-6 text-[var(--dark-muted)]">
                Researchers and institutions submit evidence. Government officials review and approve it. Your account
                role determines what you see.
              </p>
            </section>
          </aside>
        </Reveal>
      </div>
    </Page>
  );
}
