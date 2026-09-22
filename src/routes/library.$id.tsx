import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Page } from "../components/site";
import { EmptyBox, ErrorBox, Loading } from "../components/states";
import { Reveal } from "../components/motion";
import { getRecommended, getResearchItem } from "../lib/api";

export const Route = createFileRoute("/library/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Research item ${params.id.slice(0, 8)} | BhoomiSetu` },
      { name: "description", content: `Details, tags and related reading for research item ${params.id.slice(0, 8)} in the BhoomiSetu repository.` },
      { property: "og:title", content: `Research item ${params.id.slice(0, 8)} | BhoomiSetu` },
      { property: "og:description", content: "Research item detail in the BhoomiSetu repository. Sample data." },
    ],
  }),
  component: Detail,
});

function Badge({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-xs font-semibold ${
        accent ? "border-[oklch(0.55_0.125_62/35%)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--border)] bg-[var(--primary-soft)] text-[var(--primary)]"
      }`}
    >
      {children}
    </span>
  );
}

function Detail() {
  const { id } = Route.useParams();
  const item = useQuery({ queryKey: ["research", id], queryFn: () => getResearchItem(id) });
  const related = useQuery({ queryKey: ["recommended", id], queryFn: () => getRecommended(id), enabled: item.isSuccess });

  return (
    <Page>
      <Link to="/library" className="anim-reveal inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M13 8H2m0 0 4-4M2 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to repository
      </Link>

      {item.isPending ? <Loading /> : null}
      {item.isError ? (
        <div className="mt-4">
          <ErrorBox message={(item.error as Error).message} onRetry={() => item.refetch()} />
        </div>
      ) : null}

      {item.data ? (
        <article className="anim-up mt-6 space-y-8">
          {/* Document header */}
          <header className="border-b border-[var(--border)] pb-8">
            <div className="flex flex-wrap gap-2">
              <Badge accent>{item.data.type}</Badge>
              {item.data.state ? <Badge>{item.data.state}</Badge> : null}
              <Badge>{item.data.year}</Badge>
              <span className="inline-flex items-center border border-[var(--border)] px-2.5 py-1 text-xs tabular-nums text-[var(--muted-foreground)]">
                Reference {item.data.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="mt-4 max-w-4xl font-serif text-3xl leading-tight sm:text-4xl">{item.data.title}</h1>
            {item.data.topic ? (
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--primary-bright)]">{item.data.topic}</p>
            ) : null}
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.7fr_1fr]">
            {/* Main document */}
            <div className="space-y-8 min-w-0">
              <Reveal as="section">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                  <span className="h-px w-6 bg-[var(--accent)]" aria-hidden="true" />
                  Abstract
                </h2>
                <p className="panel p-6 text-[15px] leading-7 text-[var(--foreground)]">{item.data.summary}</p>
              </Reveal>

              {item.data.source ? (
                <Reveal as="section">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                    <span className="h-px w-6 bg-[var(--accent)]" aria-hidden="true" />
                    Source
                  </h2>
                  <p className="panel p-5 text-sm leading-6 text-[var(--muted-foreground)]">{item.data.source}</p>
                </Reveal>
              ) : null}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <Reveal>
                <section className="panel p-5">
                  <h2 className="card-label mb-3">Record metadata</h2>
                  <dl className="space-y-2.5 text-sm">
                    {[
                      ["Type", item.data.type],
                      ["Topic", item.data.topic],
                      ["Region", item.data.state],
                      ["Year", String(item.data.year)],
                      ["Reference", item.data.id.slice(0, 8)],
                    ]
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 border-b border-[var(--border)] pb-2 last:border-0 last:pb-0">
                          <dt className="text-[var(--muted-foreground)]">{k}</dt>
                          <dd className="text-right font-semibold text-[var(--foreground)]">{v}</dd>
                        </div>
                      ))}
                  </dl>
                </section>
              </Reveal>

              <Reveal delay={120}>
                <section className="panel p-5">
                  <h2 className="card-label mb-3">Tags</h2>
                  {item.data.tags.length === 0 ? (
                    <p className="text-sm text-[var(--muted-foreground)]">No tags recorded for this item.</p>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
                      {item.data.tags.map((t) => (
                        <li key={t} className="chip !bg-transparent">{t}</li>
                      ))}
                    </ul>
                  )}
                </section>
              </Reveal>
            </aside>
          </div>

          {/* Related evidence */}
          <Reveal as="section" className="pt-4">
            <div className="mb-5 flex items-center gap-3">
              <h2 className="font-serif text-2xl">Related evidence</h2>
              <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
            </div>
            {related.isPending ? <Loading label="Finding related records..." /> : null}
            {related.isError ? <ErrorBox message={(related.error as Error).message} onRetry={() => related.refetch()} /> : null}
            {related.data ? (
              related.data.length === 0 ? (
                <EmptyBox message="No related items for this topic or region yet." />
              ) : (
                <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {related.data.map((r, i) => (
                    <li key={r.id} style={{ animation: "bs-fade-up 560ms ease both", animationDelay: `${i * 70}ms` }}>
                      <Link to="/library/$id" params={{ id: r.id }} className="panel panel-hover group block h-full p-5">
                        <div className="flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
                          <span className="chip">{r.type}</span>
                          <span className="tabular-nums">{r.year}</span>
                        </div>
                        <h3 className="mt-2 font-serif text-base leading-snug text-[var(--primary)] group-hover:text-[var(--primary-bright)]">{r.title}</h3>
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                          {r.topic}{r.state ? ` · ${r.state}` : ""}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : null}
          </Reveal>
        </article>
      ) : null}
    </Page>
  );
}
