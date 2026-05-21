"use client";

import { useState, useRef } from "react";
import Link from "@/components/app-link";

type GeneratedData = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  markdown: string;
  slug: string;
};

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const outputRef = useRef<HTMLPreElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);
    setSaved(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDraft = async () => {
    if (!result) return;
    setSaved(false);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: result.markdown,
          name: "ai-generator",
          email: "",
          slug: result.slug,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save draft");
        return;
      }

      setSaved(true);
    } catch {
      setError("Network error saving draft.");
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/" className="text-[var(--accent)] text-sm">&lt; Back</Link>

      <div className="text-lg font-bold text-[var(--accent)]">$ generate</div>

      <div>
        <label className="text-xs text-[var(--muted)] block mb-1">
          Describe the workflow you want:
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. a marketing plan generator for ecommerce stores"
          rows={3}
          className="w-full text-sm resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate();
          }}
        />
        <div className="flex items-center gap-3 mt-2">
          <button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
            {loading ? "Generating..." : "Generate Workflow"}
          </button>
          <span className="text-xs text-[var(--muted)]">Ctrl+Enter</span>
        </div>
      </div>

      {error && (
        <div className="border border-red-400 p-3 text-sm text-red-400">
          $ error: {error}
        </div>
      )}

      {loading && (
        <div className="text-sm text-[var(--muted)] animate-pulse">
          Generating workflow...
        </div>
      )}

      {result && (
        <div className="space-y-4 border border-[var(--accent)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--accent)]">
              $ {result.title}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)]"
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
              <button
                onClick={handleSaveDraft}
                className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)]"
              >
                {saved ? "✓ Saved" : "Save as Draft"}
              </button>
            </div>
          </div>

          <div className="text-xs text-[var(--muted)] space-y-1">
            <div>category: {result.category}</div>
            {result.tags.length > 0 && (
              <div>tags: {result.tags.join(", ")}</div>
            )}
          </div>

          <pre
            ref={outputRef}
            className="text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto bg-[#111] border border-[var(--border)] p-3 max-h-96 overflow-y-auto"
          >
            {result.markdown}
          </pre>

          {saved && (
            <div className="text-xs text-[var(--accent)]">
              Saved to submissions/pending/ — Review in{" "}
              <Link href="/admin" className="underline">/admin</Link>
            </div>
          )}

          <div className="pt-1">
            <button
              onClick={() => {
                setResult(null);
                setPrompt("");
              }}
              className="text-xs border border-[var(--border)] bg-transparent text-[var(--muted)]"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
