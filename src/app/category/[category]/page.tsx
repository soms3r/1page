import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkflowIndex, loadCategories, loadSEOIndex, keywordToSlug } from "@/lib/load-index";

type Props = { params: Promise<{ category: string }> };

function getRelatedSearches(category: string): string[] {
  const seo = loadSEOIndex();
  const index = loadWorkflowIndex();
  const slugs = new Set(index.filter((w) => w.category === category).map((w) => w.slug));
  const searches: string[] = [];
  for (const entry of seo) {
    if (slugs.has(entry.slug)) {
      for (const kw of entry.keywords) {
        searches.push(kw);
        if (searches.length >= 6) break;
      }
      for (const q of entry.relatedQueries) {
        searches.push(q);
        if (searches.length >= 6) break;
      }
    }
    if (searches.length >= 6) break;
  }
  return searches.slice(0, 6);
}

export async function generateStaticParams() {
  const categories = loadCategories();
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const index = loadWorkflowIndex();
  const workflows = index.filter((w) => w.category === category);
  const name = category.charAt(0).toUpperCase() + category.slice(1);
  const allTags = [...new Set(workflows.flatMap((w) => w.tags))];

  return {
    title: `${name} Workflows — 1 Page`,
    description: `Browse ${workflows.length} AI workflow${workflows.length !== 1 ? "s" : ""} in the ${category} category. ${workflows.slice(0, 3).map((w) => w.title).join(", ")}.`,
    keywords: [category, ...allTags].join(", "),
    openGraph: {
      title: `${name} Workflows — 1 Page`,
      description: `Browse ${workflows.length} AI workflow${workflows.length !== 1 ? "s" : ""} in ${category}.`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const index = loadWorkflowIndex();
  const workflows = index.filter((w) => w.category === category);

  if (workflows.length === 0) notFound();

  const relatedSearches = getRelatedSearches(category);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-[var(--accent)] text-sm">&lt; Back</Link>

      <div className="text-lg font-bold text-[var(--accent)]">$ category: {category}</div>
      <p className="text-sm text-[var(--muted)]">{workflows.length} workflow{workflows.length !== 1 ? "s" : ""}</p>

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

      {relatedSearches.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-[var(--muted)]">Related searches:</div>
          <div className="flex flex-wrap gap-2">
            {relatedSearches.map((s) => {
              const slug = keywordToSlug(s);
              return (
                <Link
                  key={slug}
                  href={`/search/${slug}`}
                  className="text-xs border border-[var(--border)] px-2 py-1 hover:border-[var(--accent)]"
                >
                  {s}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 text-xs text-[var(--muted)]">
        <Link href="/trending" className="text-[var(--accent)]">Trending →</Link>
        <Link href="/featured" className="text-[var(--accent)]">Featured →</Link>
        <Link href="/new" className="text-[var(--accent)]">Latest →</Link>
      </div>

      <Link href="/search" className="text-[var(--accent)] text-sm">Advanced Search →</Link>
    </div>
  );
}
