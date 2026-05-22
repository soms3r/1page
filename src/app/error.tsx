"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="text-4xl font-bold text-red-400">500</div>
      <div className="text-sm text-[var(--muted)]">
        Something went wrong. {error.message}
      </div>
      <button
        onClick={() => reset()}
        className="text-sm border border-[var(--accent)] bg-transparent text-[var(--accent)] px-4 py-2 rounded"
      >
        Try again
      </button>
    </div>
  );
}
