import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { Page, PageHeading } from "../components/site";
import { EmptyBox, ErrorBox, Loading } from "../components/states";
import { getStates, getTopics, getTypes, searchLibrary } from "../lib/api";

export const Route = createFileRoute("/library/")({
  head: () => ({
    meta: [
      { title: "Research repository | BhoomiSetu" },
      {
        name: "description",
        content: "Search policy briefs, datasets, field studies and reports on land governance across twelve states.",
      },
      { property: "og:title", content: "Research repository | BhoomiSetu" },
      { property: "og:description", content: "Searchable repository of land governance research. Sample data." },
    ],
  }),
  component: Library,
});

const YEARS_FILTER = Array.from({ length: 10 }, (_, i) => 2017 + i);

function Library() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [topic, setTopic] = useState("");
  const [state, setState] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);

  const { data: states } = useQuery({ queryKey: ["states"], queryFn: getStates });
  const { data: topics } = useQuery({ queryKey: ["topics"], queryFn: getTopics });
  const { data: types } = useQuery({ queryKey: ["types"], queryFn: getTypes });

  const filters = { q, type, topic, state, year, page, pageSize: 10 };
  const query = useQuery({
    queryKey: ["library", filters],
    queryFn: () => searchLibrary(filters),
    placeholderData: keepPreviousData,
  });

  function clearFilters() {
    setQ("");
    setType("");
    setTopic("");
    setState("");
    setYear("");
    setPage(1);
  }

  return (
    <Page>
      <PageHeading
        title="Research repository"
        description="Research items on land records, disputes, ownership equity, climate resilience, urban land use and tenancy."
      />

      <div className="panel mb-6 space-y-4 p-4">
        <label className="block text-sm">
          <span className="mb-1 block text-[var(--muted-foreground)]">Search</span>
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Title, summary or tag"
          />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">Type</span>
            <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
              <option value="">All types</option>
              {(types ?? []).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">Topic</span>
            <select value={topic} onChange={(e) => { setTopic(e.target.value); setPage(1); }}>
              <option value="">All topics</option>
              {(topics ?? []).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">State</span>
            <select value={state} onChange={(e) => { setState(e.target.value); setPage(1); }}>
              <option value="">All states</option>
              {(states ?? []).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted-foreground)]">Year</span>
            <select value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }}>
              <option value="">All years</option>
              {YEARS_FILTER.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" className="btn-outline" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      {query.isPending ? <Loading /> : null}
      {query.isError ? <ErrorBox message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}

      {query.data ? (
        query.data.total === 0 ? (
          <EmptyBox
            message="No results match your filters."
            action={
              <button type="button" className="btn-outline" onClick={clearFilters}>
                Clear filters
              </button>
            }
          />
        ) : (
          <>
            <p className="mb-3 text-sm text-[var(--muted-foreground)]">
              {query.data.total} items, page {query.data.page} of {query.data.totalPages}
            </p>
            <ul className="divide-y divide-[var(--border)] border border-[var(--border)] bg-[var(--surface)]">
              {query.data.items.map((item) => (
                <li key={item.id} className="p-4">
                  <Link to="/library/$id" params={{ id: item.id }} className="font-serif text-lg text-[var(--primary)] hover:underline">
                    {item.title}
                  </Link>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {item.type} | {item.topic} | {item.state} | {item.year} | Reference {item.id.slice(0, 8)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-foreground)]">{item.summary}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button type="button" className="btn-outline" disabled={query.data.page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span className="text-sm text-[var(--muted-foreground)]">
                Page {query.data.page} of {query.data.totalPages}
              </span>
              <button
                type="button"
                className="btn-outline"
                disabled={query.data.page >= query.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )
      ) : null}
    </Page>
  );
}
