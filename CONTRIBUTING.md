# Contributing to 1Page / TLOGZ

First off — thank you. Every contribution, big or small, makes TLOGZ better for everyone.

**You do not need to know how to code to contribute.** You can add a tool or a prompt, fix a typo, or report a bug without writing a single line of code.

TLOGZ has **two content pillars**, and you can contribute to either:
- 🧰 **Free browser tools** — cataloged in [`content/tools/tools.json`](content/tools/tools.json)
- 🧠 **AI prompt workflows** — cataloged in [`content/workflows/workflows.json`](content/workflows/workflows.json) + source files in `content/workflows/<category>/`

---

## 🧠 Ways to contribute

| I want to… | Go here | Skill level |
| --- | --- | --- |
| Submit a tool or prompt | [New Issue](https://github.com/soms3r/1page/issues/new/choose) | Anyone |
| Propose an idea / get feedback | [Discussions](https://github.com/soms3r/1page/discussions) | Anyone |
| Fix a typo or improve content | Edit a file in `content/` → Pull Request | Anyone |
| Report a bug | [New Issue](https://github.com/soms3r/1page/issues/new/choose) | Anyone |
| Improve docs | Edit files in `docs/` | Beginner |
| Add a feature / fix code | [Fork → Pull Request](https://github.com/soms3r/1page/pulls) | Developer |

---

## 🧰 Adding a tool

Add an entry to `content/tools/tools.json`:

```json
{
  "slug": "json-to-csv",
  "title": "JSON to CSV Converter",
  "tag": "DEV",
  "category": "developer",
  "description": "Turn a JSON array into a CSV file for Excel or Google Sheets.",
  "url": "https://tlogz.top/tools/json-to-csv/",
  "clientSide": true
}
```

**Rules of thumb**
- `slug` must be lowercase with hyphens and unique.
- `category` is one of: `text`, `math`, `health`, `security`, `developer`, `design`, `creator`, `utility`.
- Keep `description` to one clear line.
- Tools should run **client-side** (no data leaves the browser).

---

## 🧠 Adding a workflow

Add an entry to `content/workflows/workflows.json` **and** a source file at `content/workflows/<category>/<slug>.md`:

```markdown
---
title: "Your Workflow Name"
slug: your-workflow-name
description: "One clear line describing what this workflow does."
category: writing            # marketing, development, writing, content, seo, education, freelancing, chatgpt, claude, gemini
tags: [example, productivity]
models:
  best: claude-sonnet-4
  good: [gpt-4o, gemini-2.5-pro]
updated: 2026-10-09
featured: false
variables:
  - name: topic
    label: Topic
    required: true
    placeholder: "e.g. remote team productivity"
---

You are an expert. Write about {{topic}} for the audience below.

**Audience**: {{audience || "general readers"}}
```

**Rules of thumb**
- `title`, `slug`, `description`, `category`, and `updated` are **required**.
- `slug` must be lowercase with hyphens and unique.
- Use `{{variable}}` for inputs and `{{var || "default"}}` for optional ones.
- Keep the description to one line — it appears in search results.

---

## 💻 Local development

```bash
git clone https://github.com/soms3r/1page.git
cd 1page
npm install
npm run dev      # http://localhost:3000
```

Before opening a Pull Request, please run:

```bash
npm run lint     # code style
npm run build    # make sure the static build succeeds
```

---

## 🔀 Pull Request guidelines

1. Fork the repo and create a branch: `git checkout -b feat/my-content`
2. Make your change and commit with a clear message.
3. Ensure `npm run build` succeeds.
4. Open a Pull Request and describe **what** changed and **why**.
5. A maintainer will review and merge. 🎉

---

## 💬 Code of conduct

Be kind, be respectful, assume good intent. We are here to make useful, free tools for everyone.

---

## 📄 License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).

<div align="center">
<b>Thank you for helping build TLOGZ.</b> · <a href="https://tlogz.top">tlogz.top</a>
</div>
