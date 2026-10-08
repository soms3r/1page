# TLOGZ content

This folder is the **single source of truth** for the entire TLOGZ platform — both the free browser **tools** and the AI prompt **workflows**.

## Structure

```
content/
├── tools/
│   └── tools.json          # Catalog of every free tool (slug, title, category, description, url)
├── workflows/
│   ├── workflows.json      # Catalog of every AI prompt workflow
│   └── <category>/<slug>.md   # Full workflow source (frontmatter + prompt body)
└── settings/
    └── site.json           # Site-wide metadata (name, tagline, domains, counts)
```

## Adding content

- **New tool** → add an entry to `tools/tools.json`.
- **New workflow** → add an entry to `workflows/workflows.json` **and** a source file at `workflows/<category>/<slug>.md`.

Both catalogs are plain JSON so they can be consumed by the build pipeline, the search index, or any external app. See [`../CONTRIBUTING.md`](../CONTRIBUTING.md) for the full guide.
