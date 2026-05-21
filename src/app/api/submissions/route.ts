import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PENDING_DIR = path.join(process.cwd(), "submissions", "pending");

export type PendingSubmission = {
  filename: string;
  title: string;
  category: string;
  submitter: string;
  submitted: string;
  preview: string;
};

export async function GET() {
  if (!fs.existsSync(PENDING_DIR)) {
    return NextResponse.json([]);
  }

  const files = fs.readdirSync(PENDING_DIR).filter((f) => f.endsWith(".md"));
  const submissions: PendingSubmission[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(PENDING_DIR, file), "utf-8");
    const lines = content.split("\n").filter((l) => l.startsWith("---") || l.includes(":"));
    const getVal = (key: string) => {
      const line = lines.find((l) => l.trim().startsWith(key + ":"));
      return line ? line.split(":")[1]?.trim().replace(/^"|"$/g, "") || "" : "";
    };
    submissions.push({
      filename: file,
      title: getVal("title"),
      category: getVal("category"),
      submitter: getVal("submitter"),
      submitted: getVal("submitted"),
      preview: content.slice(0, 300).replace(/---\n[\s\S]*?---\n/, "").trim().slice(0, 200),
    });
  }

  return NextResponse.json(submissions);
}
