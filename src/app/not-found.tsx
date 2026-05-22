"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadSearchIndex, searchWorkflows } from "@/lib/search";
import type { WorkflowMeta } from "@/lib/workflows";

export default function NotFound() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WorkflowMeta[]>([]);
  const [trending, setTrending] = useState<WorkflowMeta[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [suggested, setSuggested] = useState<WorkflowMeta[]>([]);
  const [issuesUrl, setIssuesUrl] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    async function init() {
      await loadSearchIndex();
      try {
        const [indexRes, catRes, settingsRes] = await Promise.all([
          fetch("/workflows-index.json"),
          fetch("/categories.json"),
          fetch("/settings.json"),
        ]);
        const index: WorkflowMeta[] = await indexRes.json();
        const cats: string[] = await catRes.json();
        const settings = await settingsRes.json();

        setCategories(cats);
        setIssuesUrl(settings?.community?.issuesUrl || "https://github.com/soms3r/1page/issues/new");

        const ranked = [...index]
          .sort((a, b) => (b.refCount || 0) - (a.refCount || 0))
          .slice(0, 3);
        setTrending(ranked);

        const shuffled = [...index].sort(() => Math.random() - 0.5).slice(0, 6);
        setSuggested(shuffled);

        setLoaded(true);
      } catch { /* not built yet */ }
    }
    init();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setResults(searchWorkflows(query.trim()));
      setSearched(true);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3 py-8">
        <div className="text-6xl font-bold text-[var(--accent)]">404</div>
        <p className="text-sm text-[var(--muted)]">
          $ echo &quot;page not found&quot;
        </p>
        <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
          This route doesn&apos;t exist. But there&apos;s plenty to explore here.
        </p>
      </div>

      <form onSubmit={handleSearch} className="max-w-lg mx-auto">
        <div className="flex items-center border border-[var(--border)] rounded-lg px-3 py-2.5 bg-[var(--surface)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_1px_var(--accent)]">
          <span className="text-[var(--accent)] font-bold mr-2">$</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search workflows..."
            className="flex-1 bg-transparent border-0 outline-none text-sm p-0 focus:shadow-none"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </form>

      {searched && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">
              {results.length > 0 ? `Search Results (${results.length})` : "No results"}
            </span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          {results.length > 0 ? (
            <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg bg-[var(--surface)]">
              {results.slice(0, 5).map((w) => (
                <Link
                  key={w.slug}
                  href={`/workflows/${w.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--hover)]"
                >
                  <span className="text-[var(--muted)] text-xs">file:</span>
                  <span className="text-[var(--accent)] text-sm font-medium">{w.title}</span>
                  <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">{w.category}</span>
                  <span className="text-xs text-[var(--muted)] truncate flex-1 hidden sm:block">{w.description}</span>
                </Link>
              ))}
              {results.length > 5 && (
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="block px-4 py-2 text-xs text-[var(--accent)] hover:underline"
                >
                  view all {results.length} results &rarr;
                </Link>
              )}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)]">
              No workflows match &quot;{query}&quot;. Try different keywords or{" "}
              <a
                href={issuesUrl || "https://github.com/soms3r/1page/issues/new"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)]"
              >
                submit a request
              </a>.
            </p>
          )}
        </section>
      )}

      {loaded && trending.length > 0 && !searched && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">Trending</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {trending.map((w) => (
              <Link
                key={w.slug}
                href={`/workflows/${w.slug}`}
                className="block border border-[var(--border)] rounded-lg p-3 hover:border-[var(--accent)] hover:bg-[var(--hover)] group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[var(--accent)] text-xs font-bold">&gt;</span>
                  <span className="text-[var(--accent)] text-sm font-medium truncate">{w.slug}.md</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{w.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--muted)]">{w.category}</span>
                  <span className="text-[10px] text-[var(--muted)]">{w.models.best}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {loaded && categories.length > 0 && !searched && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">Categories</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat}`}
                className="text-xs border border-[var(--border)] text-[var(--muted)] px-3 py-1.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      {loaded && suggested.length > 0 && !searched && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">You might like</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {suggested.map((w) => (
              <Link
                key={w.slug}
                href={`/workflows/${w.slug}`}
                className="block border border-[var(--border)] rounded-lg p-3 hover:border-[var(--accent)] hover:bg-[var(--hover)]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[var(--accent)] text-xs font-bold">*</span>
                  <span className="text-[var(--accent)] text-sm font-medium truncate">{w.slug}.md</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{w.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--muted)]">{w.category}</span>
                  {w.models.best && <span className="text-[10px] text-[var(--muted)]">{w.models.best}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loaded && (
        <div className="text-xs text-[var(--muted)] text-center animate-pulse">Loading...</div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[var(--border)]">
        <Link
          href="/"
          className="text-xs border border-[var(--accent)] text-[var(--accent)] px-4 py-2 rounded hover:bg-[var(--accent)] hover:text-black no-underline"
        >
          ~ go home
        </Link>
        <Link
          href={loaded && categories.length > 0 ? `/category/${categories[0]}` : "/featured"}
          className="text-xs border border-[var(--border)] text-[var(--muted)] px-4 py-2 rounded hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          / browse categories
        </Link>
        <Link
          href="/submit"
          className="text-xs border border-[var(--border)] text-[var(--muted)] px-4 py-2 rounded hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          + submit workflow
        </Link>
      </div>
    </div>
  );
}
