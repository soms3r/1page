"use client";

import { useState } from "react";

const STORAGE_PREFIX = "unlock:";

function isUnlocked(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
}

function markUnlocked(slug: string): void {
  localStorage.setItem(`${STORAGE_PREFIX}${slug}`, "1");
}

function useUnlock(slug: string, locked: boolean) {
  const [state, setState] = useState(() => {
    if (!locked) return true;
    return isUnlocked(slug);
  });

  return {
    unlocked: state,
    unlock: () => {
      markUnlocked(slug);
      setState(true);
    },
  };
}

export default function ShareUnlock({
  slug,
  title,
  locked,
  children,
}: {
  slug: string;
  title: string;
  locked: boolean;
  children: React.ReactNode;
}) {
  const { unlocked, unlock } = useUnlock(slug, locked);

  if (!locked || unlocked) return <>{children}</>;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    unlock();
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(`Check out this AI workflow: ${title}`);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener"
    );
    unlock();
  };

  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener"
    );
    unlock();
  };

  return (
    <div className="border border-[var(--accent)] p-4 space-y-3">
      <div className="text-sm font-bold text-[var(--accent)]">$ unlock required</div>
      <p className="text-xs text-[var(--muted)]">
        Share to unlock the full workflow. This workflow is locked and requires a share to reveal the complete template.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopyLink}
          className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)]"
        >
          Copy Share Link
        </button>
        <button
          onClick={handleTwitter}
          className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)]"
        >
          Share on Twitter
        </button>
        <button
          onClick={handleFacebook}
          className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)]"
        >
          Share on Facebook
        </button>
        <button
          onClick={unlock}
          className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)]"
        >
          Unlock (Skip)
        </button>
      </div>
    </div>
  );
}
