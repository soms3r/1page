"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { trackPageView } from "@/lib/analytics";
import type { WorkflowMeta } from "@/lib/workflows";
import { loadSearchIndex, searchWorkflows } from "@/lib/search";

const BOOT_LINES = [
  "> 1 Page Terminal v0.1.0",
  "> AI is Easy.",
  "> Loading workflow index...",
  "> System ready. Type 'help' for commands.",
  "",
];

export default function HomePage() {
  const [booted, setBooted] = useState(false);
  const [input, setInput] = useState("");
  const [results, setResults] = useState<WorkflowMeta[]>([]);
  const [featured, setFeatured] = useState<WorkflowMeta[]>([]);
  const [latest, setLatest] = useState<WorkflowMeta[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, categories: 0 });
  const [mode, setMode] = useState<"home" | "search" | "category">("home");
  const [selectedCategory, setSelectedCategory] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const init = useCallback(async () => {
    await loadSearchIndex();
    try {
      const [indexRes, catRes] = await Promise.all([
        fetch("/content/index.json"),
        fetch("/content/categories.json"),
      ]);
      const index: WorkflowMeta[] = await indexRes.json();
      const cats: string[] = await catRes.json();
      setFeatured(index.filter((w) => w.featured));
      setLatest(
        [...index]
          .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
          .slice(0, 5)
      );
      setCategories(cats);
      setStats({ total: index.length, categories: cats.length });
    } catch {
      // not built yet
    }
  }, []);

  useEffect(() => {
    trackPageView();
    const t = setTimeout(() => {
      setBooted(true);
      init();
    }, 800);
    return () => clearTimeout(t);
  }, [init]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!booted) return;
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setInput("");
        setResults([]);
        setMode("home");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [booted]);

  useEffect(() => {
    if (!booted) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const cmd = input.trim();
      if (!cmd) {
        if (mode !== "home") {
          setMode("home");
          setResults([]);
        }
        return;
      }
      const found = searchWorkflows(cmd);
      setResults(found);
      setMode(found.length > 0 || cmd.length >= 2 ? "search" : "home");
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, booted, mode]);

  const handleCommand = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const cmd = input.trim().toLowerCase();

      if (cmd === "help") {
        setResults([]);
        setMode("home");
        setInput("");
        return;
      }

      if (cmd === "clear") {
        setInput("");
        setResults([]);
        setMode("home");
        return;
      }

      if (cmd === "featured" || cmd === "top") {
        setResults(featured);
        setMode("search");
        setInput("");
        return;
      }

      if (cmd === "categories" || cmd === "cat") {
        setMode("category");
        setResults([]);
        setInput("");
        return;
      }

      if (cmd.startsWith("open ")) {
        const slug = cmd.slice(5).trim();
        if (slug) {
          window.location.href = `/workflows/${slug}`;
        }
        return;
      }

      if (cmd.startsWith("cat ") && !cmd.startsWith("cat")) {
        const cat = cmd.slice(4).trim();
        if (categories.includes(cat)) {
          setSelectedCategory(cat);
          setMode("category");
          setResults([]);
          setInput("");
          return;
        }
      }
    },
    [input, featured, categories]
  );

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setMode("category");
  };

  const hasActiveSearch = mode === "search" && results.length > 0;

  if (!booted) {
    return (
      <div className="space-y-1">
        {BOOT_LINES.map((line, i) => (
          <div key={i} className="text-[var(--accent)]">{line}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-[var(--muted)]">
        <span className="text-[var(--accent)] font-bold">1 Page</span> — AI is Easy
        <span className="ml-2">| {stats.total} workflows · {stats.categories} categories</span>
      </div>

      <form onSubmit={handleCommand} className="flex gap-2 items-center">
        <span className="text-[var(--accent)] font-bold">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="type to search workflows..."
          className="flex-1 bg-transparent border-0 border-b border-[var(--border)] focus:border-[var(--accent)] outline-none px-2 py-1 text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </form>

      <div className="text-xs text-[var(--muted)] space-x-4">
        <span>type to search</span>
        <span>open &lt;slug&gt;</span>
        <span>featured</span>
        <span>categories</span>
        <span>clear</span>
        <span className="text-[var(--border)]">[ / to focus · Esc to clear ]</span>
      </div>

      {hasActiveSearch && (
        <div className="space-y-1">
          <div className="text-[var(--muted)] text-xs">
            {results.length} result(s) for &quot;{input}&quot;
          </div>
          {results.slice(0, 20).map((w) => (
            <Link
              key={w.slug}
              href={`/workflows/${w.slug}`}
              prefetch={false}
              className="block pl-4 py-0.5 text-[var(--accent)] hover:underline"
            >
              &gt; {w.slug} <span className="text-[var(--muted)]">— {w.description}</span>
            </Link>
          ))}
          {results.length > 20 && (
            <div className="pl-4 text-xs text-[var(--muted)]">... and {results.length - 20} more</div>
          )}
          <Link
            href={`/search?q=${encodeURIComponent(input)}`}
            className="block pl-4 text-xs text-[var(--accent)] hover:underline mt-1"
          >
            Advanced search →
          </Link>
        </div>
      )}

      {mode === "search" && results.length === 0 && input.trim().length >= 2 && (
        <div className="text-[var(--muted)] text-xs">No results for &quot;{input}&quot;.</div>
      )}

      {mode === "category" && (
        <div className="space-y-2">
          <div className="text-xs text-[var(--muted)]">
            {selectedCategory ? `Category: ${selectedCategory}` : "All Categories"}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`text-left px-3 py-2 border text-sm ${
                  selectedCategory === cat
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--foreground)]"
                } bg-transparent`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "home" && !input.trim() && featured.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-[var(--muted)]">Featured Workflows:</div>
          {featured.map((w) => (
            <Link
              key={w.slug}
              href={`/workflows/${w.slug}`}
              prefetch={false}
              className="block pl-4 py-0.5 text-[var(--accent)] hover:underline"
            >
              &gt; {w.slug} <span className="text-[var(--muted)]">— {w.description}</span>
            </Link>
          ))}
        </div>
      )}

      {mode === "home" && !input.trim() && latest.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-[var(--muted)]">Latest Workflows:</div>
          {latest.map((w) => (
            <Link
              key={w.slug}
              href={`/workflows/${w.slug}`}
              prefetch={false}
              className="block pl-4 py-0.5 text-[var(--foreground)] hover:text-[var(--accent)]"
            >
              &gt; {w.title} <span className="text-[var(--muted)]">— {w.updated}</span>
            </Link>
          ))}
        </div>
      )}

      {mode === "home" && !input.trim() && categories.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-[var(--muted)]">Categories:</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/search?category=${cat}`}
                className="block px-3 py-2 border border-[var(--border)] text-sm hover:border-[var(--accent)]"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}

      {mode === "home" && !input.trim() && (
        <div className="flex gap-4 text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)]">
          <Link href="/search" className="text-[var(--accent)]">Advanced Search →</Link>
          <Link href="/generate" prefetch={false} className="text-[var(--accent)]">Generate with AI →</Link>
          <Link href="/submit" className="text-[var(--accent)]">Submit Workflow →</Link>
        </div>
      )}
    </div>
  );
}
