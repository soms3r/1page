import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { WorkflowMeta } from "../lib/workflows";

const WORKFLOWS_DIR = path.join(process.cwd(), "content", "workflows");
const EXPANDED_DIR = path.join(process.cwd(), "public", "expanded");

function getAllWorkflows(): WorkflowMeta[] {
  if (!fs.existsSync(WORKFLOWS_DIR)) return [];
  const categories = fs.readdirSync(WORKFLOWS_DIR);
  const workflows: WorkflowMeta[] = [];

  for (const category of categories) {
    const categoryPath = path.join(WORKFLOWS_DIR, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(categoryPath, file), "utf-8");
        const parsed = matter(content);
        const data = parsed.data as Record<string, unknown>;
        workflows.push({
          title: String(data.title || ""),
          slug: String(data.slug || ""),
          description: String(data.description || ""),
          category: String(data.category || ""),
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          models: {
            best: String((data.models as Record<string, unknown>)?.best || ""),
            good: Array.isArray((data.models as Record<string, unknown>)?.good)
              ? ((data.models as Record<string, unknown>).good as string[]).map(String) : [],
            limited: Array.isArray((data.models as Record<string, unknown>)?.limited)
              ? ((data.models as Record<string, unknown>).limited as string[]).map(String) : [],
          },
          updated: String(data.updated || ""),
          featured: Boolean(data.featured),
          locked: Boolean(data.locked),
        });
      } catch {
        // skip
      }
    }
  }
  return workflows;
}

function buildHowToUse(w: WorkflowMeta): string[] {
  return [
    `Open the ${w.title} workflow in your AI chat interface.`,
    `Replace the variables in [brackets] with your specific inputs.`,
    `For best results, use ${w.models.best || "a capable AI model"} as the target model.`,
    `Review the generated output and iterate by refining your inputs.`,
    `Save your final result and share it with your team.`,
  ];
}

function buildBestUseCases(w: WorkflowMeta): string[] {
  const cases: string[] = [
    `Quickly generate ${w.category}-specific content with structured prompts.`,
    `Standardize ${w.category} workflows across your team using a shared template.`,
    `Onboard new team members with a repeatable ${w.category} process.`,
  ];
  for (const tag of w.tags.slice(0, 3)) {
    cases.push(`Automate ${tag} tasks with AI-powered ${w.category} workflows.`);
  }
  return cases;
}

function buildExamples(w: WorkflowMeta): string[] {
  return [
    `Use ${w.title} to create a ${w.tags[0] || "sample"} project from scratch.`,
    `Adapt ${w.title} for a different ${w.category} domain with custom variables.`,
    `Combine ${w.title} with other workflows in the ${w.category} category for a complete pipeline.`,
    `Run ${w.title} with multiple AI models to compare output quality.`,
    `Schedule ${w.title} as a recurring ${w.category} task.`,
  ];
}

function buildVariations(w: WorkflowMeta): string[] {
  const vars: string[] = [
    `Simplified version: remove optional variables for faster results.`,
    `Advanced version: add custom validation steps after generation.`,
    `Batch version: run ${w.title} on multiple inputs sequentially.`,
  ];
  for (const tag of w.tags.slice(0, 2)) {
    vars.push(`${tag}-focused variant: emphasize ${tag} best practices in the prompt.`);
  }
  return vars;
}

function buildCommonMistakes(w: WorkflowMeta): string[] {
  const mistakes: string[] = [
    "Skipping variable customization — always replace [bracketed] placeholders.",
    "Using the wrong AI model tier for complex outputs.",
    "Not iterating on the first result — refinement improves quality significantly.",
  ];
  if (w.tags.length > 0) {
    mistakes.push(`Ignoring ${w.tags[0]} best practices when customizing the prompt.`);
  }
  if (w.models.best) {
    mistakes.push(`Using ${w.models.best} outside its optimal use case for this workflow.`);
  }
  return mistakes;
}

function build() {
  const workflows = getAllWorkflows();
  if (!fs.existsSync(EXPANDED_DIR)) {
    fs.mkdirSync(EXPANDED_DIR, { recursive: true });
  }

  let count = 0;
  for (const w of workflows) {
    const content = {
      slug: w.slug,
      howToUse: buildHowToUse(w),
      bestUseCases: buildBestUseCases(w),
      examples: buildExamples(w),
      variations: buildVariations(w),
      commonMistakes: buildCommonMistakes(w),
    };
    fs.writeFileSync(path.join(EXPANDED_DIR, `${w.slug}.json`), JSON.stringify(content, null, 2));
    count++;
  }
  console.log(`Content expansion built: ${count} workflows`);
}

build();
