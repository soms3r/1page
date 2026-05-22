"use client";

export default function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={(e) => {
        navigator.clipboard.writeText(text);
        const btn = e.currentTarget;
        const orig = btn.textContent;
        btn.textContent = "✓ copied";
        setTimeout(() => { btn.textContent = orig; }, 2000);
      }}
      className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)] px-2 py-1 rounded hover:bg-[var(--accent)] hover:text-black"
    >
      copy
    </button>
  );
}
