export type SearchIntent = "prompt" | "workflow" | "tool";

export type IntentResult = {
  intent: SearchIntent;
  confidence: number;
  reasons: string[];
};

const PROMPT_KEYWORDS = [
  "prompt", "prompting", "template", "write", "writing",
  "copy", "paste", "draft", "compose", "author",
];

const WORKFLOW_KEYWORDS = [
  "workflow", "automation", "pipeline", "process", "step",
  "workflows", "automate", "orchestrate", "chain",
];

const TOOL_KEYWORDS = [
  "tool", "app", "builder", "generator", "maker",
  "easy", "simple", "quick", "generate", "create",
  "build", "constructor", "studio",
];

const INTENT_MAP: [string[], SearchIntent][] = [
  [TOOL_KEYWORDS, "tool"],
  [WORKFLOW_KEYWORDS, "workflow"],
  [PROMPT_KEYWORDS, "prompt"],
];

export function classifyIntent(query: string): IntentResult {
  const lower = query.toLowerCase().trim();
  if (!lower) return { intent: "prompt", confidence: 0, reasons: ["empty query"] };

  const words = lower.split(/[\s,.-]+/).filter(Boolean);
  const reasons: string[] = [];

  const scores: Record<SearchIntent, number> = { prompt: 0, workflow: 0, tool: 0 };

  for (const word of words) {
    for (const [keywords, intent] of INTENT_MAP) {
      if (keywords.includes(word)) {
        scores[intent]++;
        reasons.push(`match:${word}->${intent}`);
      }
    }
  }

  const phrases = ["i want to", "i need", "looking for", "find me"];
  for (const phrase of phrases) {
    if (lower.startsWith(phrase)) {
      scores.prompt += 0.5;
      reasons.push("phrase:natural-language");
      break;
    }
  }

  let intent: SearchIntent = "prompt";
  let maxScore = scores.prompt;

  if (scores.workflow > maxScore) {
    intent = "workflow";
    maxScore = scores.workflow;
  }
  if (scores.tool > maxScore) {
    intent = "tool";
    maxScore = scores.tool;
  }

  const totalSignal = scores.prompt + scores.workflow + scores.tool || 1;
  const confidence = Math.min(
    (maxScore + (totalSignal > 0 ? 0.1 : 0)) / Math.max(totalSignal, 1),
    1,
  );

  return { intent, confidence, reasons };
}
