import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1 Page — AI is Easy",
  description: "Discover, copy and run AI workflows. Browse 10,000+ community-maintained, open-source AI workflows.",
  keywords: ["AI", "prompts", "workflows", "LLM", "open-source", "AI is Easy"],
  openGraph: {
    title: "1 Page — AI is Easy",
    description: "Discover, copy and run AI workflows. Browse 10,000+ community-maintained, open-source AI workflows.",
    siteName: "1 Page",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <header className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-[var(--accent)] font-bold text-lg tracking-tight no-underline hover:no-underline">
              1<span className="text-[var(--muted)]">page</span>
            </a>
            <nav className="flex items-center gap-4 text-xs">
              <a href="/search" className="text-[var(--muted)] hover:text-[var(--accent)]">Search</a>
              <a href="/trending" className="text-[var(--muted)] hover:text-[var(--accent)]">Trending</a>
              <a href="/featured" className="text-[var(--muted)] hover:text-[var(--accent)]">Featured</a>
              <a href="/submit" className="text-[var(--accent)] border border-[var(--accent)] px-3 py-1.5 rounded-md hover:bg-[var(--accent)] hover:text-black no-underline">+ Submit</a>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-[var(--border)] py-6 text-xs text-[var(--muted)]">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="text-[var(--accent)]">1 Page</span> — AI is Easy
            </div>
            <div className="flex items-center gap-3">
              <a href="https://github.com/soms3r/1page" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)]">GitHub</a>
              <a href="/donate" className="hover:text-[var(--accent)]">Donate</a>
              <span>Open Source · Community Maintained</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
