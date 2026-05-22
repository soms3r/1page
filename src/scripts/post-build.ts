import fs from "fs";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "out");

function copyPublicFiles() {
  const publicDir = path.join(process.cwd(), "public");
  const jsonFiles = [
    "workflows-index.json",
    "search-index.json",
    "categories.json",
    "tags.json",
    "models.json",
    "seo-index.json",
    "stats.json",
  ];

  for (const file of jsonFiles) {
    const src = path.join(publicDir, file);
    const dest = path.join(OUT_DIR, file);
    if (fs.existsSync(src)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
  }

  const expandedDir = path.join(publicDir, "expanded");
  const expandedDest = path.join(OUT_DIR, "expanded");
  if (fs.existsSync(expandedDir)) {
    fs.mkdirSync(expandedDest, { recursive: true });
    const files = fs.readdirSync(expandedDir);
    for (const file of files) {
      fs.copyFileSync(path.join(expandedDir, file), path.join(expandedDest, file));
    }
  }

  const contentDir = path.join(publicDir, "workflow-content");
  const contentDest = path.join(OUT_DIR, "workflow-content");
  if (fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDest, { recursive: true });
    const files = fs.readdirSync(contentDir);
    for (const file of files) {
      fs.copyFileSync(path.join(contentDir, file), path.join(contentDest, file));
    }
  }

  console.log("Post-build: JSON assets copied to out/");
}

copyPublicFiles();
