"use client";

import { useEffect, useState } from "react";
import Link from "@/components/app-link";
import Turnstile from "react-turnstile";
import { trackPageView } from "@/lib/analytics";
import { slugify } from "@/lib/validator";

const CATEGORIES = ["marketing", "development", "writing", "design", "business", "other"];

type FormData = {
  title: string;
  description: string;
  category: string;
  tags: string;
  content: string;
  name: string;
  email: string;
};

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  category: "",
  tags: "",
  content: "",
  name: "",
  email: "",
};

function assembleMarkdown(data: FormData): string {
  const tags = data.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return `---
title: "${data.title.replace(/"/g, '\\"')}"
slug: "${slugify(data.title)}"
description: "${data.description.replace(/"/g, '\\"')}"
category: "${data.category}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
models:
  best: ""
  good: []
  limited: []
updated: "${new Date().toISOString().split("T")[0]}"
featured: false
---

${data.content || "Write your workflow prompt template here. Use {{variable_name}} for user inputs."}
`;
}

export default function SubmitPage() {
  useEffect(() => { trackPageView("/submit"); }, []);

  const [step, setStep] = useState<"form" | "preview" | "done">("form");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      const rest = { ...fieldErrors };
      delete rest[field];
      setFieldErrors(rest);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.category) errs.category = "Category is required";
    if (!slugify(form.title)) errs.title = "Title must produce a valid slug";
    if (!form.content.trim()) errs.content = "Workflow content is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePreview = () => {
    if (!validate()) return;
    setStep("preview");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    if (!turnstileToken) {
      setError("Please complete the verification.");
      return;
    }

    setSubmitting(true);
    const markdown = assembleMarkdown(form);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown,
          name: form.name || null,
          email: form.email || null,
          turnstileToken,
          slug: slugify(form.title),
        }),
      });

      if (res.ok) {
        setStep("done");
      } else {
        const data = await res.json();
        setError(data.error || "Submission failed.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const previewMarkdown = assembleMarkdown(form);

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setTurnstileToken("");
    setError("");
    setFieldErrors({});
    setStep("form");
  };

  return (
    <div className="space-y-6">
      <Link href="/" className="text-[var(--accent)] text-sm">&lt; Back</Link>

      <div className="text-lg font-bold text-[var(--accent)]">$ submit</div>

      {step === "form" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Facebook Ad Generator"
              className="w-full text-sm"
            />
            {form.title && (
              <div className="text-xs text-[var(--muted)] mt-1">Slug: {slugify(form.title)}</div>
            )}
            {fieldErrors.title && <div className="text-red-400 text-xs mt-1">{fieldErrors.title}</div>}
          </div>

          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Briefly describe what this workflow does..."
              rows={3}
              className="w-full text-sm"
            />
            {fieldErrors.description && <div className="text-red-400 text-xs mt-1">{fieldErrors.description}</div>}
          </div>

          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full text-sm"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {fieldErrors.category && <div className="text-red-400 text-xs mt-1">{fieldErrors.category}</div>}
          </div>

          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">Tags (comma-separated, optional)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="e.g. facebook, ads, copywriting"
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--muted)] block mb-1">Workflow Content (Markdown) *</label>
            <textarea
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
              placeholder={`Write your workflow prompt here.\n\nUse {{variable_name}} for user inputs.\nUse {{var || default}} for optional inputs with defaults.`}
              rows={12}
              className="w-full text-sm font-mono"
            />
            {fieldErrors.content && <div className="text-red-400 text-xs mt-1">{fieldErrors.content}</div>}
          </div>

          <hr className="border-[var(--border)]" />

          <div className="space-y-2">
            <div className="text-xs text-[var(--muted)]">Submitter info (optional)</div>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Your name"
              className="w-full text-sm"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="Your email"
              className="w-full text-sm"
            />
          </div>

          <div>
            <Turnstile
              sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || "1x00000000000000000000AA"}
              onVerify={(token) => setTurnstileToken(token)}
              theme="dark"
            />
          </div>

          {error && <div className="text-red-400 text-xs">{error}</div>}

          <div className="flex gap-2">
            <button type="button" onClick={handlePreview} disabled={!form.title.trim() || !form.description.trim() || !form.content.trim()}>
              Preview
            </button>
            <button type="submit" disabled={!turnstileToken || submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      )}

      {step === "preview" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setStep("form")}>Edit</button>
            <button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Confirm & Submit"}
            </button>
          </div>
          <pre className="border border-[var(--border)] p-4 text-sm whitespace-pre-wrap overflow-x-auto">{previewMarkdown}</pre>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="text-[var(--accent)]">✓ Submission received. Awaiting admin review.</div>
          <div className="text-xs text-[var(--muted)]">
            Your workflow has been saved to the pending queue.
          </div>
          <div className="flex gap-3">
            <button onClick={handleReset} className="bg-transparent border border-[var(--accent)] text-[var(--accent)]">
              Submit Another
            </button>
            <Link href="/" className="text-[var(--accent)] text-sm self-center">Back to terminal</Link>
          </div>
        </div>
      )}
    </div>
  );
}
