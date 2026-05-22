"use client";

import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ErrorPage({ reset, error }: { error: Error & { digest?: string }; reset: () => void }) {
  const [issuesUrl, setIssuesUrl] = useState("");

  useEffect(() => {
    fetch("/settings.json")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.community?.issuesUrl) setIssuesUrl(data.community.issuesUrl);
        else setIssuesUrl("https://github.com/soms3r/1page/issues/new");
      })
      .catch(() => setIssuesUrl("https://github.com/soms3r/1page/issues/new"));
  }, []);

  const href = issuesUrl || "https://github.com/soms3r/1page/issues/new";

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="text-4xl font-bold text-red-400">500</div>
      <div className="text-sm text-[var(--muted)]">Something went wrong.</div>
      <div className="text-xs text-[var(--muted)]">
        If this persists, please{" "}<a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">report an issue</a>.
      </div>
      <button onClick={() => reset()} className="text-sm border border-[var(--accent)] bg-transparent text-[var(--accent)] px-4 py-2 rounded">try again</button>
    </div>
  );
}
