import fs from "fs";
import path from "path";
import matter from "gray-matter";

const WORKFLOWS_DIR = path.join(process.cwd(), "content", "workflows");
const EXPANDED_DIR = path.join(process.cwd(), "public", "expanded");
const OUTPUT_CONTENT = path.join(process.cwd(), "content", "generated", "starter-packs.json");
const OUTPUT_PUBLIC = path.join(process.cwd(), "public", "starter-packs.json");

type WorkflowMeta = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  models: { best: string; good: string[]; limited: string[] };
  updated: string;
  featured: boolean;
  locked: boolean;
};

type StarterPackEntry = {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  remixable: boolean;
};

type StarterPacks = Record<string, StarterPackEntry[]>;

function getAllWorkflows(): WorkflowMeta[] {
  if (!fs.existsSync(WORKFLOWS_DIR)) return [];
  const categories = fs.readdirSync(WORKFLOWS_DIR);
  const workflows: WorkflowMeta[] = [];
  for (const category of categories) {
    const catPath = path.join(WORKFLOWS_DIR, category);
    if (!fs.statSync(catPath).isDirectory()) continue;
    const files = fs.readdirSync(catPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(catPath, file), "utf-8");
        const parsed = matter(raw);
        const data = parsed.data as Record<string, unknown>;
        workflows.push({
          slug: String(data.slug || ""),
          title: String(data.title || ""),
          description: String(data.description || ""),
          category: String(data.category || ""),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          models: {
            best: String((data.models as Record<string, unknown>)?.best || ""),
            good: Array.isArray((data.models as Record<string, unknown>)?.good)
              ? ((data.models as Record<string, unknown>).good as string[]).map(String) : [],
            limited: Array.isArray((data.models as Record<string, unknown>)?.limited)
              ? ((data.models as Record<string, unknown>).limited as string[]).map(String) : [],
          },
          updated: String(data.updated || ""),
          featured: Boolean(data.featured),
          locked: Boolean(data.locked),
        });
      } catch {
        // skip
      }
    }
  }
  return workflows;
}

function hasExpandedContent(slug: string): boolean {
  return fs.existsSync(path.join(EXPANDED_DIR, `${slug}.json`));
}

function getVariableCount(slug: string): number {
  const p = path.join(process.cwd(), "public", "workflow-content", `${slug}.json`);
  if (!fs.existsSync(p)) return 0;
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf-8"));
    return Array.isArray(data.variables) ? data.variables.length : 0;
  } catch {
    return 0;
  }
}

function getRequiredVarCount(slug: string): number {
  const p = path.join(process.cwd(), "public", "workflow-content", `${slug}.json`);
  if (!fs.existsSync(p)) return 0;
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf-8"));
    if (!Array.isArray(data.variables)) return 0;
    return data.variables.filter((v: { required?: boolean }) => v.required).length;
  } catch {
    return 0;
  }
}

function scoreWorkflow(w: WorkflowMeta): number {
  let score = 0;
  const varCount = getVariableCount(w.slug);
  const reqVarCount = getRequiredVarCount(w.slug);
  const expanded = hasExpandedContent(w.slug);

  if (varCount > 0) score += 2;
  score += Math.min(varCount - 1, 3);
  if (reqVarCount > 0) score += 1;
  if (expanded) score += 2;
  score += Math.min(w.tags.length - 1, 3);
  if (w.description.length > 20) score += 1;
  if (w.models.best) score += 1;
  if (w.models.good.length > 0 && w.models.limited.length > 0) score += 1;
  if (w.featured) score += 2;

  return score;
}

function difficulty(score: number): "beginner" | "intermediate" | "advanced" {
  if (score <= 4) return "beginner";
  if (score <= 9) return "intermediate";
  return "advanced";
}

function isRemixable(w: WorkflowMeta): boolean {
  return getVariableCount(w.slug) > 0 && hasExpandedContent(w.slug) && w.tags.length >= 2;
}

function build(): void {
  const workflows = getAllWorkflows();

  const grouped: Record<string, WorkflowMeta[]> = {};
  for (const w of workflows) {
    if (!w.slug) continue;
    if (!grouped[w.category]) grouped[w.category] = [];
    grouped[w.category].push(w);
  }

  const packs: StarterPacks = {};
  for (const [category, ws] of Object.entries(grouped)) {
    const scored = ws
      .map((w) => ({ w, score: scoreWorkflow(w) }))
      .sort((a, b) => b.score - a.score);

    const selected = scored.slice(0, Math.min(scored.length, 10));
    packs[category] = selected.map((s) => ({
      id: s.w.slug,
      title: s.w.title,
      difficulty: difficulty(s.score),
      remixable: isRemixable(s.w),
    }));
  }

  const generatedDir = path.dirname(OUTPUT_CONTENT);
  if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

  const json = JSON.stringify(packs, null, 2);
  fs.writeFileSync(OUTPUT_CONTENT, json, "utf-8");
  fs.writeFileSync(OUTPUT_PUBLIC, json, "utf-8");

  const total = Object.values(packs).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`Starter packs built: ${Object.keys(packs).length} categories, ${total} workflows`);
}

build();
