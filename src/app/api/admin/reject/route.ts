import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PENDING_DIR = path.join(process.cwd(), "submissions", "pending");
const REJECTED_DIR = path.join(process.cwd(), "submissions", "rejected");
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
      return NextResponse.json({ error: "Already rejected" }, { status: 409 });
    }

    const srcPath = path.join(PENDING_DIR, filename);
    if (!fs.existsSync(srcPath)) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    try {
      if (!fs.existsSync(REJECTED_DIR)) {
        fs.mkdirSync(REJECTED_DIR, { recursive: true });
      }
      fs.renameSync(srcPath, path.join(REJECTED_DIR, filename));
    } catch (e) {
      console.warn("Local FS write failed (expected on Vercel):", e);
    }
    processedFiles.add(filename);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
