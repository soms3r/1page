import { Suspense } from "react";
import SearchClient from "./search-client";

export const metadata = {
  title: "Search Workflows — 1 Page",
  description: "Search 10,000+ AI workflows by keyword, category, or model.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-[var(--muted)] animate-pulse">Loading search...</div>}>
      <SearchClient />
    </Suspense>
  );
}
