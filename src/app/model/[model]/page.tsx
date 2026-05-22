import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkflowIndex, loadModels, loadSEOIndex, keywordToSlug } from "@/lib/load-index";
import { loadAllSettings } from "@/lib/settings";

export const dynamicParams = false;

function matchesModel(model: string, w: { models: { best: string; good: string[]; limited: string[] } }): boolean {
  const ml = model.toLowerCase();
  return (
    w.models.best.toLowerCase() === ml ||
    w.models.good.some((g) => g.toLowerCase() === ml) ||
    w.models.limited.some((l) => l.toLowerCase() === ml)
  );
}

type Props = { params: Promise<{ model: string }> };

export async function generateStaticParams() {
  const models = loadModels();
  return models.map((model) => ({ model }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { model } = await params;
  const s = loadAllSettings();
  const suffix = s.seo.titleSuffix || "TLOGZ";
  const index = loadWorkflowIndex();
  const workflows = index.filter((w) => matchesModel(model, w));
  const name = model.charAt(0).toUpperCase() + model.slice(1);

  return {
    title: `${name} Workflows — ${suffix}`,
    description: `Browse ${workflows.length} AI workflow${workflows.length !== 1 ? "s" : ""} optimized for ${model}. ${workflows.slice(0, 3).map((w) => w.title).join(", ")}.`,
    keywords: [model, "AI", "LLM", "workflows", "prompts", ...workflows.flatMap((w) => w.tags)].join(", "),
    openGraph: {
      title: `${name} Workflows — ${suffix}`,
      description: `Browse ${workflows.length} AI workflow${workflows.length !== 1 ? "s" : ""} optimized for ${model}.`,
      type: "website",
    },
  };
}

export default async function ModelPage({ params }: Props) {
  const { model } = await params;
  const index = loadWorkflowIndex();
  const workflows = index.filter((w) => matchesModel(model, w));
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
        <Link href="/" className="text-[var(--accent)] hover:underline">~</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--accent)]">model/{model}</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--accent)]">{model}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{workflows.length} workflow{workflows.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg bg-[var(--surface)]">
        {workflows.map((w) => (
          <Link
            key={w.slug}
            href={`/workflows/${w.slug}`}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--hover)]"
          >
            <span className="text-[var(--muted)] text-xs">file:</span>
            <span className="text-[var(--accent)] text-sm font-medium">{w.slug}.md</span>
            <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">{w.category}</span>
            <span className="text-xs text-[var(--muted)] hidden sm:block truncate flex-1">{w.description}</span>
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
