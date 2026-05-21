"use client";

import { useState } from "react";

const STORAGE_PREFIX = "share:";

function getShareCount(slug: string): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(`${STORAGE_PREFIX}${slug}`) || "0", 10);
}

function incrementShare(slug: string): void {
  localStorage.setItem(`${STORAGE_PREFIX}${slug}`, String(getShareCount(slug) + 1));
}

export default function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(0);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const text = encodeURIComponent(`Check out this AI workflow: ${title}`);
  const url = encodeURIComponent(shareUrl);

  const track = () => {
    incrementShare(slug);
    setCount((c) => c + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    track();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener");
    track();
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${text}%20${url}`, "_blank", "noopener");
    track();
  };

  const handleTelegram = () => {
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank", "noopener");
    track();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)]"
      >
        {copied ? "✓ Copied" : "Copy Link"}
      </button>
      <button
        onClick={handleTwitter}
        className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)]"
      >
        Twitter
      </button>
      <button
        onClick={handleWhatsApp}
        className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)]"
      >
        WhatsApp
      </button>
      <button
        onClick={handleTelegram}
        className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)]"
      >
        Telegram
      </button>
      {count > 0 && (
        <span className="text-xs text-[var(--muted)]">+{count}</span>
      )}
    </div>
  );
}
