import fs from "fs";
import path from "path";
import { getAllWorkflows } from "../lib/workflows";
import type { WorkflowMeta } from "../lib/workflows";

const EXPANDED_DIR = path.join(process.cwd(), "content", "expanded");

type Section = string[];

function buildHowToUse(w: WorkflowMeta): Section {
  return [
    `Open the ${w.title} workflow in your AI chat interface.`,
    `Replace the variables in [brackets] with your specific inputs.`,
    `For best results, use ${w.models.best || "a capable AI model"} as the target model.`,
    `Review the generated output and iterate by refining your inputs.`,
    `Save your final result and share it with your team.`,
  ];
}

function buildBestUseCases(w: WorkflowMeta): Section {
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

function buildExamples(w: WorkflowMeta): Section {
  return [
    `Use ${w.title} to create a ${w.tags[0] || "sample"} project from scratch.`,
    `Adapt ${w.title} for a different ${w.category} domain with custom variables.`,
    `Combine ${w.title} with other workflows in the ${w.category} category for a complete pipeline.`,
    `Run ${w.title} with multiple AI models to compare output quality.`,
    `Schedule ${w.title} as a recurring ${w.category} task.`,
  ];
}

function buildVariations(w: WorkflowMeta): Section {
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

function buildCommonMistakes(w: WorkflowMeta): Section {
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

    fs.writeFileSync(
      path.join(EXPANDED_DIR, `${w.slug}.json`),
      JSON.stringify(content, null, 2)
    );
    count++;
  }

  console.log(`Content expansion built: ${count} workflows`);
}

build();
