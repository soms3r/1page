export type TemplateVariables = Record<string, string>;

export function renderTemplate(template: string, variables: TemplateVariables): string {
  let result = template;

  result = result.replace(
    /\{\{(\w+) \|\| (.+?)\}\}/g,
    (_, key: string, fallback: string) => variables[key]?.trim() || fallback
  );

  result = result.replace(
    /\{\{(\w+)\}\}/g,
    (_, key: string) => variables[key]?.trim() || ""
  );

  return result;
}

export function extractVariables(template: string): string[] {
  const vars = new Set<string>();

  const withFallback = template.matchAll(/\{\{(\w+) \|\| (.+?)\}\}/g);
  for (const match of withFallback) {
    vars.add(match[1]);
  }

  const withoutFallback = template.matchAll(/\{\{(\w+)\}\}/g);
  for (const match of withoutFallback) {
    vars.add(match[1]);
  }

  return [...vars];
}

export function hasUnfilledRequired(
  variables: TemplateVariables,
  required: string[]
): boolean {
  return required.some((name) => !variables[name]?.trim());
}
