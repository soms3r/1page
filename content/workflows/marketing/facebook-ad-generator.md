---
title: "Facebook Ad Generator"
slug: "facebook-ad-generator"
description: "Create high-converting Facebook ad copy with structured prompts for audience targeting, creative hooks, and CTAs."
category: "marketing"
tags:
  - facebook
  - ads
  - copywriting
  - social-media
models:
  best: "claude-sonnet-4"
  good:
    - "gpt-4o"
    - "gemini-2.5-pro"
  limited:
    - "claude-haiku"
    - "gpt-4o-mini"
updated: "2026-05-20"
featured: true
locked: true
variables:
  - name: product
    label: Product/Service Name
    required: true
    placeholder: "e.g. BudgetTracker Pro"
  - name: audience
    label: Target Audience
    required: true
    placeholder: "e.g. Small business owners aged 25-45"
  - name: goal
    label: Campaign Goal
    required: true
    placeholder: "e.g. Lead generation"
  - name: tone
    label: Tone of Voice
    required: false
    placeholder: "e.g. Professional, casual, urgent"
  - name: usp
    label: Unique Selling Point
    required: false
    placeholder: "e.g. AI-powered budgeting"
---

You are a Facebook ad copywriting expert. Write a high-converting Facebook ad for the following:

**Product/Service**: {{product}}
**Target Audience**: {{audience}}
**Campaign Goal**: {{goal}}
**Tone**: {{tone || "Professional"}}
**Unique Selling Point**: {{usp || "Not specified"}}

Structure the ad with:
1. **Hook** – First 1-2 lines that stop the scroll
2. **Body** – 2-3 short paragraphs explaining the value proposition
3. **Social Proof** – One line of credibility
4. **Call to Action** – Clear, urgent CTA
5. **Primary Text** – Full ad text version
6. **Headline** – Short headline for the ad creative
7. **Description** – One-line description

Format the output with clear section headers using **bold** markdown.
