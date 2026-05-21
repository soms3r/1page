import type { WorkflowVariable } from "./workflows";

export type ValidationError = {
  field: string;
  message: string;
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}

const VALID_CATEGORIES = [
  "marketing",
  "development",
  "writing",
  "design",
  "business",
  "other",
];

export function validateSlug(slug: string): ValidationError | null {
  if (!slug) return { field: "slug", message: "Slug is required" };
  if (!/^[a-z0-9-]+$/.test(slug))
    return { field: "slug", message: "Slug must be lowercase alphanumeric with hyphens" };
  return null;
}

export function validateWorkflowFrontmatter(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.title) errors.push({ field: "title", message: "Title is required" });
  if (!data.slug) errors.push({ field: "slug", message: "Slug is required" });
  else {
    const slugErr = validateSlug(String(data.slug));
    if (slugErr) errors.push(slugErr);
  }
  if (!data.description) errors.push({ field: "description", message: "Description is required" });
  if (!data.category) errors.push({ field: "category", message: "Category is required" });
  else if (!VALID_CATEGORIES.includes(String(data.category)))
    errors.push({ field: "category", message: `Category must be one of: ${VALID_CATEGORIES.join(", ")}` });
  if (!data.updated) errors.push({ field: "updated", message: "Updated date is required" });

  return errors;
}

export function validateVariables(values: Record<string, string>, variables?: WorkflowVariable[]): ValidationError[] {
  if (!variables) return [];
  const errors: ValidationError[] = [];
  for (const v of variables) {
    if (v.required && !values[v.name]?.trim()) {
      errors.push({ field: v.name, message: `${v.label} is required` });
    }
  }
  return errors;
}
