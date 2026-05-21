"use client";

import { useEffect, useState } from "react";
import Link from "@/components/app-link";
import { trackPageView } from "@/lib/analytics";
import type { WorkflowMeta } from "@/lib/workflows";
import type { PendingSubmission } from "@/app/api/submissions/route";

type UmamiStats = {
  pageviews: number;
  visitors: number;
  topPages: { url: string; pageviews: number }[];
};

export default function AdminPage() {
  const [workflows, setWorkflows] = useState<WorkflowMeta[]>([]);
  const [pending, setPending] = useState<PendingSubmission[]>([]);
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<UmamiStats | null>(null);
  const [tab, setTab] = useState<"submissions" | "workflows" | "create" | "stats">("submissions");
  const [viewing, setViewing] = useState<PendingSubmission | null>(null);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [actionMsg, setActionMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [editorMode, setEditorMode] = useState<"markdown" | "form">("markdown");
  const [newWorkflow, setNewWorkflow] = useState("");
  const [formFields, setFormFields] = useState({
    title: "", slug: "", description: "", category: "other", tags: "", bestModel: "",
  });

  useEffect(() => {
    trackPageView("/admin");
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin")) {
      setAuthed(true);
      loadData();
    } else {
      setError("Invalid password");
    }
  };

  const loadData = async () => {
    try {
      const [wfRes, pendRes] = await Promise.all([
        fetch("/api/workflows"),
        fetch("/api/submissions"),
      ]);
      if (wfRes.ok) setWorkflows(await wfRes.json());
      if (pendRes.ok) {
        const subs: PendingSubmission[] = await pendRes.json();
        setPending(subs);
      }
    } catch {
      // silent
    }
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } catch {
      // silent
    }
  };

  const showMsg = (type: "ok" | "err", text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const startProcessing = (filename: string): boolean => {
    if (processing.has(filename)) return false;
    setProcessing((prev) => new Set(prev).add(filename));
    return true;
  };

  const stopProcessing = (filename: string) => {
    setProcessing((prev) => { const next = new Set(prev); next.delete(filename); return next; });
  };

  const handleApprove = async (filename: string) => {
    if (!startProcessing(filename)) return;
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    stopProcessing(filename);
    const data = await res.json();
    if (res.ok) {
      showMsg("ok", `Approved: ${filename}`);
      loadData();
    } else {
      showMsg("err", data.error || "Approve failed");
    }
  };

  const handleReject = async (filename: string) => {
    if (!startProcessing(filename)) return;
    if (!confirm(`Reject "${filename}"?\nThis will move it to /submissions/rejected/.`)) {
      stopProcessing(filename);
      return;
    }
    const res = await fetch("/api/admin/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    stopProcessing(filename);
    if (res.ok) {
      showMsg("ok", `Rejected: ${filename}`);
      loadData();
    } else {
      showMsg("err", "Reject failed");
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/workflows/${slug}`, { method: "DELETE" });
    if (res.ok) {
      showMsg("ok", `Deleted: ${slug}`);
      loadData();
    } else {
      showMsg("err", "Delete failed");
    }
  };

  const handleFeature = async (slug: string, featured: boolean) => {
    const res = await fetch(`/api/admin/workflows/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !featured }),
    });
    if (res.ok) loadData();
  };

  const buildMarkdown = () => {
    const tags = formFields.tags.split(",").map((t) => t.trim()).filter(Boolean);
    return `---
title: "${formFields.title}"
slug: "${formFields.slug}"
description: "${formFields.description}"
category: "${formFields.category}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
models:
  best: "${formFields.bestModel}"
  good: []
  limited: []
updated: "${new Date().toISOString().split("T")[0]}"
featured: false
---

Write your workflow prompt template here.
`;
  };

  const handleCreate = async () => {
    const content = editorMode === "form" ? buildMarkdown() : newWorkflow;
    if (!content.trim()) return;
    const res = await fetch("/api/admin/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setNewWorkflow("");
      setTab("workflows");
      showMsg("ok", "Workflow created");
      loadData();
    } else {
      const data = await res.json();
      showMsg("err", data.error || "Create failed");
    }
  };

  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
  };

  if (!authed) {
    return (
      <div className="space-y-4">
        <div className="text-lg font-bold text-[var(--accent)]">$ admin</div>
        <form onSubmit={handleLogin}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full text-sm" autoFocus />
          {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/" className="text-[var(--accent)] text-sm">&lt; Back</Link>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-lg font-bold text-[var(--accent)]">$ admin</span>
            <span className="text-xs text-[var(--muted)]">
              {workflows.length} workflows · {pending.length} pending
            </span>
          </div>
        </div>
        {stats && (
          <div className="text-xs text-[var(--muted)] text-right space-y-0.5">
            <div>{stats.visitors} visitors</div>
            <div>{stats.pageviews} pageviews</div>
          </div>
        )}
      </div>

      {actionMsg && (
        <div className={`text-xs px-3 py-2 border ${actionMsg.type === "ok" ? "border-[var(--accent)] text-[var(--accent)]" : "border-red-400 text-red-400"}`}>
          {actionMsg.text}
        </div>
      )}

      <div className="flex gap-2 text-xs border-b border-[var(--border)] pb-2">
        {(["submissions", "workflows", "create", "stats"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`bg-transparent border px-3 py-1 ${tab === t ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)]"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "submissions" && (
        <section>
          {viewing && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
              <div className="bg-[#0a0a0a] border border-[var(--border)] max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm text-[var(--accent)] font-bold">{viewing.title}</div>
                    <div className="text-xs text-[var(--muted)]">Category: {viewing.category} · By: {viewing.submitter}</div>
                  </div>
                  <button onClick={() => setViewing(null)} className="text-xs border border-[var(--border)] bg-transparent px-2 py-1">Close</button>
                </div>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => { handleApprove(viewing.filename); setViewing(null); }} disabled={processing.has(viewing.filename)} className="text-xs">
                    {processing.has(viewing.filename) ? "Processing..." : "Approve"}
                  </button>
                  <button onClick={() => { handleReject(viewing.filename); setViewing(null); }} disabled={processing.has(viewing.filename)} className="text-xs bg-transparent border border-red-400 text-red-400">
                    {processing.has(viewing.filename) ? "Processing..." : "Reject"}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-3">
                  <span>File: {viewing.filename}</span>
                  <span>·</span>
                  <span>{fmtDate(viewing.submitted)}</span>
                </div>
                <pre className="border border-[var(--border)] p-3 text-xs whitespace-pre-wrap overflow-x-auto max-h-96">{viewing.preview}</pre>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[var(--muted)]">Pending Submissions</span>
            <button onClick={loadData} className="text-xs bg-transparent border border-[var(--border)] px-2 py-0.5">Refresh</button>
          </div>

          {pending.length === 0 && <div className="text-xs text-[var(--muted)]">No pending submissions</div>}

          {pending.map((s) => (
            <div key={s.filename} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] text-sm">
              <div className="flex-1 min-w-0">
                <div className="text-[var(--accent)] truncate">{s.title || s.filename}</div>
                <div className="text-xs text-[var(--muted)] flex gap-2 mt-0.5">
                  <span>{s.category || "—"}</span>
                  {s.submitter && s.submitter !== "anonymous" && <span>by {s.submitter}</span>}
                  {s.submitted && <span>{fmtDate(s.submitted)}</span>}
                </div>
              </div>
              <button onClick={() => setViewing(s)} className="text-xs bg-transparent border border-[var(--border)] px-2 py-1">View</button>
              <button onClick={() => handleApprove(s.filename)} disabled={processing.has(s.filename)} className="text-xs bg-transparent border border-[var(--accent)] text-[var(--accent)] px-2 py-1">
                {processing.has(s.filename) ? "Processing..." : "Approve"}
              </button>
              <button onClick={() => handleReject(s.filename)} disabled={processing.has(s.filename)} className="text-xs bg-transparent border border-red-400 text-red-400 px-2 py-1">
                {processing.has(s.filename) ? "Processing..." : "Reject"}
              </button>
            </div>
          ))}
        </section>
      )}

      {tab === "workflows" && (
        <section>
          <div className="text-sm text-[var(--muted)] mb-2">Published Workflows ({workflows.length})</div>
          {workflows.map((w) => (
            <div key={w.slug} className="flex items-center gap-3 py-2 border-b border-[var(--border)] text-sm">
              <span className="flex-1">
                <Link href={`/workflows/${w.slug}`} className="text-[var(--accent)]">{w.title}</Link>
                <span className="text-[var(--muted)] ml-2">[{w.category}]</span>
                <span className={`ml-2 text-xs ${w.featured ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>{w.featured ? "★" : ""}</span>
              </span>
              <button onClick={() => handleFeature(w.slug, w.featured)} className="text-xs bg-transparent border border-[var(--border)] px-2 py-1">
                {w.featured ? "Unfeature" : "Feature"}
              </button>
              <button onClick={() => handleDelete(w.slug)} className="text-xs bg-transparent border border-red-400 text-red-400 px-2 py-1">Delete</button>
            </div>
          ))}
        </section>
      )}

      {tab === "create" && (
        <section className="space-y-4">
          <div className="text-sm text-[var(--muted)]">Create Workflow</div>
          <div className="flex gap-2 text-xs">
            <button onClick={() => setEditorMode("markdown")} className={`bg-transparent border px-3 py-1 ${editorMode === "markdown" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)]"}`}>Markdown</button>
            <button onClick={() => setEditorMode("form")} className={`bg-transparent border px-3 py-1 ${editorMode === "form" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)]"}`}>Form</button>
          </div>
          {editorMode === "markdown" ? (
            <textarea value={newWorkflow} onChange={(e) => setNewWorkflow(e.target.value)} placeholder={`---\ntitle: \nslug: \ndescription: \n...`} rows={16} className="w-full text-sm font-mono" />
          ) : (
            <div className="space-y-3 border border-[var(--border)] p-4">
              {["title", "slug", "description", "category", "tags", "bestModel"].map((field) => (
                <div key={field}>
                  <label className="text-xs text-[var(--muted)] block mb-1">{field}</label>
                  <input type="text" value={(formFields as Record<string, string>)[field]} onChange={(e) => setFormFields({ ...formFields, [field]: e.target.value })} className="w-full text-sm" />
                </div>
              ))}
              <pre className="border border-[var(--border)] p-2 text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">{buildMarkdown()}</pre>
            </div>
          )}
          <button onClick={handleCreate} disabled={!newWorkflow.trim() && editorMode === "markdown"}>
            Create & Push to GitHub
          </button>
        </section>
      )}

      {tab === "stats" && (
        <section className="space-y-4">
          <div className="text-sm text-[var(--muted)]">Analytics</div>
          {stats ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[var(--border)] p-3"><div className="text-2xl text-[var(--accent)]">{stats.visitors}</div><div className="text-xs text-[var(--muted)]">Visitors</div></div>
                <div className="border border-[var(--border)] p-3"><div className="text-2xl text-[var(--accent)]">{stats.pageviews}</div><div className="text-xs text-[var(--muted)]">Pageviews</div></div>
              </div>
              {stats.topPages && (
                <div>
                  <div className="text-xs text-[var(--muted)] mb-1">Top Pages</div>
                  {stats.topPages.slice(0, 5).map((p) => (
                    <div key={p.url} className="flex justify-between py-1 border-b border-[var(--border)] text-xs">
                      <span>{p.url}</span>
                      <span className="text-[var(--muted)]">{p.pageviews}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-[var(--muted)]">Umami not configured.</div>
          )}
          <div className="text-xs text-[var(--muted)]">Total workflows: {workflows.length}</div>
        </section>
      )}
    </div>
  );
}
