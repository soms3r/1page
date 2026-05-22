import fs from "fs";
import path from "path";
import { loadWorkflowIndex, loadCategories, loadTags, loadModels } from "../lib/load-index";
import { loadAllSettings } from "../lib/settings";

const BASE_URL = "https://tlogz.ai";
const OUT_DIR = path.join(process.cwd(), "public");

const index = loadWorkflowIndex();
const categories = loadCategories();
const tags = loadTags();
const models = loadModels();

const staticPages = [
  { url: "/", priority: 1.0 },
  { url: "/search", priority: 0.9 },
  { url: "/trending", priority: 0.8 },
  { url: "/featured", priority: 0.7 },
  { url: "/new", priority: 0.7 },
  { url: "/categories", priority: 0.8 },
  { url: "/about", priority: 0.5 },
  { url: "/donate", priority: 0.5 },
  { url: "/submit", priority: 0.9 },
];

const urls = [
  ...staticPages,
  ...categories.map((cat) => ({ url: `/category/${cat}`, priority: 0.8 })),
  ...tags.map((tag) => ({ url: `/tag/${tag}`, priority: 0.6 })),
  ...models.map((model) => ({ url: `/model/${model}`, priority: 0.5 })),
  ...index.map((w) => ({ url: `/workflows/${w.slug}`, priority: 0.9 })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ url, priority }) => `  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`).join("\n")}
</urlset>`;

const filePath = path.join(OUT_DIR, "sitemap.xml");
fs.writeFileSync(filePath, xml, "utf-8");
console.log(`Sitemap built: ${filePath}`);
