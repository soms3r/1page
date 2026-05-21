import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllWorkflows, getWorkflowBySlug } from "@/lib/workflows";
import type { WorkflowMeta } from "@/lib/workflows";
import { loadSEOIndex, loadExpandedContent } from "@/lib/load-index";
import type { SEOEntry } from "@/lib/load-index";
import WorkflowClient from "./workflow-client";

export type RelatedWorkflows = {
  sameCategory: WorkflowMeta[];
  trending: WorkflowMeta[];
  tagMatched: WorkflowMeta[];
};

function computeRelated(all: WorkflowMeta[], slug: string): RelatedWorkflows {
  const current = all.find((w) => w.slug === slug);
  if (!current) return { sameCategory: [], trending: [], tagMatched: [] };

  const others = all.filter((w) => w.slug !== slug);

  const sameCategory = others
    .filter((w) => w.category === current.category)
    .slice(0, 3);

  const trending = [...others]
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    })
    .slice(0, 3);

  const tagMatched = [...others]
    .map((w) => ({
      w,
      overlap: w.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 3)
    .map((x) => x.w);

  return { sameCategory, trending, tagMatched };
}

function getSEOForSlug(slug: string, seo: SEOEntry[]): SEOEntry | undefined {
  return seo.find((e) => e.slug === slug);
}

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const workflows = getAllWorkflows();
  return workflows.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const workflow = getWorkflowBySlug(slug);

  if (!workflow) return { title: "Workflow Not Found" };

  const seo = loadSEOIndex();
  const entry = getSEOForSlug(slug, seo);

  return {
    title: entry?.title ?? `${workflow.title} — 1 Page`,
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
  const workflow = getWorkflowBySlug(slug);

  if (!workflow) {
    notFound();
  }

  const all = getAllWorkflows();
  const related = computeRelated(all, slug);
  const expanded = loadExpandedContent(slug);

  return <WorkflowClient workflow={workflow} slug={slug} related={related} expanded={expanded} />;
}
