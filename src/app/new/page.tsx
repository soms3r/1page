import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkflowIndex } from "@/lib/load-index";
import { getLatest } from "@/lib/rank";

export const metadata: Metadata = {
  title: "Latest Workflows — 1 Page",
  description: "Newest AI prompt workflows, sorted by most recently updated.",
  keywords: "latest, new, recent, AI workflows, prompts",
  openGraph: {
    title: "Latest Workflows — 1 Page",
    description: "Newest AI prompt workflows, sorted by most recently updated.",
    type: "website",
  },
};

export default function NewPage() {
  const index = loadWorkflowIndex();
  const workflows = getLatest(index, 20);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-[var(--accent)] text-sm">&lt; Back</Link>

      <div className="text-lg font-bold text-[var(--accent)]">$ latest</div>
      <p className="text-sm text-[var(--muted)]">{workflows.length} most recent workflow{workflows.length !== 1 ? "s" : ""}</p>

      <div className="space-y-1">
        {workflows.map((w) => (
          <Link
            key={w.slug}
            href={`/workflows/${w.slug}`}
            className="block pl-4 py-1.5 border-l-2 border-[var(--border)] hover:border-[var(--accent)] hover:bg-[#111]"
          >
            <span className="text-[var(--accent)]">&gt; {w.title}</span>
            <span className="text-xs text-[var(--muted)] ml-2">{w.updated}</span>
            <span className="block text-xs text-[var(--muted)] mt-0.5">{w.description}</span>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 text-xs text-[var(--muted)]">
        <Link href="/trending" className="text-[var(--accent)]">Trending →</Link>
        <Link href="/featured" className="text-[var(--accent)]">Featured →</Link>
        <Link href="/search" className="text-[var(--accent)]">Advanced Search →</Link>
      </div>
    </div>
  );
}
