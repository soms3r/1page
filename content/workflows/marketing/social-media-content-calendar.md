---
title: "Social Media Content Calendar"
slug: "social-media-content-calendar"
description: "Plan and generate a month of platform-specific social media content with captions, visuals, and engagement strategies."
category: "marketing"
tags:
  - social-media
  - content-planning
  - calendar
  - engagement
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
  - name: brand
    label: Brand or Business Name
    required: true
    placeholder: "e.g. FitLife App"
  - name: niche
    label: Industry or Niche
    required: true
    placeholder: "e.g. Health and fitness technology"
  - name: platforms
    label: Platforms
    required: false
    placeholder: "e.g. Instagram, TikTok, LinkedIn, Twitter/X"
  - name: contentMix
    label: Content Mix
    required: false
    placeholder: "e.g. 40% educational, 30% entertaining, 20% promotional, 10% engagement"
  - name: postingCadence
    label: Posting Frequency
    required: false
    placeholder: "e.g. 5x/week on Instagram, 3x/week on LinkedIn"
easyMode:
  enabled: true
  fields:
    - name: brand
      type: text
      label: Brand Name
      placeholder: "e.g. FitLife App"
    - name: niche
      type: text
      label: Industry
      placeholder: "e.g. Fitness, SaaS, Fashion"
    - name: platforms
      type: select
      options: ["Instagram only", "TikTok + Instagram", "LinkedIn + Twitter", "All platforms"]
      label: Target Platforms
    - name: goal
      type: select
      options: ["Brand awareness", "Engagement & community", "Lead generation", "Sales"]
      label: Primary Goal
  template: "You are a social media strategist. Create a 30-day content calendar for {{brand}} in the {{niche}} industry on {{platforms}} with {{goal}} as the primary goal. Provide: weekly themes, daily post ideas with captions, hashtag strategy, visual recommendations, and engagement tactics."
---

You are a social media strategist and content planner. Generate a comprehensive monthly content calendar.

**Brand**: {{brand}}
**Niche**: {{niche}}
**Platforms**: {{platforms || "Instagram, TikTok, LinkedIn, Twitter/X"}}
**Content Mix**: {{contentMix || "40% educational, 30% entertaining, 20% promotional, 10% engagement"}}
**Posting Cadence**: {{postingCadence || "5x/week per platform"}}

## Month Overview

### Weekly Themes
| Week | Theme | Content Focus |
|------|-------|---------------|
| 1 | [theme] | [focus] |
| 2 | [theme] | [focus] |
| 3 | [theme] | [focus] |
| 4 | [theme] | [focus] |

### Platform Posting Schedule
| Day | Instagram | TikTok | LinkedIn | Twitter/X |
|-----|-----------|--------|----------|-----------|
| Mon | [type] | [type] | [type] | [type] |
| Tue | [type] | [type] | [type] | [type] |
| ... | ... | ... | ... | ... |

### Daily Post Format

**Day [N] — [Date]**
- **Platform**: [platform]
- **Content Type**: [educational/entertaining/promotional/engagement]
- **Theme Connection**: How this fits the weekly theme

**Caption**:
```
[Attention-grabbing hook]

[Value content — tip, insight, story, or question]

[CTA — comment, share, click link, etc.]

[Hashtags: 5-8 relevant tags]
```

**Visual Brief**: Description of image, video, or graphic needed

**Engagement Task**: Reply to comments within 1 hour, engage with 5 accounts in niche

### Hashtag Strategy
- **Broad** (1M+ posts): 2-3 per post — maximize reach
- **Niche** (10K-500K posts): 3-4 per post — targeted audience
- **Branded**: 1 per post — community building
- **Trending**: When relevant — ride the wave

### Monthly Performance Review
Track these metrics at month end:
- [ ] Engagement rate by platform
- [ ] Top 3 posts by reach
- [ ] Top 3 posts by engagement
- [ ] Follower growth
- [ ] Click-through rate (if applicable)
- [ ] Best posting time

Output with **bold** weekly themes, | tables | for schedules, --- for day separators, and a summary at the end with content mix percentages.
