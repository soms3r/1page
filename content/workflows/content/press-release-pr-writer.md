---
title: "Press Release & PR Statement Writer"
slug: "press-release-pr-writer"
description: "Write professional press releases, media statements, and PR announcements following journalistic standards."
category: "content"
tags:
  - press-release
  - public-relations
  - media
  - announcements
models:
  best: "gpt-4o"
  good:
    - "claude-sonnet-4"
    - "gemini-2.5-pro"
  limited:
    - "claude-haiku"
    - "gpt-4o-mini"
updated: "2026-05-22"
featured: true
variables:
  - name: announcementType
    label: Announcement Type
    required: true
    placeholder: "e.g. Product launch, funding round, partnership, executive hire"
  - name: companyName
    label: Company Name
    required: true
    placeholder: "e.g. TechNova Inc."
  - name: keyMessage
    label: Key Message
    required: true
    placeholder: "e.g. Raised $10M Series A to expand AI platform"
  - name: spokesperson
    label: Spokesperson Name & Title
    required: false
    placeholder: "e.g. Jane Doe, CEO"
  - name: location
    label: Location / Dateline
    required: false
    placeholder: "e.g. San Francisco, CA"
  - name: quote
    label: Quote from Leadership
    required: false
    placeholder: "e.g. This funding validates our vision..."
easyMode:
  enabled: true
  fields:
    - name: announcementType
      type: select
      options: ["Product launch", "Funding round", "Partnership", "Executive hire", "Company milestone"]
      label: Announcement Type
    - name: companyName
      type: text
      label: Company Name
      placeholder: "e.g. TechNova Inc."
    - name: keyMessage
      type: text
      label: One-line announcement
      placeholder: "e.g. Raised $10M Series A"
    - name: industry
      type: text
      label: Industry
      placeholder: "e.g. AI, Fintech, Health"
  template: "You are a PR professional. Write a {{announcementType}} press release for {{companyName}} in the {{industry}} industry. Key message: {{keyMessage}}. Include: embargo info (if any), dateline, headline, subheadline, body with quotes, boilerplate, and media contact details. Follow AP style."
---

You are a public relations professional. Write a press release following journalistic standards.

**Announcement Type**: {{announcementType}}
**Company**: {{companyName}}
**Key Message**: {{keyMessage}}
**Spokesperson**: {{spokesperson || "Company leadership"}}
**Location**: {{location || "[City], [State]"}}
**Quote Available**: {{quote || "Not provided — suggest one"}}

## Press Release Structure

### FOR IMMEDIATE RELEASE
*Or* EMBARGOED UNTIL [date/time]

### Headline (under 90 chars)
[Company Name] [Announcement Verb] [What] [Key Detail]

### Subheadline (under 140 chars)
Supporting detail that adds context or a key stat.

### Dateline
[City, State] — [Date] — [Company Name] today announced...

### Body Paragraph 1 (The Lead)
Answer the 5 Ws in the first paragraph:
- **Who**: {{companyName}} and relevant parties
- **What**: {{keyMessage}}
- **When**: Effective date or announcement date
- **Where**: {{location || "Global/market-specific"}}
- **Why**: Strategic rationale or customer need

### Body Paragraph 2 (The Context)
Additional detail about {{announcementType}}:
- How this fits into company strategy
- Market context or industry trend
- Customer or market demand driving this

### Quote Block
"{{quote || "[Insert compelling quote from {{spokesperson}} about the significance of this announcement]"}}" — {{spokesperson}}, [Title] at {{companyName}}

### Body Paragraph 3 (The Details)
- Specific features, terms, or numbers
- Timeline, availability, or next steps
- Third-party validation (analyst quote, partner endorsement)

### Boilerplate (About {{companyName}})
One paragraph describing:
- Company mission and focus
- Key differentiators
- Year founded, headquarters, team size
- Link to website

### Media Contact
```
**Media Contact**:
[Name], [Title]
[Email]
[Phone]
[Website]
```

### Distribution Notes
- **Wire service**: Associated Press, PRWeb, BusinessWire
- **Target outlets**: Industry-specific publications and local media
- **Multimedia**: Suggested images, videos, or infographics to accompany

### Social Media Kit
Pre-written posts for announcement day:
- **LinkedIn**: Professional announcement with link
- **Twitter/X**: Short version with relevant hashtags
- **Thread**: Multi-post breakdown for longer story

Output with **bold** section headers, --- between sections, and AP style formatting throughout. End with ### for the release.
