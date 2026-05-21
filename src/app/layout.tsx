import type { Metadata } from "next";
import "./globals.css";
import FooterDonate from "@/components/footer-donate";

export const metadata: Metadata = {
  title: "1 Page — AI is Easy",
  description: "A terminal-style directory of AI prompt workflows. Browse, search, and use structured AI workflows.",
  keywords: ["AI", "prompts", "workflows", "LLM", "terminal", "open-source"],
  openGraph: {
    title: "1 Page — AI is Easy",
    description: "A terminal-style directory of AI prompt workflows.",
    siteName: "1 Page",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
          <div className="max-w-4xl mx-auto px-4 space-y-1">
            <div>
              <span className="text-[var(--accent)]">1 Page</span> — AI is Easy
            </div>
            <div>
              Developed by <a href="https://github.com/tasneembinahsan" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">Tasneem Bin Ahsan</a>
            </div>
            <div>
              Powered by <a href="https://tlogz.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">tlogz.com</a>
            </div>
            <FooterDonate />
          </div>
        </footer>
      </body>
    </html>
  );
}
