"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loadSearchIndex, searchWorkflows, getAllModels, getCategories, getSearchIndex } from "@/lib/search";
import type { WorkflowMeta } from "@/lib/workflows";
import type { SearchFilters } from "@/lib/search";
import { trackPageView } from "@/lib/analytics";

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<WorkflowMeta[]>([]);
  const [all, setAll] = useState<WorkflowMeta[]>([]);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [model, setModel] = useState("");
  const [loaded, setLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = (q: string, cat: string, m?: string) => {
    const filters: SearchFilters = {};
    if (cat) filters.category = cat;
    if (m) filters.model = m;

    if (q.trim()) {
      setResults(searchWorkflows(q, filters));
    } else {
      let items = all;
      if (cat) items = items.filter((w) => w.category === cat);
      if (m) {
        const ml = m.toLowerCase();
        items = items.filter(
          (w) =>
            w.models.best.toLowerCase() === ml ||
            w.models.good.some((g) => g.toLowerCase() === ml) ||
            w.models.limited.some((l) => l.toLowerCase() === ml)
        );
      }
      setResults(items);
    }
  };

  useEffect(() => {
    trackPageView("/search");
    loadSearchIndex().then(() => {
      const index = getSearchIndex();
      setAll(index);
      setLoaded(true);
      runSearch(query, category);
    });
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const filters: SearchFilters = {};
      if (category) filters.category = category;
      if (model) filters.model = model;

      if (value.trim()) {
        setResults(searchWorkflows(value, filters));
      } else {
        let items = all;
        if (category) items = items.filter((w) => w.category === category);
        if (model) {
          const ml = model.toLowerCase();
          items = items.filter(
            (w) =>
              w.models.best.toLowerCase() === ml ||
              w.models.good.some((g) => g.toLowerCase() === ml) ||
              w.models.limited.some((l) => l.toLowerCase() === ml)
          );
        }
        setResults(items);
      }

      const params = new URLSearchParams();
      if (value) params.set("q", value);
      if (category) params.set("category", category);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    }, 150);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    runSearch(query, cat, model);
  };

  const handleModelChange = (m: string) => {
    setModel(m);
    runSearch(query, category, m);
  };

  const allModels = loaded ? getAllModels() : [];
  const categories = loaded ? getCategories() : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">/</Link>
        <span className="text-[var(--accent)]">search</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--accent)]">search</h1>
        <p className="text-xs text-[var(--muted)] mt-1">Find AI workflows by keyword, category, or model</p>
      </div>

      <div className="flex gap-2 items-center border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)]">
        <span className="text-[var(--accent)] font-bold text-sm">$</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Search workflows..."
          className="flex-1 bg-transparent border-0 outline-none text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div className="flex gap-4 text-xs">
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="flex-1 rounded-lg"
        >
          <option value="">all categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="flex-1 rounded-lg"
        >
          <option value="">all models</option>
          {allModels.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {results.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-[var(--muted)]">
            {query ? `Results for "${query}"` : "All workflows"}
            <span className="ml-1">({results.length})</span>
          </div>
          {results.slice(0, 50).map((w) => (
            <Link
              key={w.slug}
              href={`/workflows/${w.slug}`}
              prefetch={false}
              className="flex items-center gap-3 py-2 px-3 hover:bg-[var(--hover)] rounded-lg border-b border-[var(--border)] last:border-0"
            >
              <span className="text-[var(--muted)] text-xs">file:</span>
              <span className="text-[var(--accent)] text-sm font-medium">{w.title}</span>
              <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">[{w.category}]</span>
              <span className="text-xs text-[var(--muted)] hidden sm:block truncate flex-1">{w.description}</span>
            </Link>
          ))}
          {results.length > 50 && (
            <div className="text-xs text-[var(--muted)] pl-4">... and {results.length - 50} more</div>
          )}
        </div>
      )}

      {results.length === 0 && loaded && (
        <div className="text-xs text-[var(--muted)]">
          {query || category
            ? `No results for "${query}${category ? ` in ${category}` : ""}".`
            : `Browse ${categories.length} categories or start typing.`}
        </div>
      )}

      {!loaded && (
        <div className="text-xs text-[var(--muted)] animate-pulse">Loading search index...</div>
      )}
    </div>
  );
}
