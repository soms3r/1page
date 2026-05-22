import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { WorkflowMeta, WorkflowVariable } from "../lib/workflows";

const CONTENT_DIR = path.join(process.cwd(), "content");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const WORKFLOWS_DIR = path.join(CONTENT_DIR, "workflows");

type FullWorkflowContent = {
  meta: WorkflowMeta;
  body: string;
  variables?: WorkflowVariable[];
};

function parseWorkflowFile(filePath: string): FullWorkflowContent | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = matter(raw);
    const data = parsed.data as Record<string, unknown>;

    const meta: WorkflowMeta = {
      title: String(data.title || ""),
      slug: String(data.slug || ""),
      description: String(data.description || ""),
      category: String(data.category || ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      models: {
        best: String((data.models as Record<string, unknown>)?.best || ""),
        good: Array.isArray((data.models as Record<string, unknown>)?.good)
          ? ((data.models as Record<string, unknown>).good as string[]).map(String)
          : [],
        limited: Array.isArray((data.models as Record<string, unknown>)?.limited)
          ? ((data.models as Record<string, unknown>).limited as string[]).map(String)
          : [],
      },
      updated: String(data.updated || ""),
      featured: Boolean(data.featured),
      locked: Boolean(data.locked),
    };

    const variables = Array.isArray(data.variables)
      ? (data.variables as WorkflowVariable[]).map((v) => ({
          name: String(v.name),
          label: String(v.label),
          required: Boolean(v.required),
          placeholder: String(v.placeholder),
        }))
      : undefined;

    return { meta, body: parsed.content, variables };
  } catch {
    return null;
  }
}

function getAllWorkflows(): FullWorkflowContent[] {
  if (!fs.existsSync(WORKFLOWS_DIR)) return [];
  const categories = fs.readdirSync(WORKFLOWS_DIR);
  const workflows: FullWorkflowContent[] = [];

  for (const category of categories) {
    const categoryPath = path.join(WORKFLOWS_DIR, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const parsed = parseWorkflowFile(path.join(categoryPath, file));
      if (parsed) workflows.push(parsed);
    }
  }

  return workflows;
}

function build() {
  const workflows = getAllWorkflows();
  const contentDir = path.join(PUBLIC_DIR, "workflow-content");

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const refCounts = new Map<string, number>();
  for (const w of workflows) {
    let count = 0;
    for (const other of workflows) {
      if (other.meta.slug === w.meta.slug) continue;
      if (other.meta.tags.some((t) => w.meta.tags.includes(t))) count++;
    }
    refCounts.set(w.meta.slug, count);
  }

  const meta: WorkflowMeta[] = workflows.map((w) => ({
    ...w.meta,
    refCount: refCounts.get(w.meta.slug) || 0,
  }));

  const categories = [...new Set(workflows.map((w) => w.meta.category))].sort();
  const tags = [...new Set(workflows.flatMap((w) => w.meta.tags))].sort();
  const modelsSet = new Set<string>();
  for (const w of workflows) {
    if (w.meta.models.best) modelsSet.add(w.meta.models.best);
    w.meta.models.good.forEach((m) => modelsSet.add(m));
    w.meta.models.limited.forEach((m) => modelsSet.add(m));
  }
  const models = [...modelsSet].sort();

  fs.writeFileSync(path.join(PUBLIC_DIR, "workflows-index.json"), JSON.stringify(meta, null, 2));
  fs.writeFileSync(path.join(PUBLIC_DIR, "categories.json"), JSON.stringify(categories, null, 2));
  fs.writeFileSync(path.join(PUBLIC_DIR, "tags.json"), JSON.stringify(tags, null, 2));
  fs.writeFileSync(path.join(PUBLIC_DIR, "models.json"), JSON.stringify(models, null, 2));

  for (const w of workflows) {
    const content = {
      slug: w.meta.slug,
      title: w.meta.title,
      body: w.body,
      variables: w.variables || null,
    };
    fs.writeFileSync(path.join(contentDir, `${w.meta.slug}.json`), JSON.stringify(content, null, 2));
  }

  const counts = {
    total: meta.length,
    categories: categories.length,
    tags: tags.length,
    models: models.length,
  };
  fs.writeFileSync(path.join(PUBLIC_DIR, "stats.json"), JSON.stringify(counts, null, 2));

  console.log(`Index built: ${meta.length} workflows, ${categories.length} categories, ${tags.length} tags, ${models.length} models`);
}

build();
