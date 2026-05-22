"use client";

import Fuse from "fuse.js";
import type { WorkflowMeta } from "./workflows";

export type SearchFilters = {
  query?: string;
  category?: string;
  model?: string;
  tags?: string[];
};

let fuseInstance: Fuse<WorkflowMeta> | null = null;
let searchIndex: WorkflowMeta[] = [];
let loadAttempted = false;
let loadPromise: Promise<void> | null = null;

export function isReady(): boolean {
  return loadAttempted && !!fuseInstance;
}

export async function loadSearchIndex(): Promise<void> {
  if (loadAttempted) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const res = await fetch("/search-index.json");
    if (!res.ok) {
      throw new Error(`Search index fetch failed: ${res.status}`);
    }
    searchIndex = await res.json();
    fuseInstance = new Fuse(searchIndex, {
      keys: [
        { name: "title", weight: 2 },
        { name: "description", weight: 1 },
        { name: "category", weight: 1.5 },
        { name: "tags", weight: 1.5 },
        { name: "models.best", weight: 1 },
        { name: "models.good", weight: 0.5 },
        { name: "models.limited", weight: 0.5 },
      ],
      threshold: 0.3,
      distance: 200,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });
  })();

  try {
    await loadPromise;
  } catch {
    searchIndex = [];
    fuseInstance = null;
  } finally {
    loadAttempted = true;
    loadPromise = null;
  }
}

function filterByMeta(items: WorkflowMeta[], filters: SearchFilters): WorkflowMeta[] {
  let filtered = items;

  if (filters.category) {
    filtered = filtered.filter((w) => w.category === filters.category);
  }

  if (filters.model) {
    const m = filters.model.toLowerCase();
    filtered = filtered.filter(
      (w) =>
        w.models.best.toLowerCase() === m ||
        w.models.good.some((g) => g.toLowerCase() === m) ||
        w.models.limited.some((l) => l.toLowerCase() === m)
    );
  }

  if (filters.tags && filters.tags.length > 0) {
    const qTags = filters.tags.map((t) => t.toLowerCase());
    filtered = filtered.filter((w) =>
      qTags.some((qt) => w.tags.some((t) => t.toLowerCase().includes(qt)))
    );
  }

  return filtered;
}

export function searchWorkflows(query: string, filters?: SearchFilters): WorkflowMeta[] {
  if (!fuseInstance || !query.trim()) return [];

  const fuseResults = fuseInstance.search(query);
  let items = fuseResults.slice(0, 50).map((r) => r.item);

  if (filters) {
    items = filterByMeta(items, filters);
  }

  return items;
}

export function searchAll(filters?: SearchFilters): WorkflowMeta[] {
  let items = searchIndex;

  if (filters?.query) {
    return searchWorkflows(filters.query, filters);
  }

  if (filters) {
    items = filterByMeta(items, filters);
  }

  return items.slice(0, 100);
}

export function getSearchIndex(): WorkflowMeta[] {
  return searchIndex;
}

export function getCategories(): string[] {
  return [...new Set(searchIndex.map((w) => w.category))].sort();
}

export function getAllModels(): string[] {
  return [
    ...new Set(
      searchIndex.flatMap((w) => [w.models.best, ...w.models.good, ...w.models.limited])
    ),
  ].sort();
}
