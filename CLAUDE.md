# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build     # Build dist/ from blogs/ (required before deploy)
npm run dev       # Build + watch mode + local server at http://localhost:3000
```

`npm run dev` watches `blogs/` and `src/` and rebuilds on any change. Refresh the browser manually after edits.

## Architecture

This is a dependency-light static site generator. There is no framework — just Node.js scripts and a CSS file.

**Build pipeline** (`build.js`):
1. Reads every subfolder inside `blogs/` that contains an `index.md`
2. Parses YAML frontmatter with `gray-matter` (`title`, `date`, `description`, `tags`)
3. Converts Markdown to HTML via `marked` (GFM enabled) + `marked-highlight` / `highlight.js` for code blocks
4. Injects HTML into template literals (defined inline in `build.js`) and writes to `dist/blog/{slug}/index.html`
5. Copies all non-`.md` files from each blog folder (images, diagrams, etc.) to the matching `dist/blog/{slug}/` directory
6. Writes `dist/index.html` with posts sorted newest-first

**Custom renderers** — `marked.use({ renderer: {...} })` in `build.js`:
- `heading(text, depth, rawText)` — adds `id` slugs and `#` anchor links to every heading. Uses positional args (not a token object) — this is the marked v12 extension API.
- `image(href, title, text)` — wraps images in `<figure>`/`<figcaption>` using the alt text as caption.

**Styling** (`src/style.css`):
- CSS custom properties for every colour; `[data-theme="dark"]` selector overrides them all for dark mode.
- Syntax highlighting colours are also custom properties (`--hl-keyword`, `--hl-string`, etc.) so they switch automatically with the theme. The `.hljs` class rules at the bottom of the file reference these vars and override highlight.js's own inline theme.
- Dark/light toggle: a tiny inline `<script>` at the top of `<body>` reads `localStorage` and sets `data-theme` on `<html>` before the browser paints, preventing any flash. The toggle button fires a `click` listener at the bottom of `<body>`.

**Site config** — top of `build.js`:
```js
const config = {
  title: 'LittleBytes',
  tagline: 'Short notes on things I learn.',
  basePath: process.env.BASE_PATH || '',
};
```
`basePath` is for GitHub Pages served at a subdirectory (e.g. `BASE_PATH=/my-repo node build.js`). Leave it empty for Cloudflare Pages or a root-level GitHub Pages site.

## Adding a post

```
blogs/
  my-post-slug/
    index.md        ← required
    diagram.png     ← optional assets, copied to dist automatically
```

Required frontmatter in `index.md`:

```yaml
---
title: Post Title
date: 2026-01-15
description: One-sentence summary (shown on the post list).
tags: [tag1, tag2]
---
```

The folder name becomes the URL slug: `blogs/my-post-slug/` → `/blog/my-post-slug/`.

## Deployment

**Cloudflare Pages**: connect the repo, set build command to `npm run build`, output directory to `dist`.

**GitHub Pages**: push to `main`; the included `.github/workflows/deploy.yml` runs the build and deploys `dist/` automatically via the Pages API.

`dist/` is gitignored — it is always regenerated from source.
