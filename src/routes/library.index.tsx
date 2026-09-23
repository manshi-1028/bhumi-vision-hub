import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { Page } from "../components/site";
import { EmptyBox, ErrorBox, LoadingRows } from "../components/states";
import { TopoLines, SectionRule } from "../components/decor";
import { getStates, getTopics, getTypes, searchLibrary } from "../lib/api";

export const Route = createFileRoute("/library/")({
  head: () => ({
    meta: [
      { title: "Research & evidence repository | BhoomiSetu" },
      {
        name: "description",
        content: "Search policy briefs, datasets, field studies and reports on land governance across twelve states.",
      },
      { property: "og:title", content: "Research & evidence | BhoomiSetu" },
      { property: "og:description", content: "Searchable repository of land governance research. Sample data." },
    ],
  }),
  component: Library,
});

const YEARS_FILTER = Array.from({ length: 10 }, (_, i) => 2017 + i);

const TYPE_ICONS: Record<string, string> = {
  "Policy brief": "M4 3h9l3 3v11H4V3Zm3 6h6M7 12.5h6",
  Dataset: "M3 3h5v5H3V3Zm0 7h5v5H3v-5Zm7-7h5v5h-5V3Zm0 7h5v5h-5v-5Z",
  "Journal paper": "M5 2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm1 4h8M6 9h8M6 13h5",
  "Field study": "M2 16 8 8l3 3 5-7M2 16h14",
  "Government report": "M3 3h14v11l-3 3H3V3Zm3 5h8M6 11h5",
};

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-[var(--border)] bg-[var(--primary-soft)] py-1 pl-2.5 pr-1.5 text-xs font-medium text-[var(--primary)]">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="flex h-4 w-4 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
          <path d="m1.5 1.5 6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

function TypeGlyph({ type }: { type: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--primary-soft)] text-[var(--primary)]">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d={TYPE_ICONS[type] ?? TYPE_ICONS["Journal paper"]} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

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

  const hasFilters = !!(q || type || topic || state || year);

  return (
    <Page>
      {/* Hero band */}
      <section className="dark-section relative -mx-4 -mt-6 overflow-hidden px-4 pb-10 pt-12">
        <TopoLines className="opacity-50" />
        <div className="bs-grid-overlay-dark absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl">
          <p className="eyebrow-dark anim-up">Evidence intelligence repository</p>
          <h1 className="anim-up mt-3 font-serif text-3xl leading-tight text-[var(--dark-foreground)] sm:text-5xl" style={{ animationDelay: "100ms" }}>
            Research <span className="text-[var(--accent-bright)]">&</span> Evidence
          </h1>
          <p className="anim-up mt-3 max-w-2xl text-sm leading-6 text-[var(--dark-muted)] sm:text-base" style={{ animationDelay: "200ms" }}>
            Explore research, policy evidence and land-governance knowledge across twelve reporting states.
          </p>
        </div>
      </section>

      {/* Search + filters */}
      <section className="panel -mt-5 relative z-10 p-5 shadow-[var(--shadow-raised)]" aria-label="Search and filters">
        <label className="block" htmlFor="library-search">
          <span className="card-label mb-1.5 block">Search the repository</span>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              id="library-search"
              type="text"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              onKeyDown={(e) => {
                if (e.key === "Escape" && q) {
                  setQ("");
                  setPage(1);
                }
              }}
              placeholder="Search titles, summaries and evidence records"
              className="!py-2.5 !pl-9 !pr-10 !text-base"
            />
            {q ? (
              <button
                type="button"
                onClick={() => { setQ(""); setPage(1); }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center border border-transparent text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:bg-[var(--primary-soft)] hover:text-[var(--foreground)]"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="m3 3 6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            ) : null}
          </div>
          <span className="mt-1.5 block text-xs text-[var(--muted-foreground)]">
            Matches words in record titles and summaries. Press Escape to clear.
          </span>
        </label>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="card-label mb-1.5 block">Type</span>
            <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
              <option value="">All types</option>
              {(types ?? []).map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="card-label mb-1.5 block">Topic</span>
            <select value={topic} onChange={(e) => { setTopic(e.target.value); setPage(1); }}>
              <option value="">All topics</option>
              {(topics ?? []).map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="card-label mb-1.5 block">State</span>
            <select value={state} onChange={(e) => { setState(e.target.value); setPage(1); }}>
              <option value="">All states</option>
              {(states ?? []).map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="card-label mb-1.5 block">Year</span>
            <select value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }}>
              <option value="">All years</option>
              {YEARS_FILTER.map((y) => <option key={y}>{y}</option>)}
            </select>
          </label>
        </div>
        {hasFilters ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
            <span className="card-label">Active filters</span>
            {q ? <FilterChip label={`Search: ${q}`} onRemove={() => { setQ(""); setPage(1); }} /> : null}
            {type ? <FilterChip label={`Type: ${type}`} onRemove={() => { setType(""); setPage(1); }} /> : null}
            {topic ? <FilterChip label={`Topic: ${topic}`} onRemove={() => { setTopic(""); setPage(1); }} /> : null}
            {state ? <FilterChip label={`State: ${state}`} onRemove={() => { setState(""); setPage(1); }} /> : null}
            {year ? <FilterChip label={`Year: ${year}`} onRemove={() => { setYear(""); setPage(1); }} /> : null}
            <button
              type="button"
              className="ml-auto text-xs font-semibold text-[var(--accent)] underline-offset-2 transition-colors hover:text-[var(--accent-bright)] hover:underline"
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          </div>
        ) : null}
      </section>

      <SectionRule className="my-8" />

      {/* Results */}
      {query.isPending ? <LoadingRows label="Searching the repository..." rows={3} /> : null}
      {query.isError ? <ErrorBox message={(query.error as Error).message} onRetry={() => query.refetch()} /> : null}

      {query.data ? (
        query.data.total === 0 ? (
          <EmptyBox
            title="No matching records"
            message="No evidence in the repository matches your current search and filters."
            hint="Try a shorter search term, or remove one or more filters from the list above."
            action={
              <button type="button" className="btn-outline" onClick={clearFilters}>
                Reset search &amp; filters
              </button>
            }
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] pb-3">
              <p className="text-sm text-[var(--muted-foreground)]" aria-live="polite">
                <strong className="font-serif text-xl font-semibold tabular-nums text-[var(--primary)]">
                  {query.data.total.toLocaleString("en-IN")}
                </strong>
                <span className="ml-1.5">records found</span>
                {query.isFetching && !query.isPending ? (
                  <span className="ml-2 text-xs opacity-75">Updating...</span>
                ) : null}
              </p>
              <p className="text-xs tabular-nums text-[var(--muted-foreground)]">
                Page {query.data.page} of {query.data.totalPages}
              </p>
            </div>
            <ul
              className={`space-y-3 transition-opacity duration-200 ${query.isFetching ? "opacity-60" : "opacity-100"}`}
            >
              {query.data.items.map((item, i) => (
                <li key={item.id} style={{ animation: "bs-fade-up 560ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: `${i * 60}ms` }}>
                  <Link
                    to="/library/$id"
                    params={{ id: item.id }}
                    className="panel panel-hover group block p-5"
                  >
                    <div className="flex gap-4">
                      <TypeGlyph type={item.type} />
                      <div className="min-w-0 flex-1">
                        <h2 className="font-serif text-lg leading-snug text-[var(--primary)] transition-colors group-hover:text-[var(--primary-bright)]">
                          {item.title}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                          <span className="chip">{item.type}</span>
                          {item.topic ? <span>{item.topic}</span> : null}
                          {item.state ? <span aria-hidden="true">·</span> : null}
                          {item.state ? <span>{item.state}</span> : null}
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{item.year}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">Ref {item.id.slice(0, 8)}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.summary}</p>
                      </div>
                      <svg
                        className="mt-1 hidden shrink-0 text-[var(--primary)] opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 sm:block"
                        width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"
                      >
                        <path d="M3 9h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <nav className="mt-8 flex items-center justify-between gap-3" aria-label="Pagination">
              <button type="button" className="btn-outline" disabled={query.data.page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Previous
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
                Next →
              </button>
            </nav>
          </>
        )
      ) : null}
    </Page>
  );
}
