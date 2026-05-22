"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { loadSearchIndex, searchWorkflows } from "@/lib/search";
import type { WorkflowMeta } from "@/lib/workflows";
import type { HomepageSettings, CommunitySettings, FeatureFlags } from "@/lib/settings";
import Background from "@/components/background";

type Stats = { total: number; categories: number; tags: number; models: number };

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ total: 0, categories: 0, tags: 0, models: 0 });
  const [featured, setFeatured] = useState<WorkflowMeta[]>([]);
  const [latest, setLatest] = useState<WorkflowMeta[]>([]);
  const [trending, setTrending] = useState<WorkflowMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WorkflowMeta[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hp, setHp] = useState<HomepageSettings | null>(null);
  const [community, setCommunity] = useState<CommunitySettings | null>(null);
  const [features, setFeatures] = useState<FeatureFlags | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [starterPacks, setStarterPacks] = useState<Record<string, { id: string; title: string; difficulty: string; remixable: boolean }[]> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      await loadSearchIndex();
      try {
        const [indexRes, statsRes, settingsRes, packsRes] = await Promise.all([
          fetch("/workflows-index.json"),
          fetch("/stats.json"),
          fetch("/settings.json"),
          fetch("/starter-packs.json").catch(() => null),
        ]);
        const index: WorkflowMeta[] = await indexRes.json();
        const st: Stats = await statsRes.json();
        const s = await settingsRes.json();
        if (packsRes?.ok) {
          const packs = await packsRes.json();
          setStarterPacks(packs);
        }
        setHp(s.homepage);
        setCommunity(s.community);
        setFeatures(s.features);
        setStats(st);
        const catMap: Record<string, number> = {};
        for (const w of index) { catMap[w.category] = (catMap[w.category] || 0) + 1; }
        setCategories(Object.keys(catMap).sort());
        setCategoryCounts(catMap);
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
      } catch { /* not built yet */ }
    }
    init();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchRef.current?.focus(), 50);
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

  const displayCats = categories.length > 0 ? categories : (hp?.directoryCategories || [
    "marketing", "design", "development", "research",
    "business", "education", "writing", "productivity",
  ]);

  return (
    <div className="space-y-10 relative">
      <Background />
      <section className="text-center space-y-5 py-10 hidden sm:block">
        <div className="text-xs text-[var(--muted)] tracking-widest uppercase">{hp?.heroTitle || "TLOGZ"}</div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          <span className="text-[var(--foreground)]">1 </span>
          <span className="text-[var(--accent)]">PAGE</span>
        </h1>
        <p className="text-base sm:text-lg text-[var(--muted)]">{hp?.heroTagline || "AI is Easy"}</p>
        <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
          {hp?.heroSubtitle || "Open-source AI workflow library. Search, copy, paste, run."}
        </p>

        {features?.statsDisplay !== false && loaded && (
          <div className="hidden sm:flex items-center justify-center gap-4 text-xs text-[var(--muted)]">
            <span className="text-[var(--accent)] font-bold">{stats.total}</span>
            <span className="text-[var(--muted)]">workflows</span>
            <span className="text-[var(--muted)]">·</span>
            <span className="text-[var(--accent)] font-bold">{stats.categories}</span>
            <span className="text-[var(--muted)]">categories</span>
            <span className="text-[var(--muted)]">·</span>
            <span className="text-[var(--accent)] font-bold">{stats.tags}</span>
            <span className="text-[var(--muted)]">tags</span>
            <span className="text-[var(--muted)]">·</span>
            <span className="text-[var(--accent)] font-bold">{stats.models}</span>
            <span className="text-[var(--muted)]">models</span>
          </div>
        )}

        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center border border-[var(--border)] rounded-lg px-3 py-2.5 bg-[var(--surface)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_1px_var(--accent)]">
              <span className="text-[var(--accent)] font-bold mr-2">$</span>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder={hp?.searchPlaceholder || "search workflows..."}
                className="flex-1 bg-transparent border-0 outline-none text-sm p-0 focus:shadow-none"
                spellCheck={false}
                autoComplete="off"
              />
              <kbd className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded ml-2">^K</kbd>
            </div>
          </form>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {(hp?.quickTags || ["marketing", "chatgpt", "claude", "automation", "writing", "coding"]).map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}`}
                className="text-xs text-[var(--muted)] hover:text-[var(--accent)] px-2 py-0.5 border border-[var(--border)] rounded hover:border-[var(--accent)]"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {showSearch && searchResults.length > 0 && (
        <section className="border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
            <span className="text-xs text-[var(--muted)]">{searchResults.length} results</span>
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }}
              className="text-xs text-[var(--muted)] bg-transparent border border-[var(--border)] px-2 py-0.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              close
            </button>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {searchResults.slice(0, 10).map((w) => (
              <Link
                key={w.slug}
                href={`/workflows/${w.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--hover)] group"
              >
                <span className="text-[var(--muted)] text-xs">file:</span>
                <span className="text-[var(--accent)] text-sm">{w.slug}.md</span>
                <span className="text-[var(--muted)] text-xs hidden sm:block truncate flex-1">{w.description}</span>
                <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">{w.category}</span>
              </Link>
            ))}
          </div>
          {searchResults.length > 10 && (
            <div className="px-4 py-2 border-t border-[var(--border)]">
              <Link
                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                className="text-xs text-[var(--accent)]"
              >
                view all {searchResults.length} results →
              </Link>
            </div>
          )}
        </section>
      )}

      {features?.trending !== false && trending.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">Trending</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {trending.map((w) => (
              <WorkflowCard key={w.slug} workflow={w} icon=">" />
            ))}
          </div>
        </section>
      )}

      {starterPacks && Object.keys(starterPacks).length > 0 && (
        <section className="sm:hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">Get Started</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="space-y-1">
            {Object.entries(starterPacks).map(([cat, packs]) =>
              packs.slice(0, 2).map((sp) => (
                <Link
                  key={sp.id}
                  href={`/workflows/${sp.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 border border-[var(--border)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--hover)]"
                >
                  <span className="text-[var(--accent)] text-xs font-bold">&gt;</span>
                  <span className="text-sm text-[var(--accent)] truncate">{sp.title}</span>
                  <span className="text-[10px] text-[var(--muted)] ml-auto border border-[var(--border)] px-1.5 py-0.5 rounded">{cat}</span>
                </Link>
              ))
            )}
          </div>
          <Link href="/new" className="block text-center text-xs text-[var(--muted)] mt-2 hover:text-[var(--accent)]">view all →</Link>
        </section>
      )}

      {features?.featured !== false && featured.length > 0 && (
        <section className="hidden sm:block">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">Featured</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {featured.map((w) => (
              <WorkflowCard key={w.slug} workflow={w} icon="*" />
            ))}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="hidden sm:block">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">Latest</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="border border-[var(--border)] rounded-lg divide-y divide-[var(--border)] bg-[var(--surface)]">
            {latest.map((w) => (
              <Link
                key={w.slug}
                href={`/workflows/${w.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--hover)]"
              >
                <span className="text-[var(--muted)] text-xs">file:</span>
                <span className="text-[var(--accent)] text-sm">{w.slug}.md</span>
                <span className="text-[var(--muted)] text-xs truncate flex-1 hidden sm:block">{w.description}</span>
                <span className="text-[10px] text-[var(--muted)]">{w.updated}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {loaded && (
        <section className="border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
          <Link
            href="/categories"
            className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] hover:bg-[var(--hover)]"
          >
            <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">Categories</span>
            <span className="text-[10px] text-[var(--accent)]">view all &rarr;</span>
          </Link>
          <div className="divide-y divide-[var(--border)]">
            {displayCats.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat}`}
                className="flex items-center justify-between px-4 py-2 hover:bg-[var(--hover)]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[var(--muted)] text-xs">/workflows/</span>
                  <span className="text-[var(--accent)] text-sm">{cat}</span>
                </div>
                <span className="text-xs text-[var(--muted)]">{categoryCounts[cat] || 0}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {features?.statsDisplay !== false && loaded && (
        <section className="hidden sm:block border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <div className="grid grid-cols-4 divide-x divide-[var(--border)]">
            <div className="py-3 text-center">
              <div className="text-lg font-bold text-[var(--accent)]">{stats.total}</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mt-0.5">Workflows</div>
            </div>
            <div className="py-3 text-center">
              <div className="text-lg font-bold text-[var(--accent)]">{stats.categories}</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mt-0.5">Categories</div>
            </div>
            <div className="py-3 text-center">
              <div className="text-lg font-bold text-[var(--accent)]">{stats.tags}</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mt-0.5">Tags</div>
            </div>
            <div className="py-3 text-center">
              <div className="text-lg font-bold text-[var(--accent)]">{stats.models}</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mt-0.5">Models</div>
            </div>
          </div>
        </section>
      )}

      {features?.communityCta !== false && (
        <section className="hidden sm:block border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)] text-center space-y-2">
          <p className="text-xs text-[var(--muted)]">$ echo &quot;contribute.sh&quot;</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href={community?.githubRepo || "https://github.com/soms3r/1page"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs border border-[var(--accent)] text-[var(--accent)] px-3 py-1.5 rounded hover:bg-[var(--accent)] hover:text-black no-underline"
            >
              star
            </a>
            <Link
              href="/submit"
              className="text-xs border border-[var(--border)] text-[var(--muted)] px-3 py-1.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              submit workflow
            </Link>
            <a
              href={community?.issuesUrl || "https://github.com/soms3r/1page/issues"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs border border-[var(--border)] text-[var(--muted)] px-3 py-1.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              report issue
            </a>
          </div>
        </section>
      )}

      {features?.telegramPromo && community?.telegramPromo?.enabled && community?.telegramPromo?.link && (
        <section className="hidden sm:block border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)] text-center space-y-2">
          <p className="text-xs text-[var(--muted)]">{community.telegramPromo.message}</p>
          <a href={community.telegramPromo.link} target="_blank" rel="noopener noreferrer"
            className="text-xs border border-[var(--accent)] text-[var(--accent)] px-3 py-1.5 rounded hover:bg-[var(--accent)] hover:text-black no-underline">
            {community.telegramPromo.linkText || "join"}
          </a>
        </section>
      )}
    </div>
  );
}

function WorkflowCard({ workflow, icon }: { workflow: WorkflowMeta; icon: string }) {
  return (
    <Link
      href={`/workflows/${workflow.slug}`}
      className="block border border-[var(--border)] rounded-lg p-3 hover:border-[var(--accent)] hover:bg-[var(--hover)] group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[var(--accent)] text-xs font-bold">{icon}</span>
            <span className="text-[var(--accent)] text-sm font-medium truncate">{workflow.slug}.md</span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2">{workflow.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--muted)]">{workflow.category}</span>
            {workflow.models.best && <span className="text-[10px] text-[var(--muted)]">{workflow.models.best}</span>}
            <span className="text-[10px] text-[var(--muted)]">{workflow.updated}</span>
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
