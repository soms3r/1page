"use client";

import { useState, useMemo } from "react";
import type { EasyModeConfig } from "@/lib/workflows";

export default function EasyModeModal({
  config, title, onClose, onCopy,
}: {
  config: EasyModeConfig;
  title: string;
  onClose: () => void;
  onCopy?: (text: string) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of config.fields) {
      initial[field.name] = "";
    }
    return initial;
  });
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    let result = config.template;
    result = result.replace(/\{\{(\w+) \|\| (.+?)\}\}/g, (_, key, fallback) =>
      values[key]?.trim() || fallback
    );
    result = result.replace(/\{\{(\w+)\}\}/g, (_, key) =>
      values[key]?.trim() || ""
    );
    return result;
  }, [config.template, values]);

  const allFilled = config.fields.every((f) => values[f.name]?.trim());

  const handleGenerate = () => {
    setGenerated(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    if (onCopy) onCopy(output);
    setTimeout(() => setCopied(false), 2500);
  };

  const updateValue = (name: string, val: string) => {
    setValues((prev) => ({ ...prev, [name]: val }));
    if (generated) setGenerated(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] bg-[var(--surface)] border border-[var(--border)] rounded-t-xl sm:rounded-xl overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between z-10">
          <div>
            <span className="text-xs text-[var(--accent)] font-bold">$ easy_mode.sh</span>
            <h2 className="text-sm font-bold mt-0.5">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs border border-[var(--border)] bg-transparent text-[var(--muted)] px-2 py-1 rounded hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            &times;
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-3">
            {config.fields.map((field) => (
              <div key={field.name}>
                <label className="text-xs text-[var(--muted)] block mb-1">
                  $ {field.label}
                </label>
                {field.type === "select" && field.options ? (
                  <select
                    value={values[field.name]}
                    onChange={(e) => updateValue(field.name, e.target.value)}
                    className="w-full text-sm"
                  >
                    <option value="">Select {field.label.toLowerCase()}...</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    value={values[field.name]}
                    onChange={(e) => updateValue(field.name, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    className="w-full text-sm resize-none h-20"
                  />
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={values[field.name]}
                    onChange={(e) => updateValue(field.name, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    className="w-full text-sm"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!allFilled}
            className="w-full text-sm py-2.5 disabled:opacity-40"
          >
            {generated ? "Regenerate" : "Generate Prompt"}
          </button>

          {generated && (
            <div className="space-y-2 border border-[var(--accent)] rounded-lg p-3 bg-[var(--background)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--accent)] font-bold uppercase tracking-wider">output</span>
                <button
                  onClick={handleCopy}
                  className="text-xs border border-[var(--accent)] bg-transparent text-[var(--accent)] px-2 py-1 rounded"
                >
                  {copied ? "✓ copied" : "copy"}
                </button>
              </div>
              <pre className="text-sm whitespace-pre-wrap overflow-x-auto leading-relaxed text-[var(--foreground)]">
                {output}
              </pre>
            </div>
          )}

          {generated && !copied && (
            <p className="text-[10px] text-[var(--muted)] text-center">
              Copy the prompt above and paste it into your preferred AI model
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
