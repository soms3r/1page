"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadSearchIndex, searchWorkflows } from "@/lib/search";
import type { WorkflowMeta } from "@/lib/workflows";
import { trackPageView } from "@/lib/analytics";

type Stats = {
  total: number;
  categories: number;
  tags: number;
  models: number;
};

function computeRelated(w: WorkflowMeta[], slug: string): WorkflowMeta[] {
  const current = w.find((x) => x.slug === slug);
  if (!current) return [];
  return w
    .filter((x) => x.slug !== slug && x.category === current.category)
    .slice(0, 3);
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ total: 0, categories: 0, tags: 0, models: 0 });
  const [featured, setFeatured] = useState<WorkflowMeta[]>([]);
  const [latest, setLatest] = useState<WorkflowMeta[]>([]);
  const [trending, setTrending] = useState<WorkflowMeta[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WorkflowMeta[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    trackPageView();
    async function init() {
      await loadSearchIndex();
      try {
        const [indexRes, catsRes, statsRes] = await Promise.all([
          fetch("/workflows-index.json"),
          fetch("/categories.json"),
          fetch("/stats.json"),
        ]);
        const index: WorkflowMeta[] = await indexRes.json();
        const cats: string[] = await catsRes.json();
        const st: Stats = await statsRes.json();

        setStats(st);
        setCategories(cats);
        setFeatured(index.filter((w) => w.featured));
        setLatest(
          [...index]
            .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
            .slice(0, 5)
        );
        const ranked = [...index]
          .sort((a, b) => {
            if (a.featured !== b.featured) return a.featured ? -1 : 1;
            return (b.refCount || 0) - (a.refCount || 0);
          })
          .slice(0, 5);
        setTrending(ranked);
        setLoaded(true);
      } catch {
        // not built yet
      }
    }
    init();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const results = searchWorkflows(searchQuery.trim());
      setSearchResults(results);
    }
  };

  const dirCategories = [
    "marketing", "design", "development", "research",
    "business", "education", "writing", "productivity",
  ];

  return (
    <div className="space-y-12">

      {/* Hero */}
      <section className="text-center space-y-6 py-8">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          <span className="text-[var(--accent)]">1</span>{" "}
          <span className="text-[var(--foreground)]">Page</span>
        </h1>
        <p className="text-xl text-[var(--muted)]">AI is Easy</p>
        <p className="text-sm text-[var(--muted)] max-w-lg mx-auto">
          Discover, copy and run AI workflows.
        </p>
        {loaded && (
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--muted)]">
            <span className="text-[var(--accent)]">{stats.total.toLocaleString()}+</span> workflows
            <span className="text-[var(--accent)]">{stats.categories}</span> categories
            <span>Community maintained</span>
            <span>Open source</span>
          </div>
        )}
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              placeholder="Search workflows..."
              className="w-full pl-4 pr-10 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm focus:border-[var(--accent)]"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </form>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {["marketing", "chatgpt", "claude", "automation", "writing", "coding"].map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}`}
                className="text-xs text-[var(--muted)] hover:text-[var(--accent)] px-2 py-1 border border-[var(--border)] rounded hover:border-[var(--accent)]"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Search Results */}
      {showSearch && searchResults.length > 0 && (
        <section className="space-y-2 border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted)]">{searchResults.length} results</span>
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}
              className="text-xs text-[var(--muted)] bg-transparent border border-[var(--border)] px-2 py-1 rounded"
            >
              Close
            </button>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {searchResults.slice(0, 10).map((w) => (
              <Link
                key={w.slug}
                href={`/workflows/${w.slug}`}
                className="flex items-center gap-3 py-2 px-2 hover:bg-[var(--hover)] rounded group"
              >
                <span className="text-[var(--muted)] text-xs">file:</span>
                <span className="text-[var(--accent)] text-sm">{w.slug}.md</span>
                <span className="text-[var(--muted)] text-xs hidden sm:block truncate flex-1">{w.description}</span>
                <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">{w.category}</span>
              </Link>
            ))}
          </div>
          {searchResults.length > 10 && (
            <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} className="block text-xs text-[var(--accent)] text-center pt-2">
              View all {searchResults.length} results →
            </Link>
          )}
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)] font-medium tracking-wide uppercase">Trending</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {trending.map((w) => (
              <WorkflowCard key={w.slug} workflow={w} />
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)] font-medium tracking-wide uppercase">Featured</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {featured.map((w) => (
              <WorkflowCard key={w.slug} workflow={w} />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      {latest.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted)] font-medium tracking-wide uppercase">Latest</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="space-y-1">
            {latest.map((w) => (
              <Link
                key={w.slug}
                href={`/workflows/${w.slug}`}
                className="flex items-center gap-3 py-1.5 px-2 hover:bg-[var(--hover)] rounded group"
              >
                <span className="text-[var(--muted)] text-xs">file:</span>
                <span className="text-[var(--accent)] text-sm">{w.slug}.md</span>
                <span className="text-[var(--muted)] text-xs truncate flex-1">{w.description}</span>
                <span className="text-[10px] text-[var(--muted)]">{w.updated}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Browse Directories */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted)] font-medium tracking-wide uppercase">Browse Directories</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {dirCategories.map((cat) => (
            <Link
              key={cat}
              href={`/category/${cat}`}
              className="flex items-center gap-2 px-3 py-2.5 border border-[var(--border)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--hover)] text-sm"
            >
              <span className="text-[var(--muted)]">/</span>
              <span>{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      {loaded && (
        <section className="border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)]">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-[var(--accent)]">{stats.total}</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Workflows</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--accent)]">{stats.categories}</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Categories</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--accent)]">{stats.tags}</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Tags</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--accent)]">{stats.models}</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Models</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: WorkflowMeta }) {
  const daysAgo = Math.floor(
    (Date.now() - new Date(workflow.updated).getTime()) / (1000 * 60 * 60 * 24)
  );
  return (
    <Link
      href={`/workflows/${workflow.slug}`}
      className="block border border-[var(--border)] rounded-lg p-3 hover:border-[var(--accent)] hover:bg-[var(--hover)] group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] text-xs">file:</span>
            <span className="text-[var(--accent)] text-sm font-medium truncate">{workflow.slug}.md</span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{workflow.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--muted)]">
              {workflow.category}
            </span>
            {workflow.models.best && (
              <span className="text-[10px] text-[var(--muted)]">{workflow.models.best}</span>
            )}
            <span className="text-[10px] text-[var(--muted)]">{daysAgo > 0 ? `${daysAgo}d ago` : "today"}</span>
          </div>
        </div>
      </div>
      {workflow.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {workflow.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] text-[var(--muted)]">#{tag}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
