import fs from "fs";
import path from "path";
import type { WorkflowMeta } from "./workflows";

const INDEX_PATH = path.join(process.cwd(), "public", "workflows-index.json");
const SEO_INDEX_PATH = path.join(process.cwd(), "content", "seo-index.json");
const EXPANDED_DIR = path.join(process.cwd(), "content", "expanded");

let cached: WorkflowMeta[] | null = null;
let seoCached: SEOEntry[] | null = null;

export type SEOEntry = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  relatedQueries: string[];
  suggestions: {
    categories: string[];
    tagCombinations: string[];
  };
};

export type ExpandedContent = {
  slug: string;
  howToUse: string[];
  bestUseCases: string[];
  examples: string[];
  variations: string[];
  commonMistakes: string[];
};

export function loadWorkflowIndex(): WorkflowMeta[] {
  if (cached) return cached;
  if (!fs.existsSync(INDEX_PATH)) return [];
  cached = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8")) as WorkflowMeta[];
  return cached;
}

export function loadSEOIndex(): SEOEntry[] {
  if (seoCached) return seoCached;
  if (!fs.existsSync(SEO_INDEX_PATH)) return [];
  seoCached = JSON.parse(fs.readFileSync(SEO_INDEX_PATH, "utf-8")) as SEOEntry[];
  return seoCached;
}

export function loadExpandedContent(slug: string): ExpandedContent | null {
  const p = path.join(EXPANDED_DIR, `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8")) as ExpandedContent;
}

export function keywordToSlug(kw: string): string {
  return kw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function loadCategories(): string[] {
  const index = loadWorkflowIndex();
  return [...new Set(index.map((w) => w.category))].sort();
}

export function loadTags(): string[] {
  const index = loadWorkflowIndex();
  return [...new Set(index.flatMap((w) => w.tags))].sort();
}

export function loadModels(): string[] {
  const index = loadWorkflowIndex();
  const models = new Set<string>();
  for (const w of index) {
    if (w.models.best) models.add(w.models.best);
    for (const g of w.models.good) models.add(g);
    for (const l of w.models.limited) models.add(l);
  }
  return [...models].sort();
}
