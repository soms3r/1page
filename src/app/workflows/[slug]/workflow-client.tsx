"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { Workflow, WorkflowMeta } from "@/lib/workflows";
import type { RelatedWorkflows } from "./page";
import type { ExpandedContent } from "@/lib/load-index";
import { validateVariables } from "@/lib/validator";
import { renderTemplate } from "@/lib/template";
import { trackGenerate } from "@/lib/analytics";
import ShareUnlock from "@/components/share-unlock";
import ShareButtons from "@/components/share-buttons";

const GITHUB_REPO = "soms3r/1page";

const markdownComponents: Components = {
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !match && !className;
    if (isInline) {
      return (
        <code className="bg-[var(--surface)] px-1.5 py-0.5 text-[var(--accent)] text-xs rounded" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-[var(--surface)] border border-[var(--border)] p-4 overflow-x-auto my-3 rounded-lg">
        {match && (
          <div className="text-[var(--muted)] text-xs mb-2 uppercase tracking-wider">{match[1]}</div>
        )}
        <code className={`text-sm leading-relaxed ${className || ""}`} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  pre: ({ children }) => <>{children}</>,
  strong: ({ children }) => <strong className="text-[var(--accent)] font-bold">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} className="text-[var(--accent)] underline underline-offset-2" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>,
  h1: ({ children }) => <h1 className="text-lg font-bold mt-6 mb-3 text-[var(--accent)]">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-bold mt-5 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-bold mt-4 mb-1">{children}</h3>,
  p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[var(--accent)] pl-4 my-3 text-[var(--muted)] italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-[var(--border)] my-6" />,
};

export default function WorkflowClient({
  workflow, slug, related, expanded,
}: {
  workflow: Workflow; slug: string;
  related: RelatedWorkflows; expanded: ExpandedContent | null;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    workflow.variables?.forEach((v) => { initial[v.name] = ""; });
    return initial;
  });
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const hasVariables = workflow.variables && workflow.variables.length > 0;

  useEffect(() => {
    setBookmarked(!!localStorage.getItem(`bm:${slug}`));
  }, [slug]);

  useEffect(() => {
    if (showPreview && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showPreview, output]);

  const generate = () => {
    if (hasVariables) {
      const errs = validateVariables(values, workflow.variables);
      const errMap: Record<string, string> = {};
      errs.forEach((e) => { errMap[e.field] = e.message; });
      setErrors(errMap);
      if (errs.length > 0) return;
    }
    const result = renderTemplate(workflow.body, values);
    setOutput(result);
    setShowPreview(true);
    trackGenerate(slug);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output || workflow.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    const empty: Record<string, string> = {};
    workflow.variables?.forEach((v) => { empty[v.name] = ""; });
    setValues(empty);
    setOutput("");
    setShowPreview(false);
    setErrors({});
    setCopied(false);
  };

  const toggleBookmark = () => {
    if (bookmarked) {
      localStorage.removeItem(`bm:${slug}`);
      setBookmarked(false);
    } else {
      localStorage.setItem(`bm:${slug}`, "1");
      setBookmarked(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
  };

  const ghSourceUrl = `https://github.com/${GITHUB_REPO}/blob/main/content/workflows/${workflow.category}/${slug}.md`;
  const ghEditUrl = `https://github.com/${GITHUB_REPO}/edit/main/content/workflows/${workflow.category}/${slug}.md`;
  const ghIssueUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=Issue%20with%20${slug}&labels=bug`;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">/</Link>
        <Link href={`/category/${workflow.category}`} className="text-[var(--accent)] hover:underline">{workflow.category}</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--foreground)]">{slug}.md</span>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: workflow.title,
            description: workflow.description,
            dateModified: workflow.updated,
            keywords: workflow.tags.join(", "),
            author: { "@type": "Organization", name: "1 Page", url: "https://github.com/soms3r/1page" },
          }),
        }}
      />

      {/* Header */}
      <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[var(--muted)] text-xs">file:</span>
          <span className="text-[var(--accent)] font-bold text-base">{slug}.md</span>
        </div>
        <h1 className="text-xl font-bold">{workflow.title}</h1>
        <p className="text-sm text-[var(--muted)] mt-1">{workflow.description}</p>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Link
          href={`/category/${workflow.category}`}
          className="px-2 py-1 border border-[var(--border)] rounded hover:border-[var(--accent)]"
        >
          {workflow.category}
        </Link>
        {workflow.tags.map((tag) => (
          <Link
            key={tag}
            href={`/tag/${tag}`}
            className="px-2 py-1 border border-[var(--border)] rounded hover:border-[var(--accent)]"
          >
            #{tag}
          </Link>
        ))}
      </div>

      {/* Model Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="border border-[var(--border)] rounded-lg p-2">
          <div className="text-[var(--muted)]">Best</div>
          <div className="text-[var(--accent)] font-bold">{workflow.models.best || "—"}</div>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-2">
          <div className="text-[var(--muted)]">Good</div>
          <div>{workflow.models.good.join(", ") || "—"}</div>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-2">
          <div className="text-[var(--muted)]">Limited</div>
          <div>{workflow.models.limited.join(", ") || "—"}</div>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-2">
          <div className="text-[var(--muted)]">Updated</div>
          <div>{workflow.updated}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleCopy} className="text-xs">
          {copied ? "✓ Copied!" : "Copy Workflow"}
        </button>
        <button
          onClick={toggleBookmark}
          className="text-xs border border-[var(--border)] bg-transparent text-[var(--foreground)]"
        >
          {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
        </button>
        <ShareButtons slug={slug} title={workflow.title} />
      </div>

      {/* GitHub Links */}
      <div className="flex flex-wrap gap-2 text-xs">
        <a
          href={ghSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] border border-[var(--border)] px-2 py-1 rounded hover:border-[var(--accent)]"
        >
          View Source
        </a>
        <a
          href={ghEditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] border border-[var(--border)] px-2 py-1 rounded hover:border-[var(--accent)]"
        >
          Edit on GitHub
        </a>
        <a
          href={ghIssueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent)] border border-[var(--border)] px-2 py-1 rounded hover:border-[var(--accent)]"
        >
          Report Issue
        </a>
      </div>

      {/* Workflow Content */}
      {workflow.body && (
        <ShareUnlock slug={slug} title={workflow.title} locked={workflow.locked}>
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)]">
            <div className="text-xs text-[var(--muted)] mb-3 uppercase tracking-wider">Workflow</div>
            <div className="prose prose-invert max-w-none text-sm [&_*]:text-[var(--foreground)]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {workflow.body}
              </ReactMarkdown>
            </div>
          </div>
        </ShareUnlock>
      )}

      {/* Variables */}
      {hasVariables && (
        <div className="space-y-3 border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)]" onKeyDown={handleKeyDown}>
          <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Variables</div>
          {workflow.variables!.map((v) => (
            <div key={v.name}>
              <label className="text-xs text-[var(--muted)] block mb-1">
                {v.label}{v.required ? " *" : ""}
              </label>
              <input
                type="text"
                placeholder={v.placeholder}
                value={values[v.name] || ""}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, [v.name]: e.target.value }));
                  if (errors[v.name]) {
                    const rest = { ...errors };
                    delete rest[v.name];
                    setErrors(rest);
                  }
                }}
                className="w-full text-sm"
              />
              {errors[v.name] && <div className="text-red-400 text-xs mt-1">{errors[v.name]}</div>}
            </div>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <button onClick={generate}>Generate</button>
            <span className="text-xs text-[var(--muted)]">Ctrl+Enter</span>
          </div>
        </div>
      )}

      {!hasVariables && (
        <div className="flex gap-2">
          <button onClick={handleCopy}>Copy Prompt</button>
        </div>
      )}

      {/* Output */}
      {showPreview && output && (
        <div ref={outputRef} className="space-y-2 border border-[var(--accent)] rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--accent)] font-bold">Output</span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)]"
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
              {hasVariables && (
                <button
                  onClick={handleReset}
                  className="text-xs border border-[var(--border)] bg-transparent text-[var(--muted)]"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <pre className="text-sm whitespace-pre-wrap overflow-x-auto leading-relaxed">
            {output}
          </pre>
        </div>
      )}

      {/* Expanded Guide */}
      {expanded && (
        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
          <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Workflow Guide</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ExpandedSection title="How to Use" items={expanded.howToUse} />
            <ExpandedSection title="Best Use Cases" items={expanded.bestUseCases} />
            <ExpandedSection title="Examples" items={expanded.examples} />
            <ExpandedSection title="Variations" items={expanded.variations} />
            <ExpandedSection title="Common Mistakes" items={expanded.commonMistakes} />
          </div>
        </div>
      )}

      {/* Related Workflows */}
      {(related.sameCategory.length > 0 || related.trending.length > 0 || related.tagMatched.length > 0) && (
        <div className="space-y-4 pt-4 border-t border-[var(--border)]">
          <div className="text-xs text-[var(--muted)] uppercase tracking-wider">Related Workflows</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {related.sameCategory.length > 0 && <RelatedList title="Same Category" items={related.sameCategory} />}
            {related.trending.length > 0 && <RelatedList title="Trending" items={related.trending} />}
            {related.tagMatched.length > 0 && <RelatedList title="Similar Tags" items={related.tagMatched} />}
          </div>
        </div>
      )}
    </div>
  );
}

function ExpandedSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-[var(--border)] rounded-lg p-3 bg-[var(--surface)]">
      <div className="text-xs text-[var(--muted)] mb-1 uppercase tracking-wider">{title}</div>
      <ul className="list-disc list-inside text-xs space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-[var(--foreground)]">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function RelatedList({ title, items }: { title: string; items: WorkflowMeta[] }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-[var(--muted)] mb-1 uppercase tracking-wider">{title}</div>
      {items.map((w) => (
        <Link
          key={w.slug}
          href={`/workflows/${w.slug}`}
          className="block border border-[var(--border)] rounded-lg p-2 hover:border-[var(--accent)] hover:bg-[var(--hover)] text-xs"
        >
          <div className="text-[var(--accent)] truncate">{w.title}</div>
          {w.description && <div className="text-[var(--muted)] truncate mt-0.5">{w.description}</div>}
        </Link>
      ))}
    </div>
  );
}
