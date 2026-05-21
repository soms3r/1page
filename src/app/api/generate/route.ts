import { NextRequest, NextResponse } from "next/server";
import { slugify } from "@/lib/validator";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type GeneratedWorkflow = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  body: string;
  variables?: { name: string; label: string; required: boolean; placeholder: string }[];
};

function parseAIOutput(text: string): GeneratedWorkflow | null {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = jsonMatch ? jsonMatch[1].trim() : text.trim();
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    if (!parsed.title || !parsed.body) return null;

    return {
      title: String(parsed.title).slice(0, 200),
      description: String(parsed.description || "").slice(0, 500),
      category: String(parsed.category || "other").toLowerCase(),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 10) : [],
      body: String(parsed.body),
      variables: Array.isArray(parsed.variables)
        ? (parsed.variables as { name?: string; label?: string; required?: boolean; placeholder?: string }[])
            .slice(0, 10)
            .map((v) => ({
              name: String(v.name || ""),
              label: String(v.label || String(v.name || "")),
              required: Boolean(v.required),
              placeholder: String(v.placeholder || ""),
            }))
        : undefined,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";

  if (!apiKey) {
    return NextResponse.json({ error: "AI_API_KEY not configured" }, { status: 500 });
  }

  const ip = getClientIp(req);
  const { allowed, resetAt } = rateLimit(`generate:${ip}`);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later.", retryAfter: Math.ceil((resetAt - Date.now()) / 1000) },
      { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);

    const systemPrompt = `You are a workflow generator. Given a user prompt, generate a structured AI workflow in JSON format.

Output ONLY valid JSON wrapped in \`\`\`json ... \`\`\` blocks with these fields:
{
  "title": "short descriptive title",
  "description": "1-2 sentence description",
  "category": "marketing|development|writing|design|business|other",
  "tags": ["tag1", "tag2", "tag3"],
  "body": "Full markdown workflow template. Use {{variableName}} for placeholders. Include clear instructions, examples, and output format.",
  "variables": [
    { "name": "variableName", "label": "User-friendly label", "required": true, "placeholder": "example value" }
  ]
}

Rules:
- body must be valid markdown with at least 100 characters
- Use {{var}} or {{var || fallback}} syntax for placeholders
- Include at least 1 variable if the body has placeholders
- Category must be exactly one of: marketing, development, writing, design, business, other
- Tags should be lowercase, 2-6 tags
- Today's date: ${today}`;

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `AI API error: ${res.status} ${errBody.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;

    if (!raw) {
      return NextResponse.json({ error: "Empty AI response" }, { status: 502 });
    }

    const parsed = parseAIOutput(raw);
    if (!parsed || !parsed.title || !parsed.body || parsed.body.length < 50) {
      return NextResponse.json({ error: "AI output was incomplete or invalid" }, { status: 422 });
    }

    const frontmatter = `---
title: "${parsed.title.replace(/"/g, '\\"')}"
slug: "${slugify(parsed.title)}"
description: "${parsed.description.replace(/"/g, '\\"')}"
category: "${parsed.category}"
tags: [${parsed.tags.map((t) => `"${t}"`).join(", ")}]
models:
  best: "gpt-4o"
  good: []
  limited: []
updated: "${today}"
featured: false
locked: false
${parsed.variables && parsed.variables.length > 0
  ? `variables:\n${parsed.variables.map((v) => `  - name: "${v.name}"\n    label: "${v.label}"\n    required: ${v.required}\n    placeholder: "${v.placeholder}"`).join("\n")}`
  : ""}
---

`;

    return NextResponse.json({
      title: parsed.title,
      description: parsed.description,
      category: parsed.category,
      tags: parsed.tags,
      markdown: frontmatter + parsed.body,
      slug: slugify(parsed.title),
    });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
