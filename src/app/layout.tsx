import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { loadAllSettings } from "@/lib/settings";
import BottomNav from "@/components/bottom-nav";

export function generateMetadata(): Metadata {
  const s = loadAllSettings();
  const title = s.seo.defaultTitle || "Prompt Flow";
  const desc = s.seo.defaultDescription || "AI workflow library.";
  return {
    title,
    description: desc,
    keywords: s.seo.defaultKeywords,
    openGraph: {
      title,
      description: desc,
      siteName: s.site.siteName || "Prompt Flow",
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = loadAllSettings();
  const { site, footer: ft } = settings;

  return (
    <html lang={site.language || "en"} className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <header className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[var(--accent)] font-bold text-base tracking-tight no-underline hover:no-underline">
              <span className="text-[var(--muted)] font-normal">$</span>
              <span>{site.siteName || "TLOGZ"}</span>
              <span className="animate-blink text-[var(--accent)]">▌</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-3 text-xs">
              <Link href="/search" className="text-[var(--muted)] hover:text-[var(--accent)]">search</Link>
              <Link href="/trending" className="text-[var(--muted)] hover:text-[var(--accent)]">trending</Link>
              <Link href="/featured" className="text-[var(--muted)] hover:text-[var(--accent)]">featured</Link>
              <Link href="/categories" className="text-[var(--muted)] hover:text-[var(--accent)]">categories</Link>
              <Link href="/about" className="text-[var(--muted)] hover:text-[var(--accent)]">about</Link>
              <Link href="/submit" className="text-[var(--accent)] border border-[var(--accent)] px-2.5 py-1 rounded-md hover:bg-[var(--accent)] hover:text-black no-underline text-xs">+ submit</Link>
              <a href="/admin/login.php" className="text-[var(--muted)] hover:text-[var(--accent)]">admin</a>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 sm:py-8 pb-20 sm:pb-8">{children}</main>
        <footer className="border-t border-[var(--border)] py-5 text-xs text-[var(--muted)] hidden sm:block">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-center sm:text-left">
              <span className="text-[var(--muted)]">{site.siteName || "TLOGZ"}</span>
              {ft.showTagline && (
                <><span className="text-[var(--muted)] mx-1">·</span><span>{site.tagline || "AI is Easy"}</span></>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              {ft.links.map((link, i) => (
                link.external ? (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)]">{link.label}</a>
                ) : (
                  <Link key={i} href={link.url} className="hover:text-[var(--accent)]">{link.label}</Link>
                )
              ))}
            </div>
            <div className="text-center sm:text-right text-[10px] leading-relaxed">
              {ft.showCreator && (
                <span>by <a href={site.creator.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">{site.creator.name}</a></span>
              )}
              {ft.showSponsor && ft.showCreator && <span className="mx-1">·</span>}
              {ft.showSponsor && (
                <span>sponsored by <a href={site.sponsor.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">{site.sponsor.name}</a></span>
              )}
            </div>
          </div>
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
