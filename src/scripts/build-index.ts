import fs from "fs";
import path from "path";
import { getAllWorkflows } from "../lib/workflows";
import type { WorkflowMeta } from "../lib/workflows";

const CONTENT_DIR = path.join(process.cwd(), "content");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function build() {
  const workflows = getAllWorkflows();

  const refCounts = new Map<string, number>();
  for (const w of workflows) {
    let count = 0;
    for (const other of workflows) {
      if (other.slug === w.slug) continue;
      if (other.tags.some((t) => w.tags.includes(t))) count++;
    }
    refCounts.set(w.slug, count);
  }

  const meta: WorkflowMeta[] = workflows.map(({ title, slug, description, category, tags, models, updated, featured, locked }) => ({
    title,
    slug,
    description,
    category,
    tags,
    models,
    updated,
    featured,
    locked,
    refCount: refCounts.get(slug) || 0,
  }));

  const categories = [...new Set(workflows.map((w) => w.category))].sort();

  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // Runtime index for homepage (client fetch)
  fs.writeFileSync(path.join(CONTENT_DIR, "index.json"), JSON.stringify(meta, null, 2));
  fs.writeFileSync(path.join(CONTENT_DIR, "categories.json"), JSON.stringify(categories, null, 2));

  // Build-time index for listing pages (SSG)
  fs.writeFileSync(path.join(PUBLIC_DIR, "workflows-index.json"), JSON.stringify(meta, null, 2));

  console.log(`Index built: ${meta.length} workflows, ${categories.length} categories`);
}

build();
