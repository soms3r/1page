# Deployment Guide — Shared Hosting

This guide covers deploying the statically exported 1 Page site to ordinary shared hosting (Apache/cPanel), GitHub Pages, Cloudflare Pages, and Netlify.

## Prerequisites

- Node.js 18+ installed locally
- Git

## Build Locally

```bash
# Install dependencies
npm install

# Build the static site (generates out/ directory)
npm run build
```

This produces an `out/` directory containing:
- Static HTML files for all 77+ pages
- JSON indices (workflows-index.json, search-index.json, etc.)
- Client-side JavaScript bundles
- CSS, images, fonts

## Deploy to Apache / cPanel Shared Hosting

### Step 1: Build locally
```bash
npm run build
```

### Step 2: Upload to server
Upload the entire `out/` directory to your web root via FTP/SFTP.

```bash
# Using rsync (if available)
rsync -avz out/ user@your-server:/public_html/

# Or via scp
scp -r out/* user@your-server:/public_html/
```

### Step 3: Configure .htaccess (Apache)

Create/update `.htaccess` in the web root:

```apache
# Enable rewrite engine
RewriteEngine On

# Handle trailing slashes (Next.js static export uses /path/index.html)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)/$ $1/index.html [L]

# Handle direct paths without trailing slash
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ $1/index.html [L]

# MIME types
AddType application/json .json
AddType text/html .html

# Cache static assets
<FilesMatch "\.(html|json|js|css|woff2)$">
  Header set Cache-Control "public, max-age=3600"
</FilesMatch>

# Security headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
```

### Step 4: Verify
Visit `https://your-domain.com/` — the site should load with full functionality.

## Deploy to GitHub Pages

### Option A: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

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

### Option B: Manual

```bash
npm run build
cd out
git init
git checkout -b gh-pages
git add .
git commit -m "deploy"
git remote add origin https://github.com/soms3r/1page.git
git push -f origin gh-pages
```

Then enable GitHub Pages in repo settings → Pages → Branch: `gh-pages`.

## Deploy to Cloudflare Pages

1. Log in to Cloudflare Dashboard → Pages
2. Click "Create a project" → "Connect to Git"
3. Select your repository
4. Build configuration:
   - **Framework preset:** Next.js (Static HTML Export)
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
5. Click "Save and Deploy"

## Deploy to Netlify

1. Log in to Netlify → Sites → Add new site → Import existing project
2. Select your repository
3. Build settings:
   - **Base directory:** `/`
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
4. Click "Deploy site"

### Netlify redirect rules

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "out"

[[redirects]]
  from = "/*"
  to = "/:splat/index.html"
  status = 200
```

## Adding New Workflows

Workflows are Markdown files stored in `content/workflows/{category}/{slug}.md`.

To add a workflow:
1. Create a new `.md` file in the appropriate category folder
2. Add YAML frontmatter with required fields
3. Rebuild the site: `npm run build`
4. Deploy the `out/` directory

Example workflow file:

```markdown
---
title: "My Workflow"
slug: my-workflow
description: "What this workflow does"
category: "marketing"
tags: ["tag1", "tag2"]
models:
  best: "gpt-4o"
  good: []
  limited: []
updated: "2026-05-22"
featured: false
locked: false
---

Write your workflow prompt here.

Use {{variable_name}} for inputs.
```

## Troubleshooting

### 404 on page refresh
Ensure your web server is configured to serve `index.html` for directory paths. The `.htaccess` example above handles this for Apache.

### JSON files not loading
Verify that `out/workflows-index.json`, `out/search-index.json`, and other JSON files are present in the deployed directory. These are loaded via `fetch()` at runtime.

### Search not working
Search is client-side only and requires `search-index.json` to be accessible at `/search-index.json`. Check the browser's network tab to confirm the file loads correctly.

### Want to reindex without rebuilding?
All content comes from the build process. You must run `npm run build` to regenerate JSON indices when workflow files change.
