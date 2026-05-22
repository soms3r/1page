"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loadSearchIndex, searchWorkflows, getAllModels, getCategories, getSearchIndex } from "@/lib/search";
import type { WorkflowMeta } from "@/lib/workflows";
import type { SearchFilters } from "@/lib/search";
import { classifyIntent } from "@/lib/search-intent";
import type { SearchIntent } from "@/lib/search-intent";

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
  const [issuesUrl, setIssuesUrl] = useState("https://github.com/soms3r/1page/issues/new");
  const [intentLabel, setIntentLabel] = useState<SearchIntent>("prompt");
  const [intentConfidence, setIntentConfidence] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = (q: string, cat: string, m?: string) => {
    const filters: SearchFilters = {};
    if (cat) filters.category = cat;
    if (m) filters.model = m;
    if (q.trim()) {
      const { intent, confidence } = classifyIntent(q);
      setIntentLabel(intent);
      setIntentConfidence(confidence);
      setResults(searchWorkflows(q, filters));
    } else {
      setIntentLabel("prompt");
      setIntentConfidence(0);
      let items = all;
      if (cat) items = items.filter((w) => w.category === cat);
      if (m) {
        const ml = m.toLowerCase();
        items = items.filter((w) => w.models.best.toLowerCase() === ml || w.models.good.some((g) => g.toLowerCase() === ml) || w.models.limited.some((l) => l.toLowerCase() === ml));
      }
      setResults(items);
    }
  };

  useEffect(() => {
    loadSearchIndex().then(() => {
      const index = getSearchIndex();
      setAll(index);
      setLoaded(true);
      runSearch(query, category);
    });
    fetch("/settings.json")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.community?.issuesUrl) setIssuesUrl(data.community.issuesUrl); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const filters: SearchFilters = {};
      if (category) filters.category = category;
      if (model) filters.model = model;
      if (value.trim()) {
        const { intent, confidence } = classifyIntent(value);
        setIntentLabel(intent);
        setIntentConfidence(confidence);
        setResults(searchWorkflows(value, filters));
      } else {
        setIntentLabel("prompt");
        setIntentConfidence(0);
        let items = all;
        if (category) items = items.filter((w) => w.category === category);
        if (model) {
          const ml = model.toLowerCase();
          items = items.filter((w) => w.models.best.toLowerCase() === ml || w.models.good.some((g) => g.toLowerCase() === ml) || w.models.limited.some((l) => l.toLowerCase() === ml));
        }
        setResults(items);
      }
      const params = new URLSearchParams();
      if (value) params.set("q", value);
      if (category) params.set("category", category);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    }, 150);
  };

  const handleCategoryChange = (cat: string) => { setCategory(cat); runSearch(query, cat, model); };
  const handleModelChange = (m: string) => { setModel(m); runSearch(query, category, m); };

  const sortedResults = useMemo(() => {
    if (!loaded || results.length === 0) return results;
    if (intentLabel === "tool") {
      const withEasy = results.filter((w) => w.hasEasyMode);
      const withoutEasy = results.filter((w) => !w.hasEasyMode);
      return [...withEasy, ...withoutEasy];
    }
    return results;
  }, [results, intentLabel, loaded]);

  const bestMatch = sortedResults[0] || null;
  const restResults = sortedResults.slice(1);

  const allModels = loaded ? getAllModels() : [];
  const categories = loaded ? getCategories() : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">~</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--accent)]">search</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--accent)]">search</h1>
        <p className="text-xs text-[var(--muted)] mt-1">Find AI workflows by keyword, category, or model</p>
      </div>

      <div className="flex gap-2 items-center border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_1px_var(--accent)]">
        <span className="text-[var(--accent)] font-bold text-sm">$</span>
        <input ref={inputRef} type="text" value={query} onChange={(e) => handleInput(e.target.value)}
          placeholder="search workflows..." className="flex-1 bg-transparent border-0 outline-none text-sm p-0 focus:shadow-none"
          spellCheck={false} autoComplete="off" />
      </div>

      <div className="flex gap-4 text-xs">
        <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="flex-1 rounded-lg">
          <option value="">all categories</option>
          {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <select value={model} onChange={(e) => handleModelChange(e.target.value)} className="flex-1 rounded-lg">
          <option value="">all models</option>
          {allModels.map((m) => (<option key={m} value={m}>{m}</option>))}
        </select>
      </div>

      {query && (
        <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
          <span className="uppercase tracking-wider">Intent</span>
          <span className={`px-2 py-0.5 rounded font-medium ${
            intentLabel === "tool" ? "bg-purple-900/50 text-purple-300 border border-purple-700" :
            intentLabel === "workflow" ? "bg-blue-900/50 text-blue-300 border border-blue-700" :
            "bg-green-900/50 text-green-300 border border-green-700"
          }`}>
            {intentLabel}
          </span>
          {intentConfidence > 0 && (
            <span className="text-[10px] text-[var(--muted)]">
              {(intentConfidence * 100).toFixed(0)}% confident
            </span>
          )}
        </div>
      )}

      {sortedResults.length > 0 && bestMatch && (
        <div className="border border-[var(--accent)] rounded-lg bg-[var(--surface)] overflow-hidden">
          <div className="px-4 py-1.5 text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider bg-[var(--accent)]/10 border-b border-[var(--accent)]/30">
            Best Match &middot; {intentLabel}
          </div>
          <Link key={bestMatch.slug} href={`/workflows/${bestMatch.slug}`} prefetch={false}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--hover)]">
            <span className="text-[var(--accent)] text-xs font-bold">&gt;</span>
            <span className="text-[var(--accent)] text-sm font-medium">{bestMatch.title}</span>
            <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">{bestMatch.category}</span>
            {bestMatch.hasEasyMode && <span className="text-[10px] text-purple-400 border border-purple-700 px-1.5 py-0.5 rounded">tool</span>}
            <span className="text-xs text-[var(--muted)] hidden sm:block truncate flex-1">{bestMatch.description}</span>
          </Link>
        </div>
      )}

      {restResults.length > 0 && (
        <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <div className="px-4 py-2 text-xs text-[var(--muted)] border-b border-[var(--border)] flex items-center justify-between">
            <span>{query ? `related content for "${query}"` : "all workflows"} ({results.length})</span>
            <span className="text-[10px] text-[var(--muted)] capitalize">{intentLabel}-optimized</span>
          </div>
          {restResults.slice(0, 49).map((w) => (
            <Link key={w.slug} href={`/workflows/${w.slug}`} prefetch={false}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--hover)]">
              <span className="text-[var(--muted)] text-xs">file:</span>
              <span className="text-[var(--accent)] text-sm font-medium">{w.title}</span>
              <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">{w.category}</span>
              {w.hasEasyMode && <span className="text-[10px] text-purple-400 border border-purple-700 px-1.5 py-0.5 rounded">tool</span>}
              <span className="text-xs text-[var(--muted)] hidden sm:block truncate flex-1">{w.description}</span>
            </Link>
          ))}
          {results.length > 50 && (<div className="px-4 py-2 text-xs text-[var(--muted)]">... and {results.length - 50} more</div>)}
        </div>
      )}

      {results.length === 0 && loaded && (
        <div className="text-xs text-[var(--muted)] space-y-2">
          {query || category ? (
            <>
              <p>No results for &quot;{query}{category ? ` in ${category}` : ""}&quot;.</p>
              <p><a href={issuesUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">submit a workflow</a></p>
            </>
          ) : (
            <>
              <p>Browse {categories.length} categories or start typing.</p>
              <p><a href={issuesUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">submit a workflow request</a></p>
            </>
          )}
        </div>
      )}

      {!loaded && (<div className="text-xs text-[var(--muted)] animate-pulse">Loading search index...</div>)}
    </div>
  );
}
