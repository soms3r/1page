import { NextResponse } from "next/server";
import { getAllWorkflows } from "@/lib/workflows";

export async function GET() {
  const workflows = getAllWorkflows();
  const meta = workflows.map(({ title, slug, description, category, tags, models, updated, featured, locked }) => ({
    title, slug, description, category, tags, models, updated, featured, locked,
  }));
  return NextResponse.json(meta);
}
