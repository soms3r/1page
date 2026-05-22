import fs from "fs";
import path from "path";
import matter from "gray-matter";

const WORKFLOWS_DIR = path.join(process.cwd(), "content", "workflows");
const OUTPUT_PATH = path.join(process.cwd(), "public", "search-index.json");

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
      try {
        const content = fs.readFileSync(path.join(categoryPath, file), "utf-8");
        const parsed = matter(content);
        const data = parsed.data as Record<string, unknown>;

        index.push({
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
        });
      } catch {
        // skip invalid files
      }
    }
  }

  if (!fs.existsSync(path.dirname(OUTPUT_PATH))) {
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2));
  console.log(`Search index built: ${index.length} workflows`);
}

buildSearchIndex();
