import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Page, PageHeading, Protected } from "../components/site";
import { getStates, getTopics, getTypes, submitResearch } from "../lib/api";

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
      <PageHeading title="Submit research" description="Submissions enter the review queue and appear in the repository once an official approves them." />

      <form className="panel space-y-4 p-5" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted-foreground)]">Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">Type</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {(types ?? []).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">Topic</span>
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              {(topics ?? []).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">State</span>
            <select value={state} onChange={(e) => setState(e.target.value)}>
              {(states ?? []).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted-foreground)]">Summary</span>
          <textarea rows={6} value={summary} onChange={(e) => setSummary(e.target.value)} required />
        </label>

        {error ? (
          <p className="border p-3 text-sm" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
            {error}
          </p>
        ) : null}
        {done ? <p className="border border-[var(--border)] p-3 text-sm text-[var(--muted-foreground)]">{done}</p> : null}

        <button type="submit" className="btn" disabled={busy}>
          {busy ? "Submitting..." : "Submit for review"}
        </button>
      </form>
    </Page>
  );
}
