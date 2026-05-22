import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkflowIndex, loadSEOIndex, keywordToSlug } from "@/lib/load-index";
import type { SEOEntry } from "@/lib/load-index";
import type { WorkflowMeta } from "@/lib/workflows";

type Props = { params: Promise<{ query: string }> };
type FlatEntry = { slug: string; original: string; seo: SEOEntry; workflow: WorkflowMeta };

function buildFlatIndex(): FlatEntry[] {
  const seo = loadSEOIndex();
  const wf = loadWorkflowIndex();
  const map = new Map(wf.map((w) => [w.slug, w]));
  const flat: FlatEntry[] = [];
  for (const entry of seo) {
    const workflow = map.get(entry.slug);
    if (!workflow) continue;
    const seen = new Set<string>();
    for (const kw of entry.keywords) {
      const slug = keywordToSlug(kw);
      if (!seen.has(slug)) { seen.add(slug); flat.push({ slug, original: kw, seo: entry, workflow }); }
    }
    for (const q of entry.relatedQueries) {
      const slug = keywordToSlug(q);
      if (!seen.has(slug)) { seen.add(slug); flat.push({ slug, original: q, seo: entry, workflow }); }
    }
  }
  return flat;
}

const cachedFlat: FlatEntry[] = buildFlatIndex();

export async function generateStaticParams() {
  return cachedFlat.map((e) => ({ query: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { query } = await params;
  const entry = cachedFlat.find((e) => e.slug === query);
  if (!entry) return { title: "Search — 1 Page" };

  const title = entry.original.charAt(0).toUpperCase() + entry.original.slice(1);
  return {
    title: `${title} — 1 Page`,
    description: `Learn how to ${entry.original}. Use this AI workflow with ${entry.workflow.models.best || "your favorite model"} for ${entry.workflow.category} tasks.`,
    keywords: [entry.original, entry.workflow.category, ...entry.workflow.tags].join(", "),
    openGraph: {
      title: `${title} — 1 Page`,
      description: `AI workflow for ${entry.original}. ${entry.workflow.description}`,
      type: "article",
    },
  };
}

export default async function SearchQueryPage({ params }: Props) {
  const { query } = await params;
  const entry = cachedFlat.find((e) => e.slug === query);
  if (!entry) notFound();

  const { workflow, seo, original } = entry;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">/</Link>
        <span className="text-[var(--foreground)]">search</span>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--accent)]">{original}</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold">Search: {original}</h1>
        <p className="text-sm text-[var(--muted)]">AI workflow for &quot;{original}&quot;</p>
      </div>

      <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)] space-y-3">
        <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Result</div>
        <Link
          href={`/workflows/${workflow.slug}`}
          className="block border border-[var(--border)] rounded-lg p-3 hover:border-[var(--accent)] hover:bg-[var(--hover)]"
        >
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] text-xs">file:</span>
            <span className="text-[var(--accent)] font-bold">&gt; {workflow.title}</span>
          </div>
          <div className="text-xs text-[var(--muted)] mt-1">{workflow.description}</div>
          <div className="flex gap-2 mt-2 text-xs text-[var(--muted)]">
            <span>category: {workflow.category}</span>
            <span>model: {workflow.models.best || "—"}</span>
          </div>
        </Link>
        <Link
          href={`/workflows/${workflow.slug}`}
          className="inline-block text-xs border border-[var(--accent)] text-[var(--accent)] px-3 py-1 rounded"
        >
          Open Workflow →
        </Link>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Related searches</div>
        <div className="flex flex-wrap gap-2">
          {seo.keywords.slice(0, 4).map((kw) => {
            const s = keywordToSlug(kw);
            if (s === query) return null;
            return <Link key={s} href={`/search/${s}`} className="text-xs border border-[var(--border)] px-2 py-1 rounded hover:border-[var(--accent)]">{kw}</Link>;
          })}
          {seo.relatedQueries.slice(0, 3).map((q) => {
            const s = keywordToSlug(q);
            if (s === query) return null;
            return <Link key={s} href={`/search/${s}`} className="text-xs border border-[var(--border)] px-2 py-1 rounded hover:border-[var(--accent)]">{q}</Link>;
          })}
          {seo.suggestions.tagCombinations.slice(0, 3).map((tc) => {
            const s = keywordToSlug(tc);
            if (s === query) return null;
            return <Link key={s} href={`/search/${s}`} className="text-xs border border-[var(--border)] px-2 py-1 rounded hover:border-[var(--accent)]">{tc}</Link>;
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Browse by</div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/category/${workflow.category}`} className="text-xs text-[var(--accent)]">{workflow.category}</Link>
          {workflow.tags.map((tag) => (
            <Link key={tag} href={`/tag/${tag}`} className="text-xs text-[var(--accent)]">#{tag}</Link>
          ))}
          <Link href="/trending" className="text-xs text-[var(--accent)]">trending</Link>
          <Link href="/featured" className="text-xs text-[var(--accent)]">featured</Link>
        </div>
      </div>

      <Link href="/search" className="text-[var(--accent)] text-sm">Advanced Search →</Link>
    </div>
  );
}
