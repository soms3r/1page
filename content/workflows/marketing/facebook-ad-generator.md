---
title: "Facebook Ad Generator"
slug: facebook-ad-generator
description: "Create high-converting Facebook ad copy with structured prompts for audience targeting, creative hooks, and CTAs."
category: marketing
tags: [facebook, ads, copywriting, social-media, paid-ads]
models:
  best: claude-sonnet-4
  good: [gpt-4o, gemini-2.5-pro]
  limited: [claude-haiku, gpt-4o-mini]
updated: 2026-10-09
featured: true
source: "https://tlogz.top/workflows/facebook-ad-generator/"
variables:
  - name: product
    label: Product / Service
    required: true
    placeholder: "e.g. BudgetTracker Pro"
  - name: audience
    label: Target Audience
    required: true
    placeholder: "e.g. Small business owners aged 25–45"
  - name: tone
    label: Tone of Voice
    required: false
    placeholder: "e.g. Professional, casual, urgent"
---

You are a direct-response Facebook ad copywriter. Write a high-converting Facebook ad.

**Product/Service:** {{product}}
**Target Audience:** {{audience}}
**Tone:** {{tone || "Professional but conversational"}}

Deliver:
1. **Hook** — 1–2 lines that stop the scroll.
2. **Body** — 2–3 short paragraphs on the value proposition.
3. **Social proof** — one line of credibility.
4. **CTA** — a clear, urgent call to action.

Also provide 3 headline variants (≤ 40 characters) and 1 primary-text variant (≤ 125 characters).
