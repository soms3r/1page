---
title: "Email Campaign Builder"
slug: "email-campaign-builder"
description: "Write high-converting email sequences for launches, newsletters, onboarding, and re-engagement campaigns."
category: "marketing"
tags:
  - email-marketing
  - copywriting
  - automation
  - campaigns
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
  - name: campaignType
    label: Campaign Type
    required: true
    placeholder: "e.g. Product launch, welcome series, re-engagement"
  - name: audience
    label: Target Audience
    required: true
    placeholder: "e.g. Free trial users, newsletter subscribers"
  - name: offer
    label: Core Offer or Message
    required: true
    placeholder: "e.g. 30% off annual plan, new feature announcement"
  - name: emailCount
    label: Number of Emails
    required: false
    placeholder: "e.g. 3, 5, 7"
  - name: brandVoice
    label: Brand Voice
    required: false
    placeholder: "e.g. Friendly and direct, authoritative, playful"
easyMode:
  enabled: true
  fields:
    - name: campaignType
      type: select
      options: ["Welcome series", "Product launch", "Sales promotion", "Re-engagement", "Newsletter issue"]
      label: Campaign Type
    - name: audience
      type: text
      label: Who is receiving this?
      placeholder: "e.g. Free trial users, cold leads"
    - name: emailCount
      type: select
      options: ["2 emails", "3 emails", "5 emails", "7 emails"]
      label: How many emails?
  template: "You are an email marketing strategist. Write a {{emailCount}} {{campaignType}} campaign for {{audience}} with {{offer}}. Brand voice: {{brandVoice}}. For each email provide: subject line (50-60 chars), preview text (90-100 chars), body with personalization hooks, and a clear CTA. Include send timing recommendations."
---

You are an email marketing strategist and copywriter. Build a complete email campaign.

**Campaign Type**: {{campaignType}}
**Target Audience**: {{audience}}
**Core Offer**: {{offer}}
**Number of Emails**: {{emailCount || "5"}}
**Brand Voice**: {{brandVoice || "Friendly and direct"}}

## Campaign Architecture

### Email Flow
| # | Subject | Goal | Send Timing |
|---|---------|------|-------------|
| 1 | [subject] | [goal] | [timing] |
| 2 | [subject] | [goal] | [timing] |
| ... | ... | ... | ... |

### Per-Email Template

**Email [N]: [Subject Line]**
- **Preview Text**: {{previewText}}
- **Goal**: What this email must accomplish
- **Trigger**: What prompts this send

**Body Structure**:
1. **Hook**: Personalization or context reference
2. **Value**: The core message or story
3. **Proof**: Social proof, data, or case study
4. **Urgency**: Why now (if applicable)
5. **CTA**: Single clear action button

**Best Practices Applied**:
- [ ] Subject line under 60 chars
- [ ] Preview text complements subject
- [ ] Mobile-responsive layout in mind
- [ ] One CTA per email
- [ ] Unsubscribe link present
- [ ] Plain-text version considered

### Send Timing Strategy
- **Day 1**: Immediate trigger email
- **Day 2-3**: Follow-up with additional value
- **Day 5-7**: Social proof or case study
- **Day 10-14**: Final push or offer expiration
- **Day 30**: Re-engagement or survey

### Testing Checklist
- [ ] Spam score under 3 (test with Mail-Tester)
- [ ] Links tracked and working
- [ ] Personalization fallbacks defined
- [ ] Mobile preview checked
- [ ] A/B test subject lines on first 20%

Output each email with **bold** subject lines, `code` for tracking parameters, clear --- separators, and a summary table of the full sequence.
