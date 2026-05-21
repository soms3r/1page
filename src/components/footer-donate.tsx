const ghUrl = process.env.NEXT_PUBLIC_GITHUB_SPONSORS_URL || process.env.GITHUB_SPONSORS_URL;
const stripeUrl = process.env.NEXT_PUBLIC_STRIPE_DONATION_URL || process.env.STRIPE_DONATION_URL;

export default function FooterDonate() {
  if (!ghUrl && !stripeUrl) return null;

  return (
    <div className="pt-2 space-x-3">
      <span className="text-[var(--muted)]">Support:</span>
      {ghUrl && (
        <a
          href={ghUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] hover:underline"
        >
          GitHub Sponsors
        </a>
      )}
      {stripeUrl && (
        <a
          href={stripeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] hover:underline"
        >
          Stripe Donate
        </a>
      )}
    </div>
  );
}
