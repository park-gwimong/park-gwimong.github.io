# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astro-based personal technical blog (Korean) hosted on GitHub Pages. Topics include programming languages (Java, C, JavaScript, Qt), AWS, Linux, databases, networking, and troubleshooting documentation.

## Development Commands

```bash
# Install dependencies
npm install

# Run local development server (port 5000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The site is automatically deployed via GitHub Actions when pushing to the main branch.

## Architecture

- **Astro 4.x** static site generator
- **Port**: 5000 (local development)
- **Permalink structure**: `/:year/:month/:day/:slug/`

### Key Directories

- `src/content/posts/` - Blog posts organized by category subdirectories
- `src/layouts/` - Astro layout components (BaseLayout, PostLayout)
- `src/pages/` - Route pages and dynamic routes
- `src/components/` - Reusable Astro components
- `src/styles/` - Global CSS styles
- `public/` - Static assets (favicon, images)
- `public/resource/` - Blog post images organized by year

### Blog Post Format

Posts require this front matter:

```yaml
---
title: Post Title
subtitle: Optional Subtitle
pubDate: 2024-01-15
category: CategoryName       # must match a subdirectory under src/content/posts/ (all lowercase, single token: e.g. softwareengineering, troubleshooting)
tags: [tag1, tag2, tag3]     # reflect the actual content; do not copy tags from a sibling post
math: true                   # only set true when the post actually contains LaTeX/MathJax
draft: false
---
```

### File Naming Convention

- Filenames are **kebab-case, lowercase only** (e.g. `software-development-life-cycle.md`).
- Acronyms are lowercased too (`aws-ec2-connection.md`, not `AWS-EC2-connection.md`).
- Series posts use a numeric suffix: `qt-start-1.md`, `qt-start-2.md`.
- Filename = URL slug. Renaming an existing post **breaks its permalink** — only rename when fixing a real typo and verify no other post cross-links to it first.
- When adding a new post, double-check `pubDate`, `tags`, and `math` are correct for the new content rather than left over from a copied template.

## Content Collections

Posts are managed via Astro Content Collections with type-safe schema defined in `src/content/config.ts`.

## Integrations

- **Disqus** comments
- **Google Analytics** (G-43FMDRM60Z)
- **MathJax** for math rendering
- **RSS Feed** at `/rss.xml`
