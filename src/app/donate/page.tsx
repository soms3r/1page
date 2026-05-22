import Link from "next/link";
import { loadAllSettings } from "@/lib/settings";

export default function DonatePage() {
  const settings = loadAllSettings();
  const { donation: d, site } = settings;
  const ghSponsor = d.githubSponsorsUrl || site.sponsor.url;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">~</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--accent)]">donate</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--accent)]">$ support.sh</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{d.description || "Help keep the project running."}</p>
      </div>

      <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--surface)] space-y-3">
        <p className="text-sm text-[var(--foreground)] leading-relaxed"><span className="text-[var(--accent)]">{site.siteName || "TLOGZ"}</span> {d.message}</p>
        <p className="text-sm text-[var(--muted)] leading-relaxed">{d.supportMessage}</p>
        {d.uses && d.uses.length > 0 && (
          <ul className="list-disc list-inside text-xs text-[var(--muted)] space-y-1">
            {d.uses.map((u, i) => <li key={i}>{u}</li>)}
          </ul>
        )}
        <p className="text-xs text-[var(--muted)]">{d.reassurance}</p>
      </div>

      {d.enabled && (
        <div className="flex flex-wrap gap-3">
          {d.githubSponsorsUrl && (
            <a href={d.githubSponsorsUrl} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 text-sm border border-[var(--accent)] text-[var(--accent)] bg-transparent rounded hover:bg-[var(--accent)] hover:text-black">
              GitHub Sponsors
            </a>
          )}
          {d.stripeDonationUrl && (
            <a href={d.stripeDonationUrl} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 text-sm border border-[var(--accent)] text-[var(--accent)] bg-transparent rounded hover:bg-[var(--accent)] hover:text-black">
              Donate
            </a>
          )}
          {d.customLinks?.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 text-sm border border-[var(--accent)] text-[var(--accent)] bg-transparent rounded hover:bg-[var(--accent)] hover:text-black">
              {link.label}
            </a>
          ))}
        </div>
      )}

      {!d.enabled && (
        <div className="flex flex-wrap gap-3">
          <a href={ghSponsor} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 text-sm border border-[var(--accent)] text-[var(--accent)] bg-transparent rounded hover:bg-[var(--accent)] hover:text-black">
            support
          </a>
        </div>
      )}

      <div className="text-xs text-[var(--muted)] border-t border-[var(--border)] pt-4">
        <p>Thank you.</p>
        <p className="mt-1"><Link href="/" className="text-[var(--accent)] hover:underline">&lt; back</Link></p>
      </div>
    </div>
  );
}
