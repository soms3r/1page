---
title: "Competitor & Market Research"
slug: "competitor-market-research"
description: "Analyze competitors, identify market gaps, and generate actionable competitive intelligence reports."
category: "marketing"
tags:
  - market-research
  - competitive-analysis
  - strategy
  - intelligence
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
  - name: industry
    label: Industry or Market
    required: true
    placeholder: "e.g. Project management SaaS"
  - name: competitors
    label: Key Competitors
    required: true
    placeholder: "e.g. Asana, Monday.com, ClickUp, Notion"
  - name: focusArea
    label: Research Focus
    required: false
    placeholder: "e.g. Pricing, features, marketing channels, customer reviews"
  - name: targetCustomer
    label: Target Customer Profile
    required: false
    placeholder: "e.g. Mid-market tech companies, 50-500 employees"
easyMode:
  enabled: true
  fields:
    - name: industry
      type: text
      label: Industry
      placeholder: "e.g. Project management, fitness, fintech"
    - name: competitors
      type: text
      label: Main Competitors (comma-separated)
      placeholder: "e.g. Asana, Monday.com, ClickUp"
    - name: depth
      type: select
      options: ["Quick snapshot (1 page)", "Detailed analysis (5 pages)", "Full deep dive (10+ pages)"]
      label: Report Depth
  template: "You are a market research analyst. Analyze the {{industry}} market with focus on {{competitors}}. Produce a {{depth}} report covering: market positioning, feature comparison, pricing analysis, marketing strategies, customer sentiment, and strategic recommendations."
---

You are a market research analyst. Produce a competitive intelligence report.

**Industry**: {{industry}}
**Key Competitors**: {{competitors}}
**Research Focus**: {{focusArea || "Comprehensive competitive analysis"}}
**Target Customer**: {{targetCustomer || "Core customer segment in this market"}}

## Report Structure

### 1. Market Overview
- **Market Size & Growth**: Estimated TAM, CAGR, key trends
- **Segmentation**: How the market is divided (by price, features, audience)
- **Maturity**: Emerging, growing, mature, or declining
- **Key Trends**: 3-5 trends shaping the industry

### 2. Competitor Profiles
For each competitor:
```
## [Competitor Name]
- **Positioning**: One-line positioning statement
- **Target Audience**: Primary and secondary
- **Pricing Model**: Range and tiers
- **Key Features**: Differentiators and parity features
- **Marketing Channels**: Where they advertise
- **Funding/Size**: Backing and scale indicators
- **Strengths**: 3 things they do well
- **Weaknesses**: 3 vulnerabilities
```

### 3. Feature Comparison Matrix
| Feature | Competitor A | Competitor B | Competitor C |
|---------|-------------|-------------|-------------|
| Feature 1 | ✅ | ❌ | ✅ |
| Feature 2 | ✅ | ✅ | ❌ |
| ... | ... | ... | ... |

### 4. Pricing Analysis
| Tier | Competitor A | Competitor B | Competitor C |
|------|-------------|-------------|-------------|
| Entry | $X/mo | $Y/mo | $Z/mo |
| Growth | $X/mo | $Y/mo | $Z/mo |
| Enterprise | Custom | Custom | Custom |

### 5. Marketing Strategy Analysis
For each competitor, analyze:
- **Content Strategy**: Blog topics, content types, publishing cadence
- **SEO**: Organic keywords they rank for, estimated traffic
- **Social Media**: Platform focus, follower counts, engagement style
- **Paid Ads**: Channels used, estimated spend, ad creative themes
- **Partnerships**: Integrations, affiliates, co-marketing

### 6. Customer Sentiment
Synthesize from reviews, social media, and community:
- **Praise**: What customers love (direct quotes)
- **Pain Points**: Common complaints and feature requests
- **Churn Triggers**: Why customers leave
- **NPS Range**: Estimated promoter/detractor split

### 7. Market Gap Analysis
Identify opportunities:
| Gap | Evidence | Opportunity Size | Difficulty |
|-----|----------|-----------------|------------|
| [gap description] | [data] | [large/medium/small] | [hard/medium/easy] |

### 8. Strategic Recommendations
Based on the analysis, recommend:
1. **Immediate Actions** (0-3 months)
2. **Short-Term Strategy** (3-6 months)
3. **Long-Term Positioning** (6-12 months)

Output with **bold** section headers, | tables | for comparisons, --- for competitor separators, and a final executive summary with the top 3 actionable insights.
