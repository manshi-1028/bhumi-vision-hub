import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Page } from "../components/site";
import { EmptyBox, ErrorBox, Loading } from "../components/states";
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

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">{children}</span>;
}

function Detail() {
  const { id } = Route.useParams();
  const item = useQuery({ queryKey: ["research", id], queryFn: () => getResearchItem(id) });
  const related = useQuery({ queryKey: ["recommended", id], queryFn: () => getRecommended(id), enabled: item.isSuccess });

  return (
    <Page>
      <Link to="/library" className="text-sm text-[var(--primary)] hover:underline">
        Back to repository
      </Link>

      {item.isPending ? <Loading /> : null}
      {item.isError ? (
        <div className="mt-4">
          <ErrorBox message={(item.error as Error).message} onRetry={() => item.refetch()} />
        </div>
      ) : null}

      {item.data ? (
        <article className="mt-4 space-y-6">
          <header>
            <h1 className="text-2xl sm:text-3xl">{item.data.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{item.data.type}</Badge>
              <Badge>{item.data.topic}</Badge>
              <Badge>{item.data.state}</Badge>
              <Badge>{item.data.year}</Badge>
              <Badge>Reference {item.data.id.slice(0, 8)}</Badge>
            </div>
          </header>

          <section className="panel p-5">
            <h2 className="text-lg">Summary</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.data.summary}</p>
          </section>

          <section className="panel p-5">
            <h2 className="text-lg">Tags</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.data.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </section>

          {item.data.source ? (
            <section className="panel p-5">
              <h2 className="text-lg">Source</h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{item.data.source}</p>
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 text-lg">Recommended</h2>
            {related.isPending ? <Loading /> : null}
            {related.isError ? <ErrorBox message={(related.error as Error).message} onRetry={() => related.refetch()} /> : null}
            {related.data ? (
              related.data.length === 0 ? (
                <EmptyBox message="No related items for this topic or state yet." />
              ) : (
                <ul className="divide-y divide-[var(--border)] border border-[var(--border)] bg-[var(--surface)]">
                  {related.data.map((r) => (
                    <li key={r.id} className="p-4">
                      <Link to="/library/$id" params={{ id: r.id }} className="text-[var(--primary)] hover:underline">
                        {r.title}
                      </Link>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {r.type} | {r.topic} | {r.state} | {r.year}
                      </p>
                    </li>
                  ))}
                </ul>
              )
            ) : null}
          </section>
        </article>
      ) : null}
    </Page>
  );
}
