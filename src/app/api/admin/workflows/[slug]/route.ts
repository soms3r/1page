import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAllWorkflows, clearCache } from "@/lib/workflows";
import { commitFile } from "@/lib/github";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const workflows = getAllWorkflows();
  const wf = workflows.find((w) => w.slug === slug);

  if (!wf) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), "content", "workflows", wf.category, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      clearCache();
    }
  } catch (e) {
    console.warn("Local FS write failed (expected on Vercel):", e);
  }

  commitFile(`content/workflows/${wf.category}/${slug}.md`, "", `Delete workflow: ${slug}`);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json();
  const workflows = getAllWorkflows();
  const wf = workflows.find((w) => w.slug === slug);

  if (!wf) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "content", "workflows", wf.category, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (typeof body.content === "string") {
    fs.writeFileSync(filePath, body.content, "utf-8");
    clearCache();
    commitFile(`content/workflows/${wf.category}/${slug}.md`, body.content, `Update workflow: ${slug}`);
    return NextResponse.json({ ok: true });
  }

  if (typeof body.featured === "boolean") {
    let content = fs.readFileSync(filePath, "utf-8");
    content = content.replace(/featured: (true|false)/, `featured: ${body.featured}`);
    fs.writeFileSync(filePath, content, "utf-8");
    clearCache();
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
}
