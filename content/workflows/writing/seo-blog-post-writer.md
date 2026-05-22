---
title: "SEO Blog Post Writer"
slug: "seo-blog-post-writer"
description: "Write search-engine-optimized blog posts with keyword research, headings structure, and meta descriptions."
category: "writing"
tags:
  - seo
  - blogging
  - content
  - copywriting
models:
  best: "gpt-4o"
  good:
    - "claude-sonnet-4"
    - "gemini-2.5-pro"
  limited:
    - "gpt-4o-mini"
    - "claude-haiku"
updated: "2026-05-19"
featured: true
variables:
  - name: topic
    label: Blog Topic
    required: true
    placeholder: "e.g. How to reduce cloud costs in 2026"
  - name: keyword
    label: Primary Keyword
    required: true
    placeholder: "e.g. cloud cost optimization"
  - name: audience
    label: Target Audience
    required: false
    placeholder: "e.g. CTOs, DevOps engineers"
  - name: tone
    label: Tone
    required: false
    placeholder: "e.g. Professional, conversational"
  - name: wordCount
    label: Target Word Count
    required: false
    placeholder: "e.g. 1500"
easyMode:
  enabled: true
  fields:
    - name: keyword
      type: text
      label: Main Keyword
      placeholder: "e.g. cloud cost optimization"
    - name: industry
      type: text
      label: Industry
      placeholder: "e.g. Tech, Health, Finance"
    - name: region
      type: text
      label: Region
      placeholder: "e.g. US, Global, Europe"
  template: "You are an SEO content strategist. Write a blog post outline targeting the keyword \"{{keyword}}\" in the {{industry}} industry for a {{region}} audience. Include: H1 with keyword, 3-5 H2 sections, meta description under 160 chars, LSI keywords, and an SEO-friendly URL slug. Use a professional tone."
---

You are an SEO content strategist and writer. Write a fully optimized blog post.

**Topic**: {{topic}}
**Primary Keyword**: {{keyword}}
**Target Audience**: {{audience || "General tech audience"}}
**Tone**: {{tone || "Professional yet accessible"}}
**Word Count**: {{wordCount || "1200-1500"}}

## SEO Requirements

- Use the primary keyword in: H1, first paragraph, one H2, meta description
- Include 2-3 related LSI keywords naturally
- Write a meta description (max 160 chars)
- Suggest an SEO-friendly URL slug

## Structure

```
# {{topic}}

## Introduction
Hook + keyword context + what the reader will learn

## [Main Section 1]
Research-backed insight with data points

## [Main Section 2]
Practical advice or methodology

## [Main Section 3]
Common mistakes or advanced tips

## Conclusion
Key takeaways + CTA
```

Format the output with proper **markdown headings**, **bold** key terms, and `code` for technical terms.
