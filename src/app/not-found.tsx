import Link from "@/components/app-link";

export default function NotFound() {
  return (
    <div className="space-y-4">
      <div className="text-lg font-bold text-[var(--accent)]">$ 404</div>
      <div className="text-sm text-[var(--muted)]">Workflow not found.</div>
      <Link href="/" className="text-[var(--accent)] text-sm">&lt; Back to terminal</Link>
    </div>
  );
}
