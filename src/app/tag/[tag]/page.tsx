import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkflowIndex, loadTags, loadSEOIndex, keywordToSlug } from "@/lib/load-index";

type Props = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  const tags = loadTags();
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const index = loadWorkflowIndex();
  const workflows = index.filter((w) => w.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));

  return {
    title: `#${tag} Workflows — 1 Page`,
    description: `Browse ${workflows.length} AI workflow${workflows.length !== 1 ? "s" : ""} tagged with "${tag}". ${workflows.slice(0, 3).map((w) => w.title).join(", ")}.`,
    keywords: [tag, "AI workflows", "prompts", ...workflows.flatMap((w) => w.tags)].join(", "),
    openGraph: {
      title: `#${tag} Workflows — 1 Page`,
      description: `Browse ${workflows.length} AI workflow${workflows.length !== 1 ? "s" : ""} tagged with "${tag}".`,
      type: "website",
    },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const index = loadWorkflowIndex();
  const workflows = index.filter((w) => w.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
  if (workflows.length === 0) notFound();

  const seo = loadSEOIndex();
  const slugs = new Set(workflows.map((w) => w.slug));
  const relatedSearches: string[] = [];
  for (const entry of seo) {
    if (slugs.has(entry.slug)) {
      for (const kw of entry.keywords) { relatedSearches.push(kw); if (relatedSearches.length >= 6) break; }
      for (const q of entry.relatedQueries) { relatedSearches.push(q); if (relatedSearches.length >= 6) break; }
    }
    if (relatedSearches.length >= 6) break;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">/</Link>
        <span className="text-[var(--foreground)]">tag</span>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--accent)]">#{tag}</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--accent)]">#{tag}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{workflows.length} workflow{workflows.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-1">
        {workflows.map((w) => (
          <Link
            key={w.slug}
            href={`/workflows/${w.slug}`}
            className="flex items-center gap-3 py-2 px-3 hover:bg-[var(--hover)] rounded-lg group border-b border-[var(--border)] last:border-0"
          >
            <span className="text-[var(--muted)] text-xs">file:</span>
            <span className="text-[var(--accent)] text-sm font-medium">{w.slug}.md</span>
            <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">[{w.category}]</span>
            <span className="text-xs text-[var(--muted)] hidden sm:block truncate flex-1">{w.description}</span>
          </Link>
        ))}
      </div>

      {relatedSearches.length > 0 && (
        <div className="space-y-2 pt-4">
          <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Related searches</div>
          <div className="flex flex-wrap gap-2">
            {relatedSearches.map((s) => (
              <Link key={keywordToSlug(s)} href={`/search/${keywordToSlug(s)}`}
                className="text-xs border border-[var(--border)] px-2 py-1 rounded hover:border-[var(--accent)]"
              >{s}</Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 text-xs text-[var(--muted)] pt-2">
        <Link href="/trending" className="text-[var(--accent)] hover:underline">Trending →</Link>
        <Link href="/featured" className="text-[var(--accent)] hover:underline">Featured →</Link>
        <Link href="/search" className="text-[var(--accent)] hover:underline">Search →</Link>
      </div>
    </div>
  );
}
