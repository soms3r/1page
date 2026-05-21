import fs from "fs";
import path from "path";
import { parseWorkflow } from "../lib/parser";

const WORKFLOWS_DIR = path.join(process.cwd(), "content", "workflows");
const OUTPUT_PATH = path.join(process.cwd(), "content", "search-index.json");

type SearchIndexEntry = {
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
};

function buildSearchIndex(): void {
  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.error("Workflows directory not found:", WORKFLOWS_DIR);
    process.exit(1);
  }

  const categories = fs.readdirSync(WORKFLOWS_DIR);
  const index: SearchIndexEntry[] = [];

  for (const category of categories) {
    const categoryPath = path.join(WORKFLOWS_DIR, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(categoryPath, file), "utf-8");
      const parsed = parseWorkflow(content);
      if (parsed) {
        index.push({
          title: parsed.meta.title,
          slug: parsed.meta.slug,
          description: parsed.meta.description,
          category: parsed.meta.category,
          tags: parsed.meta.tags,
          models: parsed.meta.models,
          updated: parsed.meta.updated,
          featured: parsed.meta.featured,
          locked: parsed.meta.locked,
        });
      }
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2));
  console.log(`Search index built: ${index.length} workflows`);
}

buildSearchIndex();
