import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { WorkflowMeta } from "../lib/workflows";

const WORKFLOWS_DIR = path.join(process.cwd(), "content", "workflows");
const OUTPUT_PATH = path.join(process.cwd(), "public", "seo-index.json");

type SEOEntry = {
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

function trim(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3).trimEnd() + "...";
}

function getAllWorkflows(): WorkflowMeta[] {
  if (!fs.existsSync(WORKFLOWS_DIR)) return [];
  const categories = fs.readdirSync(WORKFLOWS_DIR);
  const workflows: WorkflowMeta[] = [];

  for (const category of categories) {
    const categoryPath = path.join(WORKFLOWS_DIR, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(categoryPath, file), "utf-8");
        const parsed = matter(content);
        const data = parsed.data as Record<string, unknown>;
        workflows.push({
          title: String(data.title || ""),
          slug: String(data.slug || ""),
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

function extractTerms(title: string, description: string, tags: string[], category: string): string[] {
  const words = new Set<string>();
  const addWords = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !["the", "and", "for", "with", "that", "this"].includes(w))
      .forEach((w) => words.add(w));
  addWords(title);
  addWords(description);
  tags.forEach((t) => addWords(t));
  addWords(category);
  return [...words];
}

function generateKeywords(terms: string[], tags: string[], category: string, title: string): string[] {
  const keywords: string[] = [];
  const seen = new Set<string>();

  const add = (kw: string) => {
    const key = kw.toLowerCase();
    if (!seen.has(key)) { seen.add(key); keywords.push(kw); }
  };

  add(`"${title}" AI prompt`);
  add(`${title} workflow template`);
  for (const tag of tags) {
    add(`${tag} ${category} prompt`);
    add(`best AI model for ${tag} ${category}`);
  }
  add(`${category} AI workflow examples`);
  add(`how to use AI for ${category}`);
  const bigrams: string[] = [];
  for (let i = 0; i < terms.length - 1; i++) { bigrams.push(`${terms[i]} ${terms[i + 1]}`); }
  for (const bigram of bigrams) {
    add(`AI prompt for ${bigram}`);
    add(`${bigram} automation`);
  }
  const generics = [
    `step-by-step ${category} workflow`,
    `${title} alternative prompts`,
    `free AI ${category} tools`,
  ];
  for (const g of generics) add(g);

  return keywords.slice(0, 10);
}

function generateRelatedQueries(title: string, description: string, tags: string[], category: string): string[] {
  const queries: string[] = [];
  const terms = extractTerms(title, description, tags, category).slice(0, 5);
  const templates = [
    `How do I ${terms[0] || "use"} ${category} AI workflows?`,
    `What is the best AI model for ${tags[0] || category}?`,
    `How to write a ${title.toLowerCase()} prompt?`,
    `Can AI help with ${terms[1] || category} automation?`,
    `What are the best practices for ${category} AI prompts?`,
  ];
  for (const t of templates) { if (queries.length < 5) queries.push(t); }
  return queries;
}

function generateSuggestions(category: string, tags: string[], allWorkflows: WorkflowMeta[]) {
  const allCategories = [...new Set(allWorkflows.map((w) => w.category))].filter((c) => c !== category);
  const allTags = [...new Set(allWorkflows.flatMap((w) => w.tags))];
  const categories = allCategories.slice(0, 3);
  const tagCombinations: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < tags.length; i++) {
    for (let j = i + 1; j < tags.length; j++) {
      const combo = `${tags[i]} + ${tags[j]}`;
      if (!seen.has(combo)) { seen.add(combo); tagCombinations.push(combo); }
    }
  }
  for (const tag of tags) {
    for (const other of allTags) {
      if (tag !== other && !seen.has(`${tag} + ${other}`) && !seen.has(`${other} + ${tag}`)) {
        seen.add(`${tag} + ${other}`);
        tagCombinations.push(`${tag} + ${other}`);
        if (tagCombinations.length >= 6) break;
      }
    }
    if (tagCombinations.length >= 6) break;
  }
  return { categories, tagCombinations: tagCombinations.slice(0, 5) };
}

function build() {
  const allWorkflows = getAllWorkflows();
  const index: SEOEntry[] = [];

  for (const w of allWorkflows) {
    const terms = extractTerms(w.title, w.description, w.tags, w.category);
    const title = trim(`${w.title} — AI Workflow Prompt`, 60);
    const suffix = ` Use this ${w.category} AI workflow with ${w.models.best || "your favorite model"}.`;
    const description = trim(w.description + suffix, 155);
    const keywords = generateKeywords(terms, w.tags, w.category, w.title);
    const relatedQueries = generateRelatedQueries(w.title, w.description, w.tags, w.category);
    const suggestions = generateSuggestions(w.category, w.tags, allWorkflows);
    index.push({ slug: w.slug, title, description, keywords, relatedQueries, suggestions });
  }

  if (!fs.existsSync(path.dirname(OUTPUT_PATH))) {
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2));
  console.log(`SEO index built: ${index.length} workflows`);
}

build();
