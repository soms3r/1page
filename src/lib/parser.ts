import matter from "gray-matter";
import type { WorkflowMeta, WorkflowVariable } from "./workflows";

type ParsedWorkflow = {
  meta: WorkflowMeta;
  body: string;
  variables?: WorkflowVariable[];
};

export function parseWorkflow(content: string): ParsedWorkflow | null {
  try {
    const parsed = matter(content);
    const data = parsed.data as Record<string, unknown>;

    const meta: WorkflowMeta = {
      title: String(data.title || ""),
      slug: String(data.slug || ""),
      description: String(data.description || ""),
      category: String(data.category || ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      models: {
        best: String((data.models as Record<string, unknown>)?.best || ""),
        good: Array.isArray((data.models as Record<string, unknown>)?.good)
          ? ((data.models as Record<string, unknown>).good as string[]).map(String)
          : [],
        limited: Array.isArray((data.models as Record<string, unknown>)?.limited)
          ? ((data.models as Record<string, unknown>).limited as string[]).map(String)
          : [],
      },
      updated: String(data.updated || ""),
      featured: Boolean(data.featured),
      locked: Boolean(data.locked),
    };

    const variables = Array.isArray(data.variables)
      ? (data.variables as WorkflowVariable[]).map((v) => ({
          name: String(v.name),
          label: String(v.label),
          required: Boolean(v.required),
          placeholder: String(v.placeholder),
        }))
      : undefined;

    return { meta, body: parsed.content, variables };
  } catch {
    return null;
  }
}
