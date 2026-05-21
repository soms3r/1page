import { NextRequest, NextResponse } from "next/server";
import { getWorkflowBySlug } from "@/lib/workflows";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const workflow = getWorkflowBySlug(slug);

  if (!workflow) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(workflow);
}
