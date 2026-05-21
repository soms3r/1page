import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkflowIndex } from "@/lib/load-index";
import { rankWorkflows } from "@/lib/rank";

export const metadata: Metadata = {
  title: "Trending Workflows — 1 Page",
  description: "Most popular AI prompt workflows, ranked by featured status, recency, and tag popularity.",
  keywords: "trending, popular, AI workflows, prompts, top rated",
  openGraph: {
    title: "Trending Workflows — 1 Page",
    description: "Most popular AI prompt workflows, ranked by featured status, recency, and tag popularity.",
    type: "website",
  },
};

export default function TrendingPage() {
  const index = loadWorkflowIndex();
  const workflows = rankWorkflows(index).slice(0, 20);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-[var(--accent)] text-sm">&lt; Back</Link>

      <div className="text-lg font-bold text-[var(--accent)]">$ trending</div>
      <p className="text-sm text-[var(--muted)]">Top {workflows.length} workflows by rank score</p>

      <div className="space-y-1">
        {workflows.map((w, i) => (
          <Link
            key={w.slug}
            href={`/workflows/${w.slug}`}
            className="block pl-4 py-1.5 border-l-2 border-[var(--border)] hover:border-[var(--accent)] hover:bg-[#111]"
          >
            <span className="text-[var(--accent)]">#{i + 1} &gt; {w.title}</span>
            <span className="text-xs text-[var(--muted)] ml-2">score: {w.score.toFixed(2)}</span>
            <span className="block text-xs text-[var(--muted)] mt-0.5">{w.description}</span>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 text-xs text-[var(--muted)]">
        <Link href="/featured" className="text-[var(--accent)]">Featured →</Link>
        <Link href="/new" className="text-[var(--accent)]">Latest →</Link>
        <Link href="/search" className="text-[var(--accent)]">Advanced Search →</Link>
      </div>
    </div>
  );
}
