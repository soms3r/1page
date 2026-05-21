import type { WorkflowMeta } from "./workflows";

export type RankedWorkflow = WorkflowMeta & { score: number };

const DATE_WEIGHT = 0.25;
const FEATURED_WEIGHT = 0.35;
const TAG_POPULARITY_WEIGHT = 0.2;
const REFERENCE_WEIGHT = 0.2;

function parseDate(dateStr: string): number {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function computeTagPopularity(allWorkflows: WorkflowMeta[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const w of allWorkflows) {
    for (const tag of w.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  const max = Math.max(...counts.values(), 1);
  for (const [tag, count] of counts) {
    counts.set(tag, count / max);
  }
  return counts;
}

export function rankWorkflows(workflows: WorkflowMeta[]): RankedWorkflow[] {
  if (workflows.length === 0) return [];

  const tagPopularity = computeTagPopularity(workflows);
  const now = Date.now();
  const maxDate = Math.max(...workflows.map((w) => parseDate(w.updated)), now);
  const maxRef = Math.max(...workflows.map((w) => w.refCount || 0), 1);

  return workflows
    .map((w) => {
      const recency = maxDate > 0 ? parseDate(w.updated) / maxDate : 0;
      const tagScore =
        w.tags.reduce((sum, tag) => sum + (tagPopularity.get(tag) || 0), 0) /
        Math.max(w.tags.length, 1);
      const refScore = (w.refCount || 0) / maxRef;

      const score =
        (w.featured ? FEATURED_WEIGHT : 0) +
        recency * DATE_WEIGHT +
        tagScore * TAG_POPULARITY_WEIGHT +
        refScore * REFERENCE_WEIGHT;

      return { ...w, score };
    })
    .sort((a, b) => b.score - a.score);
}

export function getFeatured(workflows: WorkflowMeta[]): WorkflowMeta[] {
  return workflows.filter((w) => w.featured);
}

export function getLatest(workflows: WorkflowMeta[], count = 10): WorkflowMeta[] {
  return [...workflows]
    .sort((a, b) => parseDate(b.updated) - parseDate(a.updated))
    .slice(0, count);
}

export function getTrending(workflows: WorkflowMeta[], count = 10): RankedWorkflow[] {
  return rankWorkflows(workflows).slice(0, count);
}
