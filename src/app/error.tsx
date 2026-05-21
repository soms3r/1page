"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-lg font-bold text-red-400">$ error</div>
      <div className="text-sm text-[var(--muted)]">
        Something went wrong. {error.message}
      </div>
      <button
        onClick={() => reset()}
        className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)]"
      >
        Try again
      </button>
    </div>
  );
}
