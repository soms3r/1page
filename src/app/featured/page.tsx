import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkflowIndex } from "@/lib/load-index";
import { getFeatured } from "@/lib/rank";

export const metadata: Metadata = {
  title: "Featured Workflows — 1 Page",
  description: "Featured AI prompt workflows selected for quality and relevance.",
  keywords: "featured, AI workflows, prompts, curated",
  openGraph: {
    title: "Featured Workflows — 1 Page",
    description: "Featured AI prompt workflows selected for quality and relevance.",
    type: "website",
  },
};

export default function FeaturedPage() {
  const index = loadWorkflowIndex();
  const workflows = getFeatured(index);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-[var(--accent)] text-sm">&lt; Back</Link>

      <div className="text-lg font-bold text-[var(--accent)]">$ featured</div>
      <p className="text-sm text-[var(--muted)]">{workflows.length} featured workflow{workflows.length !== 1 ? "s" : ""}</p>

      {workflows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No featured workflows yet.</p>
      ) : (
        <div className="space-y-1">
          {workflows.map((w) => (
            <Link
              key={w.slug}
              href={`/workflows/${w.slug}`}
              className="block pl-4 py-1.5 border-l-2 border-[var(--border)] hover:border-[var(--accent)] hover:bg-[#111]"
            >
              <span className="text-[var(--accent)]">&gt; {w.title}</span>
              <span className="text-xs text-[var(--muted)] ml-2">best: {w.models.best}</span>
              <span className="block text-xs text-[var(--muted)] mt-0.5">{w.description}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-3 text-xs text-[var(--muted)]">
        <Link href="/trending" className="text-[var(--accent)]">Trending →</Link>
        <Link href="/new" className="text-[var(--accent)]">Latest →</Link>
        <Link href="/search" className="text-[var(--accent)]">Advanced Search →</Link>
      </div>
    </div>
  );
}
