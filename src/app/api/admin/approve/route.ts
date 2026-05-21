import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseWorkflow } from "@/lib/parser";
import { getAllWorkflows, clearCache } from "@/lib/workflows";
import { commitFile } from "@/lib/github";

const PENDING_DIR = path.join(process.cwd(), "submissions", "pending");
const APPROVED_DIR = path.join(process.cwd(), "submissions", "approved");
const inFlight = new Set<string>();
const recentlyApprovedSlugs = new Map<string, number>();
const SLUG_DEDUP_MS = 30_000;

function stripSubmissionMeta(content: string): string {
  const lines = content.split("\n");
  const clean: string[] = [];
  let inFrontmatter = false;
  let frontmatterDone = false;

  for (const line of lines) {
    if (!frontmatterDone) {
      if (line.trim() === "---" && !inFrontmatter) {
        inFrontmatter = true;
        clean.push(line);
        continue;
      }
      if (line.trim() === "---" && inFrontmatter) {
        inFrontmatter = false;
        frontmatterDone = true;
        clean.push(line);
        continue;
      }
      if (inFrontmatter) {
        if (
          line.startsWith("submitter:") ||
          line.startsWith("submitter_email:") ||
          line.startsWith("submitted:") ||
          line.startsWith("status:")
        ) {
          continue;
        }
        clean.push(line);
        continue;
      }
    }
    clean.push(line);
  }

  return clean.join("\n");
}

const processedFiles = new Set<string>();

export async function POST(req: NextRequest) {
  let filename: string | null = null;
  try {
    const body = await req.json();
    filename = body.filename;
    if (!filename) {
      return NextResponse.json({ error: "filename required" }, { status: 400 });
    }

    if (processedFiles.has(filename)) {
      return NextResponse.json({ error: "Already approved" }, { status: 409 });
    }

    if (inFlight.has(filename)) {
      return NextResponse.json({ error: "Already being processed" }, { status: 409 });
    }
    inFlight.add(filename);

    const filePath = path.join(PENDING_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const clean = stripSubmissionMeta(raw);

    const parsed = parseWorkflow(clean);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid workflow after sanitization" }, { status: 400 });
    }

    const slug = parsed.meta.slug;
    const category = parsed.meta.category;

    const lastSlugApproved = recentlyApprovedSlugs.get(slug);
    if (lastSlugApproved && Date.now() - lastSlugApproved < SLUG_DEDUP_MS) {
      return NextResponse.json({ error: "Already approved recently" }, { status: 409 });
    }

    const existing = getAllWorkflows().find((w) => w.slug === slug);
    if (existing) {
      return NextResponse.json({ error: `Slug conflict: "${slug}" already exists in "${existing.category}". Rename or edit.` }, { status: 409 });
    }

    processedFiles.add(filename);
    recentlyApprovedSlugs.set(slug, Date.now());
    clearCache();

    try {
      const targetDir = path.join(process.cwd(), "content", "workflows", category);
      const targetFile = path.join(targetDir, `${slug}.md`);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(targetFile, clean, "utf-8");
      fs.unlinkSync(filePath);
      if (!fs.existsSync(APPROVED_DIR)) {
        fs.mkdirSync(APPROVED_DIR, { recursive: true });
      }
      fs.writeFileSync(path.join(APPROVED_DIR, filename), raw, "utf-8");
    } catch (e) {
      console.warn("Local FS write failed (expected on Vercel):", e);
    }

    commitFile(`content/workflows/${category}/${slug}.md`, clean, `Add workflow: ${parsed.meta.title}`);

    return NextResponse.json({ ok: true, slug, category });
  } catch (err) {
    console.error("Approve error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    if (filename) inFlight.delete(filename);
  }
}
