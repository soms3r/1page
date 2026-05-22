# 1 Page — AI is Easy

Open-source AI workflow library. Community maintained.

## Quick Start

```bash
npm install
npm run build
```

Output goes to `out/` — deployable to any static host (Apache, cPanel, GitHub Pages, Netlify, Cloudflare).

## Development

```bash
npm run dev
```

## Adding Workflows

Create a Markdown file in `content/workflows/<category>/<slug>.md` with YAML frontmatter:

```yaml
---
title: "Workflow Name"
slug: workflow-slug
description: "What it does"
category: "marketing"
tags: ["tag1", "tag2"]
models:
  best: "gpt-4o"
  good: ["claude-sonnet-4"]
  limited: []
updated: "2026-05-22"
featured: false
locked: false
---
```

Then rebuild: `npm run build`

## Architecture

- GitHub is the single source of truth
- Content is Markdown files with YAML frontmatter
- Build generates static JSON indices
- No database, no API routes, no runtime server
- Runs on ordinary shared hosting

## Deploy

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for shared hosting, Apache, cPanel, GitHub Pages, Netlify, and Cloudflare Pages deployment guides.
