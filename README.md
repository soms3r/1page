<div align="center">

# TLOGZ

**AI is Easy.**

An open-source library of ready-to-use AI workflows. Search, copy, paste, and run.

[Explore Workflows](https://tlogz.top) · [Search](https://tlogz.top/search) · [Submit Yours](https://tlogz.top/submit) · [GitHub](https://github.com/soms3r/1page)

</div>

<div align="center">

![GitHub License](https://img.shields.io/github/license/soms3r/1page)
![GitHub last commit](https://img.shields.io/github/last-commit/soms3r/1page)
![GitHub stars](https://img.shields.io/github/stars/soms3r/1page?style=flat)
![GitHub contributors](https://img.shields.io/github/contributors/soms3r/1page)
![Static site](https://img.shields.io/badge/static%20site-✓-brightgreen)
![No database](https://img.shields.io/badge/no%20database-✓-brightgreen)

</div>

---

## Screenshot

<!--
  Replace this placeholder with an actual screenshot of the TLOGZ homepage or workflow browser.
  Recommended: 1200×675 PNG or WebP showing the search interface + workflow cards.
  Example: <img src="docs/screenshots/homepage.png" alt="TLOGZ homepage showing search bar and workflow cards" width="100%">
-->

```
+----------------------------------------------------------+
|  TLOGZ                                    [Search...]    |
|  AI is Easy.                                              |
|                                                           |
|  [Featured Workflows]                                     |
|  ┌─────────────────┐  ┌─────────────────┐                |
|  │ Facebook Ad Gen │  │ SEO Blog Writer │  ...           |
|  │ Copy ads fast   │  │ Rank on Google  │                |
|  └─────────────────┘  └─────────────────┘                |
|                                                           |
|  Categories: Marketing  Writing  Development  Design ...  |
+----------------------------------------------------------+
```

---

## What Does TLOGZ Do?

TLOGZ is a library of **AI workflows** — structured prompts that you can copy, customize, and use with any AI tool (ChatGPT, Claude, Gemini, and more).

Instead of figuring out how to prompt an AI from scratch every time, you grab a workflow, fill in your details, and get results.

**Example:** Need a Facebook ad? Open the "Facebook Ad Generator" workflow, tell it your product and audience, and get a complete ad ready to publish.

---

## Why TLOGZ Exists

AI tools are powerful, but knowing *how* to talk to them takes time. Good prompts get lost in bookmarks, buried in Twitter threads, or kept private.

TLOGZ fixes that:

- **One place** to find proven prompts
- **Structured format** so you know exactly what to fill in
- **Community maintained** — workflows get better over time
- **Free forever** — no signup, no paywall, no database

---

## Key Features

| Feature | What It Means |
|---------|---------------|
| **Searchable library** | Find workflows by keyword, category, tag, or AI model |
| **Copy & run** | Every workflow includes a complete prompt with fill-in-the-blank variables |
| **Anyone can contribute** | Developers, writers, marketers, students — no coding required |
| **No account needed** | The site is fully static. No signup, no login, no tracking |
| **Open source** | Every line of code and every workflow is public on GitHub |
| **SEO optimized** | Every workflow, category, tag, and model has its own page |
| **Zero servers** | Runs on cheap shared hosting. No backend, no database, no maintenance |

---

## How It Works

```
You write a workflow in Markdown
        ↓
Build scripts turn it into JSON + HTML
        ↓
Static files get deployed to a server
        ↓
Visitors search, browse, and copy workflows
```

1. **Content** lives as Markdown files in the GitHub repository
2. **Build scripts** parse the files and generate searchable JSON indices
3. **Static export** produces `out/` — a folder of ready-to-serve files
4. **Deploy** to any static host (or just browse on [tlogz.top](https://tlogz.top))

---

## Architecture Overview

| Layer | Technology |
|-------|------------|
| Source of truth | [GitHub repository](https://github.com/soms3r/1page) |
| Content format | Markdown + YAML frontmatter |
| Framework | [Next.js](https://nextjs.org/) (static export) |
| Styling | Tailwind CSS |
| Search | [Fuse.js](https://fusejs.io/) (runs in the browser — no server needed) |
| Hosting | Any static host (Apache, cPanel, GitHub Pages, Netlify, Cloudflare) |
| Database | None |
| Analytics | Umami (optional) |

**No database. No backend server. No runtime dependencies.**

---

## Directory Structure

```
content/
  workflows/
    marketing/facebook-ad-generator.md   # Workflow files organized by category
    writing/seo-blog-post-writer.md
    development/react-component-generator.md
  settings/                              # Site configuration (JSON files)

src/
  app/                                   # Next.js pages
  components/                            # Reusable UI components
  lib/                                   # Shared utilities and types
  scripts/                               # Build scripts (indices, search, SEO)

public/                                  # Generated files (after build)
  workflows-index.json                   # All workflow metadata
  search-index.json                      # Client-side search data
  categories.json                        # Category list
  tags.json                              # Tag list
  models.json                            # AI model list
  stats.json                             # Counts (workflows, categories, etc.)

out/                                     # Final static site (generated, deploy this)
docs/
  DEPLOYMENT.md                          # Deployment guide
  MIGRATION.md                           # Architecture changelog
```

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/soms3r/1page.git
cd 1page

# 2. Install dependencies
npm install

# 3. Build the site
npm run build

# 4. Serve the output locally
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

**That is it.** No database setup. No environment variables. No server configuration.

---

## Local Development

```bash
# Start the development server with hot reload
npm run dev
```

Changes to workflow files, components, and styles will appear live in the browser.

---

## Build Commands

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start development server (live reload) |
| `npm run build` | Full build: generate indices → static export → copy assets |
| `npm start` | Serve the built site locally (from `out/`) |
| `npm run build-index` | Regenerate JSON indices only (skip HTML export) |
| `npm run search` | Rebuild the search index only |
| `npm run lint` | Check code for issues |

---

## Deployment Options

TLOGZ is a fully static site. The `out/` directory goes anywhere.

### Shared Hosting (Apache / cPanel)

Upload the `out/` folder via FTP. Add an `.htaccess` file for clean URLs:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ $1/index.html [L]
```

### GitHub Pages

Push the `out/` folder to the `gh-pages` branch, or use GitHub Actions:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out/
      - uses: actions/deploy-pages@v4
```

### Netlify

Connect your GitHub repository and set:

- **Build command:** `npm run build`
- **Publish directory:** `out`

### Cloudflare Pages

Connect your GitHub repository and set:

- **Build command:** `npm run build`
- **Build output:** `out`

**No database configuration. No environment variables. No server setup.**

> For a detailed deployment walkthrough, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## GitHub as Source of Truth

Everything in TLOGZ starts in this GitHub repository:

- **Workflows** are Markdown files in `content/workflows/`
- **Site settings** are JSON files in `content/settings/`
- **Documentation** lives in `docs/`
- **Source code** is in `src/`

No hidden database. No proprietary format. If you can edit a text file, you can contribute to TLOGZ.

---

## Content Format

Every workflow is a Markdown file with a YAML header. Here is a complete example:

```markdown
---
title: "Facebook Ad Generator"
slug: facebook-ad-generator
description: "Create high-converting Facebook ad copy with structured prompts for audience targeting, creative hooks, and CTAs."
category: marketing
tags:
  - facebook
  - ads
  - copywriting
  - social-media
models:
  best: claude-sonnet-4
  good:
    - gpt-4o
    - gemini-2.5-pro
  limited:
    - claude-haiku
    - gpt-4o-mini
updated: 2026-05-20
featured: true
variables:
  - name: product
    label: Product/Service Name
    required: true
    placeholder: "e.g. BudgetTracker Pro"
  - name: audience
    label: Target Audience
    required: true
    placeholder: "e.g. Small business owners aged 25-45"
  - name: tone
    label: Tone of Voice
    required: false
    placeholder: "e.g. Professional, casual, urgent"
---

You are a Facebook ad copywriting expert. Write a high-converting Facebook ad for the following:

**Product/Service**: {{product}}
**Target Audience**: {{audience}}
**Tone**: {{tone || "Professional"}}

Structure the ad with:
1. **Hook** – First 1-2 lines that stop the scroll
2. **Body** – 2-3 short paragraphs explaining the value proposition
3. **Social Proof** – One line of credibility
4. **Call to Action** – Clear, urgent CTA
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Human-readable name of the workflow |
| `slug` | Yes | URL-friendly identifier (lowercase, hyphens) |
| `description` | Yes | One-line summary (appears in search results) |
| `category` | Yes | One of: `marketing`, `development`, `writing`, `design`, `business`, `research`, `education`, `productivity`, `other` |
| `tags` | No | Keywords for search filtering |
| `models.best` | No | Recommended AI model for this workflow |
| `models.good` | No | Array of good alternative models |
| `models.limited` | No | Array of capable but limited models |
| `updated` | Yes | ISO date of last update (YYYY-MM-DD) |
| `featured` | No | Set to `true` to show on the featured page |
| `variables` | No | Array of input fields with labels, validation, and placeholders |

### Variables

Use `{{variable_name}}` in the workflow body where users should fill in their own information:

```markdown
Write a {{type}} post about {{topic}} targeting {{audience}}.
```

Use `{{var || "default"}}` for optional inputs with a fallback value:

```markdown
Length: {{wordCount || "1000"}} words
```

---

## How to Add a Workflow

**You do not need to know how to code.**

### Option A: Submit via GitHub Issue (Easiest)

1. Go to the [New Issue page](https://github.com/soms3r/1page/issues/new/choose)
2. Choose the "Workflow Submission" template
3. Fill in the form (title, description, prompt, category)
4. Click submit

A maintainer will review your workflow and add it to the library.

### Option B: Submit via GitHub Discussion

1. Start a [new Discussion](https://github.com/soms3r/1page/discussions/new?category=workflows)
2. Share your workflow
3. Get feedback from the community

### Option C: Fork and Pull Request (For Developers)

1. **Fork** this repository — click the "Fork" button at the top of [the repo page](https://github.com/soms3r/1page)
2. **Clone** your fork to your computer
3. **Create** a file at `content/workflows/<category>/<slug>.md`
4. **Commit** and push your changes
5. **Open a Pull Request** — GitHub will guide you through this

---

## How to Contribute

Everyone is welcome. Here are the ways to help:

| Activity | How | Skill Level |
|----------|-----|-------------|
| Submit a workflow | Open an Issue or Discussion | Anyone |
| Improve an existing workflow | Click "Edit on GitHub" on any workflow page | Anyone |
| Report a bug | Open an Issue | Anyone |
| Improve documentation | Edit files in `docs/` | Beginner |
| Translate the UI | Help localize the interface | Intermediate |
| Review pull requests | Check submitted changes | Developer |
| Write code | Fix bugs, add features, improve build scripts | Developer |
| Star the repo | Click the ⭐ button at the top of the page | Anyone |

**No contribution is too small.** A single workflow can help hundreds of people.

---

## Project Roadmap

Here is what we are working on:

- [ ] More workflows across all categories
- [ ] Community voting on workflows
- [ ] Contributor leaderboard
- [ ] Multilingual workflow support
- [ ] Chrome extension for quick access
- [ ] API for programmatic workflow access

Want to help with any of these? Open an Issue or start a Discussion.

---

## FAQ

**Q: Do I need an account to use TLOGZ?**

No. The site is fully static. No signup, no login, no tracking.

**Q: Do I need to know how to code to contribute?**

No. You can submit workflows through GitHub Issues or Discussions without writing a single line of code.

**Q: Is there a database?**

No. Everything is stored as Markdown files in the GitHub repository. The site is built from these files at deploy time.

**Q: Can I run my own copy?**

Yes. Fork the repository, run `npm run build`, and deploy the `out/` folder anywhere.

**Q: What AI models are supported?**

Any model. Workflows recommend `best`, `good`, and `limited` models, but you can use any AI tool you like.

**Q: Is analytics required?**

No. Analytics (Umami) is optional and runs entirely in the browser. The site works perfectly without it.

**Q: Can I use workflows commercially?**

Yes. The content and code are open source. Use them however you like.

---

## License

Open source. Licensed under the [MIT License](LICENSE).

---

## Credits

Created by [Tasneem Bin Ahsan](https://github.com/TBAhsan).

**Website:** [tlogz.top](https://tlogz.top)

**Sponsored by:** [tlogz.com](https://tlogz.com)

---

<div align="center">

Built by the community, for everyone.

[Explore Workflows](https://tlogz.top) · [Star on GitHub](https://github.com/soms3r/1page) · [Submit a Workflow](https://github.com/soms3r/1page/issues/new/choose)

</div>
