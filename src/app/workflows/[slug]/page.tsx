import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadWorkflowIndex, loadWorkflowContent, loadSEOIndex, loadExpandedContent } from "@/lib/load-index";
import type { WorkflowMeta } from "@/lib/workflows";
import { loadAllSettings } from "@/lib/settings";
import WorkflowClient from "./workflow-client";

export const dynamicParams = false;

export type RelatedWorkflows = {
  sameCategory: WorkflowMeta[];
  trending: WorkflowMeta[];
  tagMatched: WorkflowMeta[];
};

function computeRelated(all: WorkflowMeta[], slug: string): RelatedWorkflows {
  const current = all.find((w) => w.slug === slug);
  if (!current) return { sameCategory: [], trending: [], tagMatched: [] };

  const others = all.filter((w) => w.slug !== slug);
  const sameCategory = others.filter((w) => w.category === current.category).slice(0, 3);
  const trending = [...others]
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    })
    .slice(0, 3);
  const tagMatched = [...others]
    .map((w) => ({ w, overlap: w.tags.filter((t) => current.tags.includes(t)).length }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 3)
    .map((x) => x.w);

  return { sameCategory, trending, tagMatched };
}

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const index = loadWorkflowIndex();
  return index.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const workflow = loadWorkflowContent(slug);
  if (!workflow) return { title: "Workflow Not Found" };

  const seo = loadSEOIndex();
  const entry = seo.find((e) => e.slug === slug);

  return {
    title: entry?.title ?? `${workflow.title} — TLOGZ`,
    description: entry?.description ?? workflow.description,
    keywords: entry ? entry.keywords.join(", ") : [...workflow.tags, workflow.category].join(", "),
    openGraph: {
      title: entry?.title ?? workflow.title,
      description: entry?.description ?? workflow.description,
      type: "article",
      publishedTime: workflow.updated,
      tags: workflow.tags,
    },
  };
}

export default async function WorkflowPage({ params }: Props) {
  const { slug } = await params;
  const workflow = loadWorkflowContent(slug);
  if (!workflow) notFound();

  const all = loadWorkflowIndex();
  const related = computeRelated(all, slug);
  const expanded = loadExpandedContent(slug);
  const settings = loadAllSettings();

  return <WorkflowClient workflow={workflow} slug={slug} related={related} expanded={expanded} githubRepo={settings.community.githubRepo} issuesUrl={settings.community.issuesUrl} />;
}
