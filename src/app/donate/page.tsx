import Link from "@/components/app-link";

const ghUrl =
  process.env.NEXT_PUBLIC_GITHUB_SPONSORS_URL || process.env.GITHUB_SPONSORS_URL;
const stripeUrl =
  process.env.NEXT_PUBLIC_STRIPE_DONATION_URL || process.env.STRIPE_DONATION_URL;

export default function DonatePage() {
  return (
    <div className="space-y-6">
      <div className="text-lg font-bold text-[var(--accent)]">$ donate</div>

      <div className="text-sm text-[var(--muted)] space-y-2">
        <p>
          <span className="text-[var(--accent)]">1 Page</span> is a free, open-source
          directory of AI prompt workflows. It costs time and money to maintain —
          servers, domain, and development.
        </p>
        <p>
          If you find this tool useful, consider supporting the project. Every
          contribution helps keep it running and growing.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {ghUrl && (
          <a
            href={ghUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm border border-[var(--accent)] text-[var(--accent)] bg-transparent hover:bg-[var(--accent)] hover:bg-opacity-10"
          >
            $ GitHub Sponsors
          </a>
        )}
        {stripeUrl && (
          <a
            href={stripeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm border border-[var(--accent)] text-[var(--accent)] bg-transparent hover:bg-[var(--accent)] hover:bg-opacity-10"
          >
            $ Stripe Donate
          </a>
        )}
        {!ghUrl && !stripeUrl && (
          <p className="text-xs text-[var(--muted)]">
            No donation links configured. Set <span className="text-[var(--accent)]">NEXT_PUBLIC_GITHUB_SPONSORS_URL</span> or
            <span className="text-[var(--accent)]">NEXT_PUBLIC_STRIPE_DONATION_URL</span> to enable.
          </p>
        )}
      </div>

      <div className="text-xs text-[var(--muted)] space-y-1 pt-4 border-t border-[var(--border)]">
        <p>Thank you for your support.</p>
        <p>
          <Link href="/" className="text-[var(--accent)]">&lt; Back to terminal</Link>
        </p>
      </div>
    </div>
  );
}
