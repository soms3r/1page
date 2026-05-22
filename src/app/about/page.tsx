import Link from "next/link";
import { loadAllSettings } from "@/lib/settings";

export const metadata = {
  title: "About — TLOGZ",
  description: "TLOGZ is an open-source AI workflow library powered by the community. Discover, share, improve, and contribute AI workflows.",
};

export default function AboutPage() {
  const settings = loadAllSettings();
  const { site, community } = settings;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">~</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--accent)]">about</span>
      </div>

      <div>
        <h1 className="text-xl font-bold"><span className="text-[var(--accent)]">{site.siteName || "TLOGZ"}</span></h1>
        <p className="text-sm text-[var(--muted)] mt-1">{site.tagline || "AI is Easy"}</p>
      </div>

      <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--surface)] space-y-3">
        <h2 className="text-sm font-bold">$ cat mission.txt</h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">Make AI accessible to everyone through community-powered workflows.</p>
        <p className="text-sm text-[var(--muted)] leading-relaxed">You should not need to be a prompt engineer to get great results. The TLOGZ community collects, organizes, and improves AI workflows so that anyone can discover, copy, and run them.</p>
      </section>

      <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--surface)] space-y-3">
        <h2 className="text-sm font-bold">$ cat why.txt</h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">AI tools are powerful, but knowing how to prompt them effectively takes time. Good workflows get lost in bookmarks, buried in Twitter threads, or kept private.</p>
        <p className="text-sm text-[var(--muted)] leading-relaxed">TLOGZ fixes this with a structured, searchable, open-source library of AI workflows that anyone can use and contribute to.</p>
      </section>

      <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--surface)] space-y-3">
        <h2 className="text-sm font-bold">$ cat philosophy.txt</h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">Everything is open source. The code, the content, the workflows. No gatekeeping, no paywalls, no hidden features.</p>
        <p className="text-sm text-[var(--muted)] leading-relaxed">The repository is the single source of truth. Content is stored as Markdown files with YAML frontmatter. The site is built statically and deployed to shared hosting. No database required.</p>
      </section>

      <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--surface)] space-y-3">
        <h2 className="text-sm font-bold">$ cat community.txt</h2>
        <p className="text-sm text-[var(--muted)] leading-relaxed">TLOGZ is built by and for the community. Every workflow is contributed by someone like you. Whether you are a developer, a marketer, a writer, a student, or a teacher, your workflows are welcome here.</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/submit" className="text-xs border border-[var(--accent)] text-[var(--accent)] px-3 py-1.5 rounded hover:bg-[var(--accent)] hover:text-black no-underline">submit workflow</Link>
          <a href={community.issuesUrl || "https://github.com/soms3r/1page/issues"} target="_blank" rel="noopener noreferrer" className="text-xs border border-[var(--border)] text-[var(--muted)] px-3 py-1.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] no-underline">report issue</a>
          <a href={community.discussionsUrl || "https://github.com/soms3r/1page/discussions"} target="_blank" rel="noopener noreferrer" className="text-xs border border-[var(--border)] text-[var(--muted)] px-3 py-1.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] no-underline">discuss</a>
        </div>
      </section>

      <section className="border border-[var(--border)] rounded-lg p-5 bg-[var(--surface)] space-y-3">
        <h2 className="text-sm font-bold">$ cat credits.txt</h2>
        <div className="space-y-1 text-sm text-[var(--muted)]">
          <div>creator: <a href={site.creator.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">{site.creator.name}</a></div>
          <div>site: <a href={site.website} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">{site.website}</a></div>
          <div>sponsor: <a href={site.sponsor.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">{site.sponsor.name}</a></div>
        </div>
      </section>

      <div className="flex gap-3 text-xs text-[var(--muted)]">
        <Link href="/trending" className="text-[var(--accent)] hover:underline">trending →</Link>
        <Link href="/featured" className="text-[var(--accent)] hover:underline">featured →</Link>
        <Link href="/search" className="text-[var(--accent)] hover:underline">search →</Link>
      </div>
    </div>
  );
}
