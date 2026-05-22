import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkflowIndex, loadCategories, loadSEOIndex, keywordToSlug, loadStarterPacks } from "@/lib/load-index";
import type { StarterPackEntry } from "@/lib/load-index";
import { loadAllSettings } from "@/lib/settings";

export const dynamicParams = false;

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  const categories = loadCategories();
  return categories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const s = loadAllSettings();
  const suffix = s.seo.titleSuffix || "TLOGZ";
  const index = loadWorkflowIndex();
  const workflows = index.filter((w) => w.category === category);
  const name = category.charAt(0).toUpperCase() + category.slice(1);
  const allTags = [...new Set(workflows.flatMap((w) => w.tags))];

  return {
    title: `${name} Workflows — ${suffix}`,
    description: `Browse ${workflows.length} AI workflow${workflows.length !== 1 ? "s" : ""} in the ${category} category. ${workflows.slice(0, 3).map((w) => w.title).join(", ")}.`,
    keywords: [category, ...allTags, "AI workflows", "prompts"].join(", "),
    openGraph: {
      title: `${name} Workflows — ${suffix}`,
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

  const allPacks = loadStarterPacks();
  const starterPacks: StarterPackEntry[] = allPacks[category] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">~</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--accent)]">{category}</span>
      </div>

      <div>
        <p className="text-xs text-[var(--muted)] mb-1">$ ls workflows/{category}/</p>
        <h1 className="text-xl font-bold text-[var(--accent)]">{category}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{workflows.length} workflow{workflows.length !== 1 ? "s" : ""}</p>
      </div>

      {starterPacks.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider">Starter Pack</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {starterPacks.map((sp) => (
              <Link
                key={sp.id}
                href={`/workflows/${sp.id}`}
                className="border border-[var(--border)] rounded-lg p-3 hover:border-[var(--accent)] hover:bg-[var(--hover)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--accent)]">{sp.title}</span>
                  {sp.remixable && <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">remix</span>}
                </div>
                <div className="flex gap-2 mt-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${sp.difficulty === "beginner" ? "border-green-600 text-green-400" : sp.difficulty === "intermediate" ? "border-yellow-600 text-yellow-400" : "border-red-600 text-red-400"}`}>
                    {sp.difficulty}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg bg-[var(--surface)]">
        {workflows.map((w) => (
          <Link
            key={w.slug}
            href={`/workflows/${w.slug}`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--hover)]"
          >
            <span className="text-[var(--muted)] text-xs">file:</span>
            <span className="text-[var(--accent)] text-sm font-medium">{w.slug}.md</span>
            <span className="text-xs text-[var(--muted)] hidden sm:block truncate flex-1">{w.description}</span>
            <span className="text-[10px] text-[var(--muted)]">{w.models.best || "—"}</span>
          </Link>
        ))}
      </div>

      {relatedSearches.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-[var(--muted)] uppercase tracking-wider">related</div>
          <div className="flex flex-wrap gap-2">
            {relatedSearches.map((s) => (
              <Link key={keywordToSlug(s)} href={`/search/${keywordToSlug(s)}`}
                className="text-xs border border-[var(--border)] px-2 py-1 rounded hover:border-[var(--accent)]"
              >{s}</Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 text-xs text-[var(--muted)]">
        <Link href="/trending" className="text-[var(--accent)] hover:underline">trending →</Link>
        <Link href="/featured" className="text-[var(--accent)] hover:underline">featured →</Link>
        <Link href="/search" className="text-[var(--accent)] hover:underline">search →</Link>
      </div>
    </div>
  );
}
