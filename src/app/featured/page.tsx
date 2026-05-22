import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkflowIndex } from "@/lib/load-index";
import { getFeatured } from "@/lib/rank";

export const metadata: Metadata = {
  title: "Featured Workflows — 1 Page",
  description: "Featured AI prompt workflows selected for quality and relevance.",
  keywords: "featured, AI workflows, prompts, curated",
  openGraph: { title: "Featured Workflows — 1 Page", description: "Featured AI prompt workflows selected for quality and relevance.", type: "website" },
};

export default function FeaturedPage() {
  const index = loadWorkflowIndex();
  const workflows = getFeatured(index);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">/</Link>
        <span className="text-[var(--accent)]">featured</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--accent)]">Featured</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{workflows.length} featured workflow{workflows.length !== 1 ? "s" : ""}</p>
      </div>

      {workflows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No featured workflows yet.</p>
      ) : (
        <div className="space-y-1">
          {workflows.map((w) => (
            <Link
              key={w.slug}
              href={`/workflows/${w.slug}`}
              className="flex items-center gap-3 py-2 px-3 hover:bg-[var(--hover)] rounded-lg border-b border-[var(--border)] last:border-0"
            >
              <span className="text-[var(--muted)] text-xs">file:</span>
              <span className="text-[var(--accent)] text-sm font-medium">{w.slug}.md</span>
              <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">{w.category}</span>
              <span className="text-xs text-[var(--muted)] hidden sm:block truncate flex-1">{w.description}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-3 text-xs text-[var(--muted)] pt-2">
        <Link href="/trending" className="text-[var(--accent)] hover:underline">Trending →</Link>
        <Link href="/new" className="text-[var(--accent)] hover:underline">Latest →</Link>
        <Link href="/search" className="text-[var(--accent)] hover:underline">Search →</Link>
      </div>
    </div>
  );
}
