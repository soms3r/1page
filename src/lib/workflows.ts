import fs from "fs";
import path from "path";
import { parseWorkflow } from "./parser";

export type WorkflowMeta = {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  models: {
    best: string;
    good: string[];
    limited: string[];
  };
  updated: string;
  featured: boolean;
  locked: boolean;
  refCount?: number;
};

export type Workflow = WorkflowMeta & {
  body: string;
  variables?: WorkflowVariable[];
};

export type WorkflowVariable = {
  name: string;
  label: string;
  required: boolean;
  placeholder: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content");
const CACHE_TTL = 60_000;

let cache: { data: Workflow[]; timestamp: number } | null = null;

export function getAllWorkflows(): Workflow[] {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  const workflowsDir = path.join(CONTENT_DIR, "workflows");
  if (!fs.existsSync(workflowsDir)) return [];

  const categories = fs.readdirSync(workflowsDir);
  const workflows: Workflow[] = [];

  for (const category of categories) {
    const categoryPath = path.join(workflowsDir, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = parseWorkflow(content);
      if (parsed) {
        workflows.push({ ...parsed.meta, body: parsed.body, variables: parsed.variables });
      }
    }
  }

  cache = { data: workflows, timestamp: Date.now() };
  return workflows;
}

export function clearCache(): void {
  cache = null;
}

export function getWorkflowsByCategory(category: string): Workflow[] {
  return getAllWorkflows().filter((w) => w.category === category);
}

export function getWorkflowBySlug(slug: string): Workflow | undefined {
  return getAllWorkflows().find((w) => w.slug === slug);
}

export function getFeaturedWorkflows(): Workflow[] {
  return getAllWorkflows().filter((w) => w.featured);
}

export function getCategories(): string[] {
  const workflows = getAllWorkflows();
  return [...new Set(workflows.map((w) => w.category))].sort();
}

export function getCategoryCounts(): Record<string, number> {
  const workflows = getAllWorkflows();
  const counts: Record<string, number> = {};
  for (const w of workflows) {
    counts[w.category] = (counts[w.category] || 0) + 1;
  }
  return counts;
}
