import { NextResponse } from "next/server";

const UMAMI_URL = process.env.NEXT_PUBLIC_UMAMI_URL;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export async function GET() {
  if (!UMAMI_URL || !UMAMI_WEBSITE_ID) {
    return NextResponse.json({ error: "Umami not configured" }, { status: 404 });
  }

  try {
    const endAt = Date.now();
    const startAt = endAt - 30 * 24 * 60 * 60 * 1000;

    const res = await fetch(
      `${UMAMI_URL}/api/websites/${UMAMI_WEBSITE_ID}/stats?startAt=${startAt}&endAt=${endAt}`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 502 });
    }

    const stats = await res.json();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "Umami unreachable" }, { status: 502 });
  }
}
