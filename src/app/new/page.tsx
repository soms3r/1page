import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkflowIndex } from "@/lib/load-index";
import { loadAllSettings } from "@/lib/settings";
import { getLatest } from "@/lib/rank";

export function generateMetadata(): Metadata {
  const s = loadAllSettings();
  const suffix = s.seo.titleSuffix || "TLOGZ";
  const desc = "Newest AI prompt workflows, sorted by most recently updated.";
  return {
    title: `Latest Workflows — ${suffix}`,
    description: desc,
    openGraph: { title: `Latest Workflows — ${suffix}`, type: "website" },
  };
}

export default function LatestPage() {
  const index = loadWorkflowIndex();
  const workflows = getLatest(index, 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">~</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--accent)]">latest</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--accent)]">latest</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{workflows.length} most recent workflow{workflows.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg bg-[var(--surface)]">
        {workflows.map((w) => (
          <Link key={w.slug} href={`/workflows/${w.slug}`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--hover)]">
            <span className="text-[var(--muted)] text-xs">file:</span>
            <span className="text-[var(--accent)] text-sm font-medium">{w.slug}.md</span>
            <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">{w.category}</span>
            <span className="text-xs text-[var(--muted)] hidden sm:block truncate flex-1">{w.description}</span>
            <span className="text-[10px] text-[var(--muted)]">{w.updated}</span>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 text-xs text-[var(--muted)]">
        <Link href="/trending" className="text-[var(--accent)] hover:underline">trending →</Link>
        <Link href="/featured" className="text-[var(--accent)] hover:underline">featured →</Link>
        <Link href="/search" className="text-[var(--accent)] hover:underline">search →</Link>
      </div>
    </div>
  );
}
