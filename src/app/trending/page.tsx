import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkflowIndex } from "@/lib/load-index";
import { rankWorkflows } from "@/lib/rank";

export const metadata: Metadata = {
  title: "Trending Workflows — 1 Page",
  description: "Most popular AI prompt workflows, ranked by featured status, recency, and tag popularity.",
  openGraph: { title: "Trending Workflows — 1 Page", type: "website" },
};

export default function TrendingPage() {
  const index = loadWorkflowIndex();
  const workflows = rankWorkflows(index).slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">/</Link>
        <span className="text-[var(--accent)]">trending</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--accent)]">Trending</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Top {workflows.length} workflows by rank score</p>
      </div>

      <div className="space-y-1">
        {workflows.map((w, i) => (
          <Link
            key={w.slug}
            href={`/workflows/${w.slug}`}
            className="flex items-center gap-3 py-2 px-3 hover:bg-[var(--hover)] rounded-lg border-b border-[var(--border)] last:border-0"
          >
            <span className="text-[var(--muted)] text-xs w-6">#{i + 1}</span>
            <span className="text-[var(--accent)] text-sm font-medium">{w.slug}.md</span>
            <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">{w.category}</span>
            <span className="text-xs text-[var(--muted)] hidden sm:block truncate flex-1">{w.description}</span>
            <span className="text-[10px] text-[var(--muted)]">{w.score.toFixed(2)}</span>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 text-xs text-[var(--muted)] pt-2">
        <Link href="/featured" className="text-[var(--accent)] hover:underline">Featured →</Link>
        <Link href="/new" className="text-[var(--accent)] hover:underline">Latest →</Link>
        <Link href="/search" className="text-[var(--accent)] hover:underline">Search →</Link>
      </div>
    </div>
  );
}
