import { Suspense } from "react";
import SearchClient from "./search-client";
import { loadAllSettings } from "@/lib/settings";

export function generateMetadata() {
  const s = loadAllSettings();
  const suffix = s.seo.titleSuffix || "TLOGZ";
  const desc = "Search AI workflows by keyword, category, or model.";
  return {
    title: `Search Workflows — ${suffix}`,
    description: desc,
  };
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-[var(--muted)] animate-pulse">Loading search...</div>}>
      <SearchClient />
    </Suspense>
  );
}
