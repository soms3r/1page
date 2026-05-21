import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseWorkflow } from "@/lib/parser";
import { clearCache } from "@/lib/workflows";
import { commitFile } from "@/lib/github";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    const parsed = parseWorkflow(content);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid markdown" }, { status: 400 });
    }

    const { slug, category } = parsed.meta;

    try {
      const targetDir = path.join(process.cwd(), "content", "workflows", category);
      const targetFile = path.join(targetDir, `${slug}.md`);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(targetFile, content, "utf-8");
      clearCache();
    } catch (e) {
      console.warn("Local FS write failed (expected on Vercel):", e);
    }

    commitFile(`content/workflows/${category}/${slug}.md`, content, `Add workflow: ${slug}`);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
