"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AllSettings } from "@/lib/settings";
import { validateSection, type ValidationError } from "@/lib/validateSettings";

const TABS = [
  "General", "Homepage", "Social Links", "SEO",
  "Banner", "Footer", "Community", "Donation", "Features",
] as const;

type TabName = (typeof TABS)[number];

const FILE_NAMES: Record<string, string> = {
  General: "site.json",
  Homepage: "homepage.json",
  "Social Links": "social.json",
  SEO: "seo.json",
  Banner: "banner.json",
  Footer: "footer.json",
  Community: "community.json",
  Donation: "donation.json",
  Features: "features.json",
};

const SECTION_KEYS: Record<string, string> = {
  General: "site",
  Homepage: "homepage",
  "Social Links": "social",
  SEO: "seo",
  Banner: "banner",
  Footer: "footer",
  Community: "community",
  Donation: "donation",
  Features: "features",
};

let csrfToken = "";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabName>("General");
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [initialSettings, setInitialSettings] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [rawMode, setRawMode] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [diffContent, setDiffContent] = useState("");
  const diffRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check PHP session via API
    fetch("/admin/api/check.php")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.authenticated) {
          window.location.href = "/admin/login.php";
        } else {
          csrfToken = data.csrf_token || "";
        }
      })
      .catch(() => {
        window.location.href = "/admin/login.php";
      });
  }, [router]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/settings.json");
        if (res.ok) {
          const data: AllSettings = await res.json();
          setSettings(data);
          const jsonStr = JSON.stringify(data, null, 2);
          setInitialSettings(jsonStr);
          setRawJson(jsonStr);
        }
      } catch {
        /* not built yet */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const getCurrentSection = (): Record<string, unknown> => {
    if (!settings) return {};
    const key = SECTION_KEYS[activeTab] as keyof AllSettings;
    return settings[key] as unknown as Record<string, unknown>;
  };

  const updateSection = (path: string, value: unknown) => {
    if (!settings) return;
    const updated = { ...settings };
    const sectionKey = SECTION_KEYS[activeTab] as keyof AllSettings;
    const section = { ...(updated[sectionKey] as unknown as Record<string, unknown>) };
    const keys = path.split(".");
    let obj = section;
    for (let i = 0; i < keys.length - 1; i++) {
      const next = obj[keys[i]] as Record<string, unknown>;
      (obj as Record<string, unknown>)[keys[i]] = { ...next };
      obj = obj[keys[i]] as Record<string, unknown>;
    }
    obj[keys[keys.length - 1]] = value;
    (updated as unknown as Record<string, unknown>)[sectionKey] = section;
    setSettings(updated);
    setRawJson(JSON.stringify(updated, null, 2));
    setValidationErrors([]);
  };

  const buildDiffPreview = (): string => {
    if (!settings) return "";
    const sectionKey = SECTION_KEYS[activeTab];
    if (!sectionKey) return "";
    const raw = settings as unknown as Record<string, unknown>;
    const current = JSON.stringify(raw[sectionKey], null, 2);

    let initial = "";
    try {
      const parsed = JSON.parse(initialSettings) as AllSettings;
      const key = sectionKey as keyof AllSettings;
      initial = JSON.stringify(parsed[key], null, 2);
    } catch {
      initial = current;
    }

    if (current === initial) return "No changes.";
    const beforeLines = initial.split("\n");
    const afterLines = current.split("\n");
    const result: string[] = [];
    const maxLen = Math.max(beforeLines.length, afterLines.length);
    for (let i = 0; i < maxLen; i++) {
      const a = beforeLines[i] ?? "";
      const b = afterLines[i] ?? "";
      if (a !== b) {
        if (a) result.push(`- ${a}`);
        if (b) result.push(`+ ${b}`);
      } else {
        result.push(`  ${a}`);
      }
    }
    return result.join("\n");
  };

  const handlePreview = () => {
    const sectionKey = SECTION_KEYS[activeTab];
    if (!sectionKey || !settings) return;

    const raw = settings as unknown as Record<string, unknown>;
    const sectionContent = JSON.stringify(raw[sectionKey], null, 2);

    if (!sectionContent || sectionContent === "{}" || sectionContent === "[]") {
      showToast("error", "Cannot save empty content.");
      return;
    }

    const result = validateSection(sectionKey, raw[sectionKey]);
    setValidationErrors(result.errors);

    if (!result.valid) {
      showToast("error", `${result.errors.length} validation error(s). Fix before saving.`);
      return;
    }

    const diff = buildDiffPreview();
    setDiffContent(diff);
    setShowDiff(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const sectionKey = SECTION_KEYS[activeTab];
    if (!sectionKey) return;

    const raw = settings as unknown as Record<string, unknown>;
    const sectionContent = JSON.stringify(raw[sectionKey], null, 2);

    if (!sectionContent || sectionContent.trim() === "{}") {
      showToast("error", "Cannot save empty content.");
      setSaving(false);
      setShowDiff(false);
      return;
    }

    try {
      JSON.parse(sectionContent);
    } catch {
      showToast("error", "Invalid JSON — fix before saving.");
      setSaving(false);
      setShowDiff(false);
      return;
    }

    try {
      const res = await fetch("/admin/api/save-settings.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          _csrf_token: csrfToken,
          section: sectionKey,
          data: sectionContent,
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast("success", `${activeTab} settings saved.`);
        if (result.csrf_token) csrfToken = result.csrf_token;
        setInitialSettings(JSON.stringify(settings, null, 2));
        setShowDiff(false);
      } else {
        showToast("error", result.error || "Failed to save.");
        if (result.csrf_token) csrfToken = result.csrf_token;
      }
    } catch {
      showToast("error", "Network error. Could not save settings.");
    }
    setSaving(false);
  };

  const handleConfirmSave = () => {
    handleSave();
  };

  const handleCancelDiff = () => {
    setShowDiff(false);
  };

  const handleExportAll = () => {
    const blob = new Blob([rawJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tlogz-settings-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", "Settings exported.");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data: AllSettings = JSON.parse(text);
        setSettings(data);
        setRawJson(text);
        setValidationErrors([]);
        showToast("success", "Settings loaded from file (not saved to GitHub yet).");
      } catch {
        showToast("error", "Invalid JSON file.");
      }
    };
    input.click();
  };

  const handleGitHubSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/admin/api/github-sync.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ _csrf_token: csrfToken }),
      });
      const result = await res.json();
      if (result.success) {
        showToast("success", result.message);
        if (result.csrf_token) csrfToken = result.csrf_token;
        if (result.commitUrl) window.open(result.commitUrl, "_blank");
      } else {
        showToast("error", result.error || "GitHub sync failed.");
        if (result.csrf_token) csrfToken = result.csrf_token;
      }
    } catch {
      showToast("error", "Network error during GitHub sync.");
    }
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-[var(--muted)] animate-pulse">Loading settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-[var(--muted)]">Could not load settings.</p>
          <p className="text-xs text-[var(--muted)]">Build the site first (<code>npm run build</code>).</p>
          <Link href="/" className="text-sm text-[var(--accent)]">&lt; back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[var(--accent)] font-bold text-sm no-underline flex items-center gap-1.5">
              <span className="text-[var(--muted)]">$</span>TLOGZ
            </Link>
            <span className="text-[10px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setRawMode(!rawMode)}
              className="text-xs text-[var(--muted)] border border-[var(--border)] px-2 py-1 rounded hover:border-[var(--accent)] bg-transparent">
              {rawMode ? "form" : "raw"}
            </button>
            <button onClick={handleExportAll}
              className="text-xs text-[var(--muted)] border border-[var(--border)] px-2 py-1 rounded hover:border-[var(--accent)] bg-transparent">
              export
            </button>
            <button onClick={handleImport}
              className="text-xs text-[var(--muted)] border border-[var(--border)] px-2 py-1 rounded hover:border-[var(--accent)] bg-transparent">
              import
            </button>
            <button onClick={handleGitHubSync} disabled={syncing}
              className="text-xs border border-[var(--border)] text-[var(--muted)] px-2 py-1 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] bg-transparent disabled:opacity-50">
              {syncing ? "syncing..." : "sync ⇡"}
            </button>
            <a href="/admin/logout.php"
              className="text-xs text-[var(--muted)] hover:text-red-400 ml-2 bg-transparent border-0">logout</a>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="w-44 border-r border-[var(--border)] bg-[var(--surface)] shrink-0 hidden sm:block">
          <div className="py-2">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setValidationErrors([]); }}
                className={`w-full text-left px-4 py-2 text-xs transition-colors bg-transparent ${
                  activeTab === tab
                    ? "text-[var(--accent)] bg-[var(--hover)] border-r-2 border-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)]"
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </nav>

        <div className="sm:hidden w-full overflow-x-auto border-b border-[var(--border)]">
          <div className="flex px-2 py-1 gap-1">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => { setActiveTab(tab); setValidationErrors([]); }}
                className={`whitespace-nowrap text-xs px-3 py-1.5 rounded bg-transparent transition-colors ${
                  activeTab === tab ? "text-[var(--accent)] bg-[var(--hover)]" : "text-[var(--muted)]"
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {rawMode ? (
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--accent)]">{activeTab} — raw</h2>
                <div className="text-[10px] text-[var(--muted)]">
                  <code className="text-[var(--accent)]">{FILE_NAMES[activeTab]}</code>
                </div>
              </div>
              <textarea value={rawJson} onChange={(e) => setRawJson(e.target.value)}
                className="w-full h-[50vh] bg-[var(--background)] border border-[var(--border)] rounded p-3 text-xs font-mono focus:border-[var(--accent)] resize-y" />
              <div className="flex gap-2">
                <button onClick={() => {
                    try {
                      const parsed = JSON.parse(rawJson) as AllSettings;
                      setSettings(parsed);
                      setValidationErrors([]);
                      showToast("success", "JSON parsed.");
                    } catch { showToast("error", "Invalid JSON."); }
                  }}
                  className="text-xs border border-[var(--accent)] text-[var(--accent)] px-3 py-1.5 rounded hover:bg-[var(--accent)] hover:text-black bg-transparent">
                  parse
                </button>
                <button onClick={handlePreview} disabled={saving}
                  className="text-xs border border-[var(--border)] text-[var(--muted)] px-3 py-1.5 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] bg-transparent disabled:opacity-50">
                  preview changes
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="text-xs border border-[var(--accent)] bg-[var(--accent)] text-black px-3 py-1.5 rounded disabled:opacity-50">
                  {saving ? "saving..." : "save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 max-w-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--accent)]">{activeTab}</h2>
                <div className="text-[10px] text-[var(--muted)]">
                  <code className="text-[var(--accent)]">{FILE_NAMES[activeTab]}</code>
                </div>
              </div>
              <FormFields section={getCurrentSection()} path="" onChange={updateSection} errors={validationErrors} />
              {validationErrors.length > 0 && (
                <div className="border border-red-500 rounded p-3 bg-red-900/20 space-y-1">
                  <p className="text-xs text-red-400 font-bold">{validationErrors.length} validation error(s):</p>
                  {validationErrors.map((e, i) => (
                    <p key={i} className="text-xs text-red-300"><span className="text-red-400">{e.path}</span> — {e.message}</p>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={handlePreview} disabled={saving}
                  className="text-sm border border-[var(--border)] text-[var(--muted)] px-4 py-2 rounded hover:border-[var(--accent)] hover:text-[var(--accent)] bg-transparent disabled:opacity-50">
                  preview changes
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="text-sm border border-[var(--accent)] bg-[var(--accent)] text-black px-4 py-2 rounded disabled:opacity-50">
                  {saving ? "saving..." : "save"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {showDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={handleCancelDiff}>
          <div ref={diffRef} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--accent)]">Preview — {activeTab}</h3>
              <button onClick={handleCancelDiff} className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] bg-transparent border-0">&times;</button>
            </div>
            <div className="overflow-auto p-5 flex-1">
              {diffContent === "No changes." ? (
                <p className="text-xs text-[var(--muted)]">No changes to preview.</p>
              ) : (
                <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">{diffContent}</pre>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border)]">
              <button onClick={handleCancelDiff}
                className="text-xs border border-[var(--border)] text-[var(--muted)] px-3 py-1.5 rounded hover:border-[var(--accent)] bg-transparent">
                cancel
              </button>
              <button onClick={handleConfirmSave} disabled={saving || diffContent === "No changes."}
                className="text-xs border border-[var(--accent)] bg-[var(--accent)] text-black px-3 py-1.5 rounded disabled:opacity-50">
                {saving ? "saving..." : "confirm & save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded text-xs border shadow-lg z-50 ${
          toast.type === "success"
            ? "bg-green-900 border-green-500 text-green-300"
            : "bg-red-900 border-red-500 text-red-300"
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

function FormFields({
  section, path, onChange, errors,
}: {
  section: Record<string, unknown>;
  path: string;
  onChange: (path: string, value: unknown) => void;
  errors: ValidationError[];
}) {
  const entries = Object.entries(section);
  const errorSet = new Set(errors.map((e) => e.path));
  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => {
        const fullPath = path ? `${path}.${key}` : key;
        const hasError = errorSet.has(fullPath);
        const errMsg = errors.find((e) => e.path === fullPath)?.message;
        if (typeof value === "string") {
          return (
            <div key={fullPath} className="space-y-1">
              <label className="text-xs text-[var(--muted)] block">{labelize(key)}</label>
              <input type="text" value={value} onChange={(e) => onChange(fullPath, e.target.value)}
                className={`w-full px-3 py-2 bg-[var(--background)] border rounded text-sm focus:border-[var(--accent)] ${hasError ? "border-red-500" : "border-[var(--border)]"}`} />
              {hasError && <p className="text-[10px] text-red-400">{errMsg}</p>}
            </div>
          );
        }
        if (typeof value === "boolean") {
          return (
            <div key={fullPath} className="flex items-center gap-3">
              <label className="text-xs text-[var(--muted)]">{labelize(key)}</label>
              <input type="checkbox" checked={value} onChange={(e) => onChange(fullPath, e.target.checked)}
                className="accent-[var(--accent)]" />
            </div>
          );
        }
        if (typeof value === "number") {
          return (
            <div key={fullPath} className="space-y-1">
              <label className="text-xs text-[var(--muted)] block">{labelize(key)}</label>
              <input type="number" value={value} onChange={(e) => onChange(fullPath, Number(e.target.value))}
                className={`w-full px-3 py-2 bg-[var(--background)] border rounded text-sm focus:border-[var(--accent)] ${hasError ? "border-red-500" : "border-[var(--border)]"}`} />
              {hasError && <p className="text-[10px] text-red-400">{errMsg}</p>}
            </div>
          );
        }
        if (Array.isArray(value)) {
          return (
            <div key={fullPath} className="space-y-1">
              <label className="text-xs text-[var(--muted)] block">{labelize(key)}</label>
              <input type="text" value={value.join(", ")}
                onChange={(e) => onChange(fullPath, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="comma-separated values"
                className={`w-full px-3 py-2 bg-[var(--background)] border rounded text-sm focus:border-[var(--accent)] ${hasError ? "border-red-500" : "border-[var(--border)]"}`} />
              {hasError && <p className="text-[10px] text-red-400">{errMsg}</p>}
            </div>
          );
        }
        if (typeof value === "object" && value !== null) {
          const sub = value as Record<string, unknown>;
          if ("label" in sub && "url" in sub && Object.keys(sub).length === 2) {
            return (
              <div key={fullPath} className="space-y-1 border border-[var(--border)] rounded p-3 bg-[var(--background)]">
                <label className="text-xs text-[var(--accent)] block">{labelize(key)}</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[var(--muted)]">Label</span>
                    <input type="text" value={sub.label as string}
                      onChange={(e) => onChange(fullPath, { ...sub, label: e.target.value })}
                      className="w-full px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs focus:border-[var(--accent)]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)]">URL</span>
                    <input type="text" value={sub.url as string}
                      onChange={(e) => onChange(fullPath, { ...sub, url: e.target.value })}
                      className="w-full px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs focus:border-[var(--accent)]" />
                  </div>
                </div>
              </div>
            );
          }
          if ("name" in sub && "url" in sub && Object.keys(sub).length === 2) {
            return (
              <div key={fullPath} className="space-y-1 border border-[var(--border)] rounded p-3 bg-[var(--background)]">
                <label className="text-xs text-[var(--accent)] block">{labelize(key)}</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[var(--muted)]">Name</span>
                    <input type="text" value={sub.name as string}
                      onChange={(e) => onChange(fullPath, { ...sub, name: e.target.value })}
                      className="w-full px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs focus:border-[var(--accent)]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)]">URL</span>
                    <input type="text" value={sub.url as string}
                      onChange={(e) => onChange(fullPath, { ...sub, url: e.target.value })}
                      className="w-full px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs focus:border-[var(--accent)]" />
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div key={fullPath} className="space-y-2 border border-[var(--border)] rounded p-3 bg-[var(--background)]">
              <div className="text-xs text-[var(--accent)] font-medium">{labelize(key)}</div>
              <FormFields section={sub} path={fullPath} onChange={onChange} errors={errors} />
            </div>
          );
        }
        if (value === null) {
          return (
            <div key={fullPath} className="space-y-1">
              <label className="text-xs text-[var(--muted)] block">{labelize(key)}</label>
              <input type="text" value="" onChange={(e) => onChange(fullPath, e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded text-sm focus:border-[var(--accent)]" />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function labelize(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ");
}
