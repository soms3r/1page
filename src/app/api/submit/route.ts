import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parseWorkflow } from "@/lib/parser";
import { validateWorkflowFrontmatter, slugify } from "@/lib/validator";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const PENDING_DIR = path.join(process.cwd(), "submissions", "pending");
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";

function sanitize(val: string, maxLen = 2000): string {
  return val
    .replace(/\0/g, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+=(["']?)[\s\S]*?\1/gi, "")
    .slice(0, maxLen);
}

function contentHash(markdown: string): string {
  return crypto.createHash("sha256").update(markdown.trim()).digest("hex").slice(0, 16);
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: TURNSTILE_SECRET, response: token, remoteip: ip }),
    });
    const data = await res.json();
    return !!data.success;
  } catch {
    return false;
  }
}

function findDuplicate(hash: string, dir: string): boolean {
  if (!fs.existsSync(dir)) return false;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), "utf-8");
    if (contentHash(content) === hash) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = rateLimit(`submit:${ip}`, 10, 3600_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
    }

    const { markdown, name, email, slug, turnstileToken } = await req.json();

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json({ error: "Workflow content is required" }, { status: 400 });
    }

    if (!turnstileToken || typeof turnstileToken !== "string") {
      return NextResponse.json({ error: "Verification required" }, { status: 400 });
    }

    const verified = await verifyTurnstile(turnstileToken, ip);
    if (!verified) {
      return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 403 });
    }

    const cleaned = sanitize(markdown);
    const hash = contentHash(cleaned);

    if (findDuplicate(hash, PENDING_DIR)) {
      return NextResponse.json({ error: "Duplicate submission" }, { status: 409 });
    }

    const parsed = parseWorkflow(cleaned);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid markdown frontmatter" }, { status: 400 });
    }

    const metaErrors = validateWorkflowFrontmatter(parsed.meta as unknown as Record<string, unknown>);
    if (metaErrors.length > 0) {
      return NextResponse.json({ error: metaErrors.map((e) => e.message).join("; ") }, { status: 400 });
    }

    const safeTitle = sanitize(parsed.meta.title, 200);
    const safeDesc = sanitize(parsed.meta.description, 500);
    const safeName = sanitize(name || "anonymous", 100);
    const safeEmail = sanitize(email || "", 200);
    const safeTags = parsed.meta.tags.map((t) => sanitize(t, 50)).filter(Boolean);
    const safeBody = sanitize(parsed.body, 100_000);

    const timestamp = Date.now();
    const safeSlug = slugify(slug || parsed.meta.slug);
    const filename = `${safeSlug}-${timestamp}.md`;

    const submissionHeader = `---
title: "${safeTitle.replace(/"/g, '\\"')}"
slug: "${safeSlug}"
description: "${safeDesc.replace(/"/g, '\\"')}"
category: "${parsed.meta.category}"
tags: [${safeTags.map((t) => `"${t}"`).join(", ")}]
submitter: "${safeName.replace(/"/g, '\\"')}"
submitter_email: "${safeEmail.replace(/"/g, '\\"')}"
submitted: "${new Date(timestamp).toISOString()}"
status: "pending"
---

`;

    const fullContent = submissionHeader + safeBody;

    try {
      if (!fs.existsSync(PENDING_DIR)) {
        fs.mkdirSync(PENDING_DIR, { recursive: true });
      }
      fs.writeFileSync(path.join(PENDING_DIR, filename), fullContent, "utf-8");
    } catch (e) {
      console.warn("Local FS write failed (expected on Vercel):", e);
    }

    return NextResponse.json({ ok: true, filename });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
