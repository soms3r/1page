# Migration Summary

## Architecture Change

**Before:** Next.js server-rendered app with API routes, filesystem access at runtime, and Vercel-dependent features.

**After:** Fully static Next.js export. Zero server dependencies. Runs on any hosting that serves static files.

## What Changed

### Removed
- **10 API routes** (`/api/workflows`, `/api/submit`, `/api/generate`, `/api/admin/*`, etc.)
- **Admin dashboard** (`/admin`) — required runtime API for approve/reject/submission management
- **AI workflow generator** (`/generate`) — required server-side API call to OpenAI
- **Server-only libraries:**
  - `src/lib/workflows.ts` — filesystem-based workflow loading (replaced with JSON indices)
  - `src/lib/github.ts` — GitHub API write operations
  - `src/lib/rate-limit.ts` — in-memory rate limiter (only used by API routes)
- **Client dependencies:**
  - `react-turnstile` — Cloudflare Turnstile (no longer needed without form submission)
  - `@base-ui/react`, `class-variance-authority`, `shadcn` — UI library (unused)
  - `lucide-react` — icons (unused)

### Converted to Static
- `src/lib/workflows.ts` → now a **types-only** export (types `WorkflowMeta`, `Workflow`, `WorkflowVariable`)
- All page components now rely on build-time generated JSON instead of runtime filesystem reads
- Build scripts parse markdown during `npm run build-index` and emit JSON to `public/`
- Server components (`generateStaticParams`) read from JSON at build time

### New Build Pipeline
1. `build-index.ts` — parses all `content/workflows/**/*.md` files, generates:
   - `public/workflows-index.json` (workflow metadata)
   - `public/categories.json`, `public/tags.json`, `public/models.json`
   - `public/stats.json` (counts)
   - `public/workflow-content/{slug}.json` (full body + variables per workflow)
2. `build-search-index.ts` — generates `public/search-index.json` for client-side Fuse.js
3. `build-content-expansion.ts` — generates `public/expanded/{slug}.json` (guide content)
4. `seo-enrich.ts` — generates `public/seo-index.json` (SEO metadata)
5. `post-build.ts` — copies all JSON assets from `public/` to `out/` after Next.js export

### UI Redesign
- **Theme:** GitHub-dark inspired (`#0d1117` background, `#3fb950` green accent, JetBrains Mono font)
- **Homepage:** Hero section with stats, search bar with `⌘K` shortcut, trending/featured/latest sections, browse directories grid
- **Workflow cards:** File explorer style (`file: name.md`, category badges, tags)
- **Breadcrumb navigation:** `cd /workflows/{category}` path display
- **Search modal:** Command palette style with Fuse.js instant results
- **Fake metrics removed:** No CPU/RAM/node version displays
- **Excessive animations removed:** Clean, minimal transitions

### Pages Preserved
| Route | Type | Status |
|-------|------|--------|
| `/` | Static + Client | Homepage with hero, search, sections |
| `/workflows/[slug]` | SSG | Workflow detail with template, variables, GitHub links |
| `/category/[category]` | SSG | Category listing |
| `/tag/[tag]` | SSG | Tag listing |
| `/model/[model]` | SSG | Model listing |
| `/search` | Static + Client | Fuse.js powered client search |
| `/search/[query]` | SSG | Prebuilt search result pages (SEO) |
| `/featured` | SSG | Featured workflows |
| `/trending` | SSG | Trending/ranked workflows |
| `/new` | SSG | Latest workflows |
| `/submit` | Static | GitHub-first submission guide |
| `/donate` | Static | Donation links |
| `/_not-found` | Static | Custom 404 |

### GitHub Integration
- `GITHUB_REPO = "soms3r/1page"` hardcoded in workflow detail page
- Every workflow shows **View Source**, **Edit on GitHub**, **Report Issue** links
- Submission page offers 3 options: GitHub Issue template, GitHub Discussion, or direct PR

### Community Submission (Replaced)
**Before:** Client-side form → Cloudflare Turnstile → `/api/submit` → filesystem write → GitHub commit

**After:** GitHub-first workflow:
- **Option A:** Open a GitHub Issue with workflow template
- **Option B:** Start a GitHub Discussion
- **Option C:** Fork repo and submit a Pull Request directly to `content/workflows/`

### SEO Preservation
- All category/tag/model pages pre-rendered statically with full metadata
- SEO index (`seo-index.json`) generates keywords, related queries, and suggestions per workflow
- Static search result pages (`/search/[query]`) prebuilt from SEO index
- Structured data (JSON-LD) on workflow pages
- `generateMetadata()` on all SSG pages

### Analytics
- Umami tracking preserved (client-side `navigator.sendBeacon`)
- Removed server-side stats endpoint (`/api/admin/stats`)
- Only real metrics displayed (workflow count, categories, tags, models from build)

### Build Output
```
npm run build
→ npm run build-index (all JSON generation)
→ next build (static export to out/)
→ post-build.ts (copy JSON to out/)

Total: 77 static pages (with 3 sample workflows)
Deployable: Apache, cPanel, GitHub Pages, Cloudflare Pages, Netlify, any S3/static host
```

## GitHub as Single Source of Truth

```
content/workflows/{category}/{slug}.md  ← Markdown source files
public/                                   → Next.js static output
out/                                      → Final deployable build
```

All content is authored, reviewed, and versioned through GitHub. The build process reads from `content/` and generates the static site. No database. No CMS. No runtime API.

## Lighthouse Targets
- Performance: 95+
- SEO: 100
- Accessibility: 95+

Achievable through minimal JS, code splitting, static export, and no unnecessary rendering.
