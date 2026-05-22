import fs from "fs";
import path from "path";
import type { WorkflowMeta, Workflow } from "./workflows";

const PUBLIC_DIR = path.join(process.cwd(), "public");

let cachedIndex: WorkflowMeta[] | null = null;
let cachedSEO: SEOEntry[] | null = null;

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

export type WorkflowContent = {
  slug: string;
  title: string;
  body: string;
  variables: { name: string; label: string; required: boolean; placeholder: string }[] | null;
};

export function loadWorkflowIndex(): WorkflowMeta[] {
  if (cachedIndex) return cachedIndex;
  const p = path.join(PUBLIC_DIR, "workflows-index.json");
  if (!fs.existsSync(p)) return [];
  cachedIndex = JSON.parse(fs.readFileSync(p, "utf-8")) as WorkflowMeta[];
  return cachedIndex;
}

export function loadSEOIndex(): SEOEntry[] {
  if (cachedSEO) return cachedSEO;
  const p = path.join(PUBLIC_DIR, "seo-index.json");
  if (!fs.existsSync(p)) return [];
  cachedSEO = JSON.parse(fs.readFileSync(p, "utf-8")) as SEOEntry[];
  return cachedSEO;
}

export function loadWorkflowContent(slug: string): Workflow | null {
  const p = path.join(PUBLIC_DIR, "workflow-content", `${slug}.json`);
  if (!fs.existsSync(p)) return null;
  const data = JSON.parse(fs.readFileSync(p, "utf-8")) as WorkflowContent;

  const index = loadWorkflowIndex();
  const meta = index.find((w) => w.slug === slug);
  if (!meta) return null;

  return {
    ...meta,
    body: data.body,
    variables: data.variables || undefined,
  };
}

export function loadExpandedContent(slug: string): ExpandedContent | null {
  const p = path.join(PUBLIC_DIR, "expanded", `${slug}.json`);
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

export function loadStats(): { total: number; categories: number; tags: number; models: number } | null {
  const p = path.join(PUBLIC_DIR, "stats.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}
