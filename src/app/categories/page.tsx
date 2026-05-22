import type { Metadata } from "next";
import Link from "next/link";
import { loadWorkflowIndex, loadCategories } from "@/lib/load-index";
import { loadAllSettings } from "@/lib/settings";

export function generateMetadata(): Metadata {
  const s = loadAllSettings();
  const suffix = s.seo.titleSuffix || "TLOGZ";
  const desc = `Browse AI prompt workflows by category.`;
  return {
    title: `Categories — ${suffix}`,
    description: desc,
    openGraph: { title: `Categories — ${suffix}`, description: desc, type: "website" },
  };
}

export default function CategoriesPage() {
  const categories = loadCategories();
  const index = loadWorkflowIndex();

  const withCounts = categories.map((cat) => ({
    name: cat,
    count: index.filter((w) => w.category === cat).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">~</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--accent)]">categories</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--accent)]">categories</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{categories.length} categories</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {withCounts.map(({ name, count }) => (
          <Link
            key={name}
            href={`/category/${name}`}
            className="flex items-center justify-between border border-[var(--border)] rounded-lg px-4 py-3 hover:border-[var(--accent)] hover:bg-[var(--hover)]"
          >
            <div className="flex items-center gap-2">
              <span className="text-[var(--muted)] text-xs">/workflows/</span>
              <span className="text-[var(--accent)] text-sm font-medium">{name}</span>
            </div>
            <span className="text-xs text-[var(--muted)]">{count} workflow{count !== 1 ? "s" : ""}</span>
          </Link>
        ))}
      </div>

      <div className="flex gap-3 text-xs text-[var(--muted)]">
        <Link href="/trending" className="text-[var(--accent)] hover:underline">trending →</Link>
        <Link href="/featured" className="text-[var(--accent)] hover:underline">featured →</Link>
        <Link href="/search" className="text-[var(--accent)] hover:underline">search →</Link>
      </div>
    </div>
  );
}
