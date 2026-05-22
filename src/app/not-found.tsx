import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="text-4xl font-bold text-[var(--accent)]">404</div>
      <div className="text-sm text-[var(--muted)]">Workflow not found.</div>
      <Link href="/" className="text-sm text-[var(--accent)] border border-[var(--accent)] px-4 py-2 rounded hover:bg-[var(--accent)] hover:text-black no-underline">
        &lt; Back to home
      </Link>
    </div>
  );
}
