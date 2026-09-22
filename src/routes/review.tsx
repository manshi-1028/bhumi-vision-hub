import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Page, PageHeading, Protected } from "../components/site";
import { EmptyBox, ErrorBox, Loading } from "../components/states";
import { Reveal } from "../components/motion";
import { decideSubmission, getSubmissions, type Submission } from "../lib/api";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review queue | BhoomiSetu" },
      { name: "description", content: "Government officials review, approve or reject research submitted to the repository." },
      { property: "og:title", content: "Review queue | BhoomiSetu" },
      { property: "og:description", content: "Official review queue for submitted land governance research." },
    ],
  }),
  component: () => (
    <Protected roles={["official"]}>
      <Review />
    </Protected>
  ),
});

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "border-[oklch(0.55_0.125_62/40%)] bg-[var(--accent-soft)] text-[var(--accent)]",
    approved: "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]",
    rejected: "border-[var(--border)] bg-transparent text-[var(--muted-foreground)] line-through",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${styles[status] ?? styles["rejected"]}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

function Review() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["submissions"], queryFn: getSubmissions });
  const decide = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approve" | "reject" }) => decideSubmission(id, decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const pending = query.data?.filter((s) => s.status === "pending") ?? [];
  const decided = query.data?.filter((s) => s.status !== "pending") ?? [];

  return (
    <Page>
      <PageHeading
        eyebrow="Official workspace"
        title="Review queue"
        description="Approved items appear in the public repository. Rejected items are marked as rejected. Only officials can access this queue."
      />

      {query.isPending ? <Loading /> : null}
      {query.isError ? <ErrorBox message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}

      {query.data ? (
        <div className="space-y-10">
          <section aria-label="Pending submissions">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-serif text-xl">Awaiting decision</h2>
              <span className="flex h-6 min-w-6 items-center justify-center border border-[var(--accent)] px-1.5 text-xs font-bold tabular-nums text-[var(--accent)]">
                {pending.length}
              </span>
              <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
            </div>

            {pending.length === 0 ? (
              <EmptyBox message="No submissions are waiting for review." />
            ) : (
              <ul className="space-y-4">
                {pending.map((item, i) => (
                  <SubmissionCard key={item.id} item={item} index={i} decide={decide} />
                ))}
              </ul>
            )}
          </section>

          {decided.length > 0 ? (
            <section aria-label="Processed submissions">
              <div className="mb-4 flex items-center gap-3">
                <h2 className="font-serif text-xl">Processed</h2>
                <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
              </div>
              <ul className="space-y-3 opacity-80">
                {decided.map((item) => (
                  <li key={item.id} className="panel flex flex-wrap items-center gap-3 p-4 text-sm">
                    <StatusBadge status={item.status} />
                    <span className="min-w-0 flex-1 truncate font-medium">{item.title}</span>
                    <span className="tabular-nums text-xs text-[var(--muted-foreground)]">Ref {item.id.slice(0, 8)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </Page>
  );
}

function SubmissionCard({ item, index, decide }: {
  item: Submission;
  index: number;
  decide: { isPending: boolean; mutate: (v: { id: string; decision: "approve" | "reject" }) => void };
}) {
  return (
    <Reveal delay={index * 80}>
      <article className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <span className="chip">Pending</span>
              <span className="tabular-nums">Ref {item.id.slice(0, 8)}</span>
              <span aria-hidden="true">·</span>
              <time>{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time>
            </div>
            <h3 className="mt-2 font-serif text-lg leading-snug">{item.title}</h3>
            {item.topic ? <p className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--primary-bright)]">{item.topic}</p> : null}
          </div>
          <StatusBadge status={item.status} />
        </div>

        <p className="mt-4 border-l-2 border-[var(--border)] pl-4 text-sm leading-6 text-[var(--muted-foreground)]">{item.body}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn"
            disabled={item.status !== "pending" || decide.isPending}
            onClick={() => decide.mutate({ id: item.id, decision: "approve" })}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m3 8.5 3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Approve
          </button>
          <button
            type="button"
            className="btn-outline"
            disabled={item.status !== "pending" || decide.isPending}
            onClick={() => decide.mutate({ id: item.id, decision: "reject" })}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            Reject
          </button>
          {decide.isPending ? <span className="spin-ring mt-1" aria-label="Updating" /> : null}
        </div>
      </article>
    </Reveal>
  );
}
