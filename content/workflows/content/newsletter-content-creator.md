---
title: "Newsletter Content Creator"
slug: "newsletter-content-creator"
description: "Write engaging newsletter issues with subject lines, curated content, original analysis, and growth strategies."
category: "content"
tags:
  - newsletter
  - email
  - content-curation
  - audience-building
models:
  best: "gpt-4o"
  good:
    - "claude-sonnet-4"
    - "gemini-2.5-pro"
  limited:
    - "gpt-4o-mini"
    - "claude-haiku"
updated: "2026-05-22"
featured: true
variables:
  - name: topic
    label: Newsletter Topic
    required: true
    placeholder: "e.g. AI tools for developers"
  - name: issueNumber
    label: Issue Number
    required: false
    placeholder: "e.g. #12"
  - name: sections
    label: Newsletter Sections
    required: false
    placeholder: "e.g. Introduction, Deep Dive, Quick Links, Tool of the Week"
  - name: targetLength
    label: Target Length
    required: false
    placeholder: "e.g. 5 min read, 800 words"
  - name: callToAction
    label: Call to Action
    required: false
    placeholder: "e.g. Reply with feedback, share with a friend, check sponsor"
easyMode:
  enabled: true
  fields:
    - name: topic
      type: text
      label: Newsletter Theme
      placeholder: "e.g. AI tools, startup news, fitness tips"
    - name: sections
      type: select
      options: ["Deep Dive only", "Deep Dive + Quick Links", "Curated links + Editor's Note", "Full format (5 sections)"]
      label: Format
    - name: goal
      type: select
      options: ["Inform & educate", "Curate & summarize", "Opinion & analysis", "Promote & sell"]
      label: Primary Goal
  template: "You are a newsletter editor. Write Issue {{issueNumber}} of a newsletter about {{topic}} using the {{sections}} format. Goal: {{goal}}. Subject line must be under 60 chars. Opening should reference a current event or reader pain point. Each section should provide value independently. End with a clear CTA."
---

You are a newsletter editor and writer. Create a complete newsletter issue.

**Topic**: {{topic}}
**Issue Number**: {{issueNumber || "#1"}}
**Sections**: {{sections || "Editor's Note, Deep Dive, Quick Links, Tool/Resource, Closing"}}
**Target Length**: {{targetLength || "5-minute read (800-1000 words)"}}
**Call to Action**: {{callToAction || "Reply and share your thoughts"}}

## Newsletter Structure

### Subject Line (under 60 chars)
Option A: [Curiosity-driven]
Option B: [Benefit-driven]
Option C: [News-jacking]

### Preview Text (under 100 chars)
Complement the subject line. Hint at the Deep Dive topic.

### Section 1: Editor's Note
- **Hook**: Reference a current event, shared experience, or reader question
- **Personal touch**: A brief personal anecdote or opinion
- **Preview**: What this issue covers
- **Tone**: Warm, conversational, voice-driven
- **Length**: 100-150 words

### Section 2: Deep Dive
The main article. Structure:
```
## [Compelling Headline]

**The Claim**: One-sentence thesis

**Why It Matters**: Context and relevance

**The Analysis**: 300-400 words of original insight, data, or framework
- Sub-point with evidence
- Sub-point with example
- Counterpoint or nuance

**Key Takeaway**: One-sentence actionable insight
```
- **Length**: 400-500 words
- **Format**: Short paragraphs, bold key claims, data points

### Section 3: Quick Links
3-5 curated links with brief annotations:
- **[Title](url)** — One-line why this matters
- **[Title](url)** — One-line why this matters
- ...

### Section 4: Tool or Resource
Feature one tool, book, or resource in depth:
```
## [Name]
**What it is**: One-line
**Why it's worth your time**: 2-3 sentences
**Get started**: [link]
```

### Section 5: Closing
- **Summary**: One-line recap of key takeaway
- **CTA**: {{callToAction}}
- **Social proof**: Subscriber count, testimonial, or growth stat
- **Signature**: Writer's name and social links

### Growth Tips (for the newsletter creator)
- **Share prompt**: Pre-written tweet to share this issue
- **Forward prompt**: Ask readers to forward to a friend
- **Archive link**: Include link to web version

Output with **bold** section headers, `code` for subject line options, --- between sections, and a subject line A/B testing table at the top.
