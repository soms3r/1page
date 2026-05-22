import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const WORKFLOWS_DIR = path.join(CONTENT_DIR, "workflows");
const OUTPUT_CONTENT = path.join(CONTENT_DIR, "generated", "routes.json");
const OUTPUT_PUBLIC = path.join(process.cwd(), "public", "routes.json");

function collectRoutes() {
  const tags = new Set<string>();
  const categories = new Set<string>();
  const models = new Set<string>();
  const workflows: string[] = [];

  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.error("No workflows directory found at", WORKFLOWS_DIR);
    return { tags: [], categories: [], models: [], workflows: [] };
  }

  const dirs = fs.readdirSync(WORKFLOWS_DIR);
  for (const dir of dirs) {
    const dirPath = path.join(WORKFLOWS_DIR, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(dirPath, file), "utf-8");
        const parsed = matter(raw);
        const data = parsed.data as Record<string, unknown>;

        const slug = String(data.slug || "");
        if (!slug) continue;

        workflows.push(slug);

        const cats = String(data.category || "");
        if (cats) categories.add(cats);

        const tg = Array.isArray(data.tags) ? data.tags.map(String) : [];
        for (const t of tg) tags.add(t);

        const modelsData = data.models as Record<string, unknown> | undefined;
        if (modelsData) {
          if (modelsData.best) models.add(String(modelsData.best));
          if (Array.isArray(modelsData.good)) {
            for (const m of modelsData.good) models.add(String(m));
          }
          if (Array.isArray(modelsData.limited)) {
            for (const m of modelsData.limited) models.add(String(m));
          }
        }
      } catch {
        // skip unparseable files
      }
    }
  }

  return {
    tags: [...tags].sort(),
    categories: [...categories].sort(),
    models: [...models].sort(),
    workflows: workflows.sort(),
  };
}

const routes = collectRoutes();

const generatedDir = path.dirname(OUTPUT_CONTENT);
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

const json = JSON.stringify(routes, null, 2);
fs.writeFileSync(OUTPUT_CONTENT, json, "utf-8");
fs.writeFileSync(OUTPUT_PUBLIC, json, "utf-8");

console.log(`Route registry built: ${routes.tags.length} tags, ${routes.categories.length} categories, ${routes.models.length} models, ${routes.workflows.length} workflows`);
