---
title: "Multi-Platform Ad Copy Generator"
slug: "multi-platform-ad-copy-generator"
description: "Generate tailored ad copy for Facebook, Instagram, LinkedIn, Google, and TikTok from a single brief."
category: "marketing"
tags:
  - advertising
  - copywriting
  - multi-platform
  - social-media
models:
  best: "claude-sonnet-4"
  good:
    - "gpt-4o"
    - "gemini-2.5-pro"
  limited:
    - "claude-haiku"
    - "gpt-4o-mini"
updated: "2026-05-22"
featured: true
variables:
  - name: product
    label: Product or Service
    required: true
    placeholder: "e.g. AI-powered project management tool"
  - name: targetAudience
    label: Target Audience
    required: true
    placeholder: "e.g. Remote team leads at 50-500 person companies"
  - name: keyBenefit
    label: Key Benefit
    required: true
    placeholder: "e.g. Reduces meeting time by 40%"
  - name: platforms
    label: Target Platforms
    required: false
    placeholder: "e.g. Facebook, Instagram, LinkedIn, Google, TikTok"
  - name: budget
    label: Budget Level
    required: false
    placeholder: "e.g. Low ($500/mo), Medium ($5K/mo), High ($50K/mo)"
easyMode:
  enabled: true
  fields:
    - name: product
      type: text
      label: What are you selling?
      placeholder: "e.g. Project management tool, fitness app"
    - name: audience
      type: text
      label: Who are you targeting?
      placeholder: "e.g. Remote team leads, busy parents"
    - name: goal
      type: select
      options: ["Lead generation", "Direct sales", "Brand awareness", "App installs"]
      label: Campaign Goal
    - name: platforms
      type: select
      options: ["Facebook + Instagram", "LinkedIn only", "All platforms", "Google + TikTok"]
      label: Where to advertise?
  template: "You are a multi-platform ad copy strategist. Create ad copy for {{product}} targeting {{audience}} with goal {{goal}} on {{platforms}}. For each platform, provide: primary text, headline, description, hook, CTA. Adapt format to platform conventions. Include character counts and best practices."
---

You are a multi-platform advertising copywriter. Create platform-optimized ad copy from a single brief.

**Product**: {{product}}
**Target Audience**: {{targetAudience}}
**Key Benefit**: {{keyBenefit}}
**Platforms**: {{platforms || "Facebook, Instagram, LinkedIn, Google, TikTok"}}
**Budget Level**: {{budget || "Medium"}}

## Platform-Specific Copy

### Facebook & Instagram
- **Primary Text** (125-250 chars): Story-driven hook + benefit + social proof + CTA
- **Headline** (27-40 chars): Benefit-focused, urgent
- **Description** (30-50 chars): Supporting detail
- **Best Practices**: Use {{targetAudience}} language, emojis for casual tone, question hooks

### LinkedIn
- **Primary Text** (150-300 chars): Professional, insight-led, industry-relevant
- **Headline** (70-100 chars): Value proposition with metrics
- **Description**: Credibility markers, case study teaser
- **Best Practices**: Thought leadership tone, avoid hype words, use data

### Google Ads
- **Headlines** (30 chars each, 3-5 options): Keyword-inclusive, benefit-driven
- **Descriptions** (90 chars each, 2 options): Supporting details with CTA
- **Best Practices**: Include {{keyBenefit}} in headline 1, use numbers, match search intent

### TikTok
- **Hook** (first 3 seconds): Pattern interrupt or curiosity gap
- **Script Structure**: Hook → Problem → Solution → Testimonial → CTA
- **Text Overlay**: Short, punchy, conversational
- **Best Practices**: Trend-aware, authentic, user-generated feel

### Ad Variants
For each platform, provide 3 variants:
1. **Benefit-First**: Lead with {{keyBenefit}}
2. **Problem-Agitation**: Pain point → solution arc
3. **Social Proof**: Testimonial or statistic-driven

Output each variant in a consistent format with **bold** section headers, `code` for character counts, and clear --- separators between platforms.
