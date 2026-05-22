import Link from "next/link";

const GITHUB_REPO = "soms3r/1page";
const GITHUB_ISSUES = `https://github.com/${GITHUB_REPO}/issues/new?template=workflow-submission.yml`;
const GITHUB_DISCUSSIONS = `https://github.com/${GITHUB_REPO}/discussions/new?category=workflows`;
const GITHUB_CONTENT = `https://github.com/${GITHUB_REPO}/tree/main/content/workflows`;

export default function SubmitPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">/</Link>
        <span className="text-[var(--accent)]">submit</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--accent)]">Submit Workflow</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Contribute to the 1 Page community by submitting your AI workflow.
        </p>
      </div>

      <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--surface)] space-y-6">
        <div>
          <h2 className="text-sm font-bold mb-2">GitHub Workflow</h2>
          <p className="text-xs text-[var(--muted)] mb-4">
            All workflows are stored as Markdown files with YAML frontmatter in the GitHub repository.
            Choose your preferred submission method:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href={GITHUB_ISSUES}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)] hover:bg-[var(--hover)] block"
          >
            <div className="text-[var(--accent)] font-bold text-sm mb-1">Option A</div>
            <div className="text-sm font-medium mb-1">Open Issue Template</div>
            <p className="text-xs text-[var(--muted)]">
              Use our GitHub Issue template to submit your workflow. Fill in the form and we&apos;ll review it.
            </p>
          </a>

          <a
            href={GITHUB_DISCUSSIONS}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)] hover:bg-[var(--hover)] block"
          >
            <div className="text-[var(--accent)] font-bold text-sm mb-1">Option B</div>
            <div className="text-sm font-medium mb-1">Start a Discussion</div>
            <p className="text-xs text-[var(--muted)]">
              Share your workflow in GitHub Discussions. Perfect for getting feedback before submitting.
            </p>
          </a>

          <a
            href={GITHUB_CONTENT}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)] hover:bg-[var(--hover)] block"
          >
            <div className="text-[var(--accent)] font-bold text-sm mb-1">Option C</div>
            <div className="text-sm font-medium mb-1">PR Directly</div>
            <p className="text-xs text-[var(--muted)]">
              Create your workflow file and open a Pull Request directly to the content directory.
            </p>
          </a>
        </div>
      </div>

      <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--surface)] space-y-4">
        <h2 className="text-sm font-bold">Workflow Format</h2>
        <p className="text-xs text-[var(--muted)]">
          Workflows are Markdown files with YAML frontmatter. Here&apos;s the template:
        </p>
        <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs overflow-x-auto">
{`---
title: "Your Workflow Title"
slug: your-workflow-slug
description: "Brief description of what this workflow does"
category: "marketing"
tags: ["tag1", "tag2", "tag3"]
models:
  best: "gpt-4o"
  good: ["claude-sonnet-4"]
  limited: ["gpt-3.5-turbo"]
updated: "2026-01-01"
featured: false
locked: false
---

Write your workflow prompt template here.

Use {{variable_name}} for user inputs.

Use {{var || default}} for optional inputs with defaults.`}
        </pre>
        <div className="text-xs text-[var(--muted)]">
          <p>Valid categories: marketing, development, writing, design, business, research, education, productivity, other</p>
        </div>
      </div>

      <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--surface)]">
        <h2 className="text-sm font-bold mb-2">Quick Copy Template</h2>
        <p className="text-xs text-[var(--muted)] mb-3">
          Copy this blank template, fill it in, and paste it into a GitHub issue:
        </p>
        <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs overflow-x-auto select-all cursor-pointer">
{`---
title: ""
slug: ""
description: ""
category: ""
tags: []
models:
  best: ""
  good: []
  limited: []
updated: "${new Date().toISOString().split("T")[0]}"
featured: false
locked: false
---

`}
        </pre>
      </div>

      <div className="flex gap-3 text-xs text-[var(--muted)] pt-2">
        <Link href="/trending" className="text-[var(--accent)] hover:underline">Trending →</Link>
        <Link href="/featured" className="text-[var(--accent)] hover:underline">Featured →</Link>
        <Link href="/search" className="text-[var(--accent)] hover:underline">Search →</Link>
      </div>
    </div>
  );
}
