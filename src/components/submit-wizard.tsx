"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type Variable = { name: string; label: string; required: boolean; placeholder: string };

type Settings = {
  community: { githubRepo: string; issuesUrl: string; discussionsUrl: string };
  homepage: { directoryCategories: string[] };
};

const EXAMPLES = [
  {
    label: "Facebook Ad Generator",
    idea: "Generate Facebook ad copy and creative variations for marketing campaigns",
    category: "marketing",
    tags: ["facebook", "ads", "social-media"],
  },
  {
    label: "SEO Blog Writer",
    idea: "Write SEO-optimized blog posts with keyword research and meta descriptions",
    category: "writing",
    tags: ["seo", "blogging", "content"],
  },
  {
    label: "CV Builder",
    idea: "Build professional CVs and resumes tailored to specific job descriptions",
    category: "productivity",
    tags: ["career", "document", "writing"],
  },
  {
    label: "Landing Page Generator",
    idea: "Generate complete landing page code with hero sections, features, and CTAs",
    category: "development",
    tags: ["landing-page", "frontend", "react"],
  },
];

const CATEGORIES = ["development", "marketing", "writing", "design", "business", "research", "education", "productivity", "other"];

const TAG_SUGGESTIONS = ["react", "typescript", "frontend", "backend", "api", "seo", "blogging", "content", "copywriting", "facebook", "ads", "social-media", "email", "design", "ui", "ux", "data", "analysis", "automation", "productivity", "writing"];

const MODELS = ["gpt-4o", "gpt-4o-mini", "claude-sonnet-4", "claude-haiku", "gemini-2.5-pro", "gemini-2.5-flash"];

function classifyIdea(idea: string): { category: string; tags: string[] } {
  const lower = idea.toLowerCase();
  const words = lower.split(/[\s,]+/).filter(Boolean);

  const catKeywords: Record<string, string[]> = {
    development: ["react", "component", "frontend", "typescript", "api", "backend", "code", "programming", "app", "web", "landing"],
    marketing: ["facebook", "ads", "social", "marketing", "campaign", "conversion", "audience", "ad"],
    writing: ["seo", "blog", "content", "copy", "writing", "article", "newsletter", "email", "post"],
    design: ["design", "ui", "ux", "figma", "visual", "layout"],
    business: ["business", "startup", "strategy", "growth", "sales"],
    research: ["research", "analysis", "report", "data"],
    education: ["education", "learning", "course", "tutorial", "lesson"],
    productivity: ["productivity", "automation", "workflow", "task", "cv", "resume", "career"],
  };

  let bestCat = "other";
  let bestScore = 0;
  for (const [cat, kws] of Object.entries(catKeywords)) {
    const score = kws.filter((kw) => words.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  }

  const allKws = new Set(Object.values(catKeywords).flat());
  const matched = [...new Set(words.filter((w) => allKws.has(w)))].slice(0, 5);

  return { category: bestCat, tags: matched };
}

function generateDescription(idea: string): string {
  const t = idea.trim();
  if (!t) return "";
  const prefix = t.length > 80 ? t.slice(0, 77) + "..." : t;
  return `AI workflow to ${prefix.charAt(0).toLowerCase() + prefix.slice(1)}.`;
}

function generateMarkdown(data: {
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  bestModel: string;
  goodModels: string[];
  limitedModels: string[];
  variables: Variable[];
  body: string;
}): string {
  let frontmatter = "---\n";
  frontmatter += `title: "${data.title}"\n`;
  frontmatter += `slug: "${data.slug}"\n`;
  frontmatter += `description: "${data.description}"\n`;
  frontmatter += `category: "${data.category}"\n`;
  frontmatter += `tags:\n`;
  for (const t of data.tags) frontmatter += `  - ${t}\n`;
  frontmatter += `models:\n`;
  frontmatter += `  best: "${data.bestModel}"\n`;
  frontmatter += `  good:\n`;
  for (const m of data.goodModels) frontmatter += `    - "${m}"\n`;
  frontmatter += `  limited:\n`;
  for (const m of data.limitedModels) frontmatter += `    - "${m}"\n`;
  frontmatter += `updated: "${new Date().toISOString().slice(0, 10)}"\n`;
  frontmatter += `featured: false\n`;
  frontmatter += `variables:\n`;
  for (const v of data.variables) {
    frontmatter += `  - name: ${v.name}\n`;
    frontmatter += `    label: "${v.label}"\n`;
    frontmatter += `    required: ${v.required}\n`;
    frontmatter += `    placeholder: "${v.placeholder}"\n`;
  }
  frontmatter += "---\n\n";
  return frontmatter + data.body;
}

export default function SubmitWizard() {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [idea, setIdea] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [tags, setTags] = useState<string[]>([]);
  const [bestModel, setBestModel] = useState("gpt-4o");
  const [goodModels, setGoodModels] = useState<string[]>(["claude-sonnet-4"]);
  const [limitedModels, setLimitedModels] = useState<string[]>(["gpt-4o-mini", "claude-haiku"]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [newVarName, setNewVarName] = useState("");
  const [newVarLabel, setNewVarLabel] = useState("");
  const [newVarRequired, setNewVarRequired] = useState(true);
  const [newVarPlaceholder, setNewVarPlaceholder] = useState("");
  const [token, setToken] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [pubResult, setPubResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    fetch("/settings.json")
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .catch(() => {});
  }, []);

  const repo = settings?.community?.githubRepo || "https://github.com/soms3r/1page";
  const repoPath = repo.replace("https://github.com/", "");
  const [owner, repoName] = repoPath.split("/");

  const autoClassify = (text: string) => {
    const result = classifyIdea(text);
    setCategory(result.category);
    setTags(result.tags);
  };

  const applyExample = (ex: (typeof EXAMPLES)[0]) => {
    setIdea(ex.idea);
    setCategory(ex.category);
    setTags(ex.tags);
    const t = ex.idea.charAt(0).toUpperCase() + ex.idea.slice(1);
    setTitle(t);
    setSlug(toSlug(t));
    setDescription(generateDescription(ex.idea));
  };

  const handleIdeaChange = (val: string) => {
    setIdea(val);
    const t = val.trim();
    if (t) {
      const capitalized = t.charAt(0).toUpperCase() + t.slice(1);
      setTitle(capitalized);
      setSlug(toSlug(capitalized));
      setDescription(generateDescription(val));
    }
    autoClassify(val);
  };

  const addTag = (t: string) => {
    if (t && !tags.includes(t)) setTags([...tags, t]);
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const addVariable = () => {
    if (!newVarName.trim()) return;
    setVariables([
      ...variables,
      {
        name: newVarName.trim(),
        label: newVarLabel.trim() || newVarName.trim(),
        required: newVarRequired,
        placeholder: newVarPlaceholder.trim() || `e.g. ${newVarName.trim()}`,
      },
    ]);
    setNewVarName("");
    setNewVarLabel("");
    setNewVarRequired(true);
    setNewVarPlaceholder("");
  };

  const removeVariable = (i: number) => setVariables(variables.filter((_, idx) => idx !== i));

  const detectedVars = useMemo(() => {
    if (!body) return [];
    const matches = body.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.slice(2, -2)))];
  }, [body]);

  const addDetectedVar = (name: string) => {
    if (!name || variables.some((v) => v.name === name)) return;
    setVariables([...variables, { name, label: name.charAt(0).toUpperCase() + name.slice(1), required: false, placeholder: `e.g. ${name}` }]);
  };

  const markdown = useMemo(
    () =>
      generateMarkdown({
        title,
        slug,
        description,
        category,
        tags,
        bestModel,
        goodModels,
        limitedModels,
        variables,
        body,
      }),
    [title, slug, description, category, tags, bestModel, goodModels, limitedModels, variables, body],
  );

  const totalSteps = 5;

  const nextStep = () => {
    if (step === 1 && !idea.trim()) return;
    if (step === 2 && !category) return;
    setStep(Math.min(step + 1, totalSteps));
  };
  const prevStep = () => setStep(Math.max(step - 1, 1));

  const handlePublish = async () => {
    if (!token.trim() || !owner || !repoName) {
      setPubResult({ ok: false, msg: "GitHub token required" });
      return;
    }
    setPublishing(true);
    setPubResult(null);
    try {
      const path = `content/workflows/${category}/${slug}.md`;
      const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Add workflow: ${title}`,
          content: btoa(markdown),
          branch: "main",
        }),
      });
      if (res.ok) {
        setPubResult({ ok: true, msg: `Workflow published! View on GitHub.` });
      } else {
        const err = await res.json().catch(() => ({}));
        setPubResult({ ok: false, msg: err?.message || `Error: ${res.status}` });
      }
    } catch {
      setPubResult({ ok: false, msg: "Network error. Check your token and try again." });
    } finally {
      setPublishing(false);
    }
  };

  const issueUrl = useMemo(() => {
    const bodyEncoded = encodeURIComponent(
      `## Workflow Submission\n\n### Title\n${title}\n\n### Slug\n${slug}\n\n### Description\n${description}\n\n### Category\n${category}\n\n### Tags\n${tags.join(", ")}\n\n### Prompt Template\n\`\`\`markdown\n${markdown}\n\`\`\``,
    );
    return `${repo}/issues/new?title=${encodeURIComponent(`New workflow: ${title || "Untitled"}`)}&body=${bodyEncoded}`;
  }, [title, slug, description, category, tags, markdown, repo]);

  const downloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "workflow"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progressLabel = [`Step ${step} of ${totalSteps}`];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link href="/" className="text-[var(--accent)] hover:underline">~</Link>
        <span className="text-[var(--muted)]">/</span>
        <span className="text-[var(--accent)]">submit</span>
      </div>

      <div>
        <h1 className="text-xl font-bold text-[var(--accent)]">$ share_workflow.sh</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Turn your idea into a reusable AI workflow in under 2 minutes</p>
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        {Array.from({ length: totalSteps }, (_, i) => (
          <span key={i} className={`${i + 1 === step ? "text-[var(--accent)] font-bold" : i + 1 < step ? "text-[var(--accent)]" : ""}`}>
            {i + 1 < step ? "✓" : i + 1 === step ? `▸${i + 1}` : `${i + 1}`}
            {i < totalSteps - 1 && <span className="mx-1 text-[var(--border)]">—</span>}
          </span>
        ))}
        <span className="ml-2">{progressLabel}</span>
      </div>

      <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--surface)]">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-2">What do you want to create?</p>
              <textarea
                value={idea}
                onChange={(e) => handleIdeaChange(e.target.value)}
                placeholder="e.g. A React component generator that creates TypeScript components with Tailwind..."
                className="w-full h-28 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:border-[var(--accent)] resize-none"
              />
            </div>
            <div>
              <p className="text-xs text-[var(--muted)] mb-3">Start from an example template</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXAMPLES.map((ex) => (
                  <div
                    key={ex.label}
                    className="border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden hover:border-[var(--accent)] transition-colors"
                  >
                    <button
                      onClick={() => { setStep(1); applyExample(ex); }}
                      className="w-full text-left p-4 space-y-3 bg-transparent hover:bg-[var(--hover)] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <span className="text-sm font-bold text-[var(--accent)] block truncate">{ex.label}</span>
                          <p className="text-xs text-[var(--muted)] leading-relaxed">{ex.idea}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--muted)]">{ex.category}</span>
                        <span className="inline-block text-xs font-bold text-black bg-[var(--accent)] px-3 py-1.5 rounded hover:opacity-90 no-underline">
                          Use This Template &rarr;
                        </span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">Title</p>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSlug(toSlug(e.target.value));
                }}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">Slug</p>
              <input
                value={slug}
                onChange={(e) => setSlug(toSlug(e.target.value))}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm font-mono focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">Description</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-20 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:border-[var(--accent)] resize-none"
              />
            </div>
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">Category</p>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:border-[var(--accent)]"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)] mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 text-xs border border-[var(--accent)] text-[var(--accent)] px-2 py-0.5 rounded">
                    #{t}
                    <button onClick={() => removeTag(t)} className="hover:text-red-400">&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {TAG_SUGGESTIONS.filter((t) => !tags.includes(t)).slice(0, 12).map((t) => (
                  <button
                    key={t}
                    onClick={() => addTag(t)}
                    className="text-xs border border-[var(--border)] px-2 py-0.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    +{t}
                  </button>
                ))}
              </div>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addTag(tagInput.trim()); setTagInput(""); }
                }}
                placeholder="type & press enter to add..."
                className="mt-2 w-full px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-xs focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <p className="text-xs text-[var(--muted)] mb-1">Models</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] text-[var(--muted)] mb-1">Best</p>
                  <select value={bestModel} onChange={(e) => setBestModel(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-xs">
                    {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted)] mb-1">Good</p>
                  <select value={goodModels[0] || ""} onChange={(e) => setGoodModels(e.target.value ? [e.target.value] : [])}
                    className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-xs">
                    <option value="">—</option>
                    {MODELS.filter((m) => m !== bestModel).map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted)] mb-1">Limited</p>
                  <select value={limitedModels[0] || ""} onChange={(e) => setLimitedModels(e.target.value ? [e.target.value] : [])}
                    className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-xs">
                    <option value="">—</option>
                    {MODELS.filter((m) => m !== bestModel && m !== goodModels[0]).map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-bold mb-1">Define inputs</p>
              <p className="text-xs text-[var(--muted)] mb-3">What variables will users fill in? Use <code className="text-[var(--accent)]">{`{{double_braces}}`}</code> in your prompt.</p>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`Write your prompt template here.\nUse {{variable_name}} for user inputs.\nUse {{var || default}} for optional inputs with defaults.`}
                className="w-full h-32 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm font-mono focus:border-[var(--accent)] resize-none"
              />
            </div>
            {detectedVars.length > 0 && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-2">Detected variables <span className="text-[10px]">(click to add)</span></p>
                <div className="text-xs flex gap-2 flex-wrap">
                  {detectedVars.map((v) => {
                    const added = variables.some((x) => x.name === v);
                    return (
                      <button
                        key={v}
                        onClick={() => addDetectedVar(v)}
                        disabled={added}
                        className={`border px-2 py-0.5 rounded ${added ? "border-[var(--accent)] text-[var(--accent)] opacity-50 cursor-default" : "border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}
                      >
                        {`{{${v}}}`}{added ? " ✓" : " +"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-[var(--muted)] mb-2">Edit variable details</p>
              <div className="space-y-2">
                {variables.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs border border-[var(--border)] rounded p-2">
                    <span className="text-[var(--accent)] font-mono">{`{{${v.name}}}`}</span>
                    <span className="text-[var(--muted)]">{v.label}</span>
                    <span className={`${v.required ? "text-green-400" : "text-[var(--muted)]"} text-[10px]`}>{v.required ? "required" : "optional"}</span>
                    <button onClick={() => removeVariable(i)} className="ml-auto text-[var(--muted)] hover:text-red-400">&times;</button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 items-end">
                <input value={newVarName} onChange={(e) => setNewVarName(e.target.value)}
                  placeholder="name" className="w-28 px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-xs focus:border-[var(--accent)]" />
                <input value={newVarLabel} onChange={(e) => setNewVarLabel(e.target.value)}
                  placeholder="label" className="w-28 px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-xs focus:border-[var(--accent)]" />
                <input value={newVarPlaceholder} onChange={(e) => setNewVarPlaceholder(e.target.value)}
                  placeholder="placeholder" className="w-32 px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-xs focus:border-[var(--accent)]" />
                <label className="flex items-center gap-1 text-xs text-[var(--muted)]">
                  <input type="checkbox" checked={newVarRequired} onChange={(e) => setNewVarRequired(e.target.checked)} />
                  req
                </label>
                <button onClick={addVariable} className="text-xs border border-[var(--accent)] text-[var(--accent)] px-2 py-1.5 rounded hover:bg-[var(--accent)] hover:text-black">
                  + add
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm font-bold">Preview</p>
            <p className="text-xs text-[var(--muted)]">This is what your workflow file will look like:</p>
            <pre className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 text-xs overflow-x-auto max-h-96 overflow-y-auto">
              {markdown}
            </pre>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <p className="text-sm font-bold">Ready to publish?</p>
            <p className="text-xs text-[var(--muted)]">Choose how you want to share your workflow:</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={downloadMd}
                className="border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)] hover:bg-[var(--hover)] text-left">
                <div className="text-[var(--accent)] font-bold text-sm mb-1">01</div>
                <div className="text-sm font-medium mb-1">Save Draft</div>
                <p className="text-xs text-[var(--muted)]">Download as .md file. Keep it for later or share manually.</p>
              </button>

              <a href={issueUrl} target="_blank" rel="noopener noreferrer"
                className="border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)] hover:bg-[var(--hover)] block">
                <div className="text-[var(--accent)] font-bold text-sm mb-1">02</div>
                <div className="text-sm font-medium mb-1">Submit for Review</div>
                <p className="text-xs text-[var(--muted)]">Open a pre-filled GitHub Issue. We&apos;ll review and publish it.</p>
              </a>

              <div className="border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)] hover:bg-[var(--hover)] text-left">
                <div className="text-[var(--accent)] font-bold text-sm mb-1">03</div>
                <div className="text-sm font-medium mb-1">Publish Directly</div>
                <p className="text-xs text-[var(--muted)] mb-2">Commit to GitHub immediately (requires token).</p>
                {!token && (
                  <input value={token} onChange={(e) => setToken(e.target.value)}
                    placeholder="GitHub token (repo scope)"
                    className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded text-xs focus:border-[var(--accent)]" />
                )}
                {token && (
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="w-full text-xs border border-[var(--accent)] text-[var(--accent)] px-3 py-1.5 rounded hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
                  >
                    {publishing ? "Publishing..." : "Publish Workflow"}
                  </button>
                )}
                {pubResult && (
                  <p className={`mt-2 text-xs ${pubResult.ok ? "text-green-400" : "text-red-400"}`}>{pubResult.msg}</p>
                )}
                {token && !pubResult?.ok && (
                  <p className="mt-1 text-[10px] text-[var(--muted)]">Token stored in memory, cleared on reload.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button onClick={prevStep} disabled={step === 1}
          className="text-xs border border-[var(--border)] px-3 py-1.5 rounded hover:border-[var(--accent)] disabled:opacity-30">
          &larr; Back
        </button>
        {step < totalSteps ? (
          <button onClick={nextStep}
            className="text-xs border border-[var(--accent)] text-[var(--accent)] px-4 py-1.5 rounded hover:bg-[var(--accent)] hover:text-black">
            Next &rarr;
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
