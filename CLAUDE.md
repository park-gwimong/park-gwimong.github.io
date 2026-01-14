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
category: CategoryName
tags: [tag1, tag2, tag3]
math: true  # Optional: enable MathJax
draft: false
---
```

## Content Collections

Posts are managed via Astro Content Collections with type-safe schema defined in `src/content/config.ts`.

## Integrations

- **Disqus** comments
- **Google Analytics** (G-43FMDRM60Z)
- **MathJax** for math rendering
- **RSS Feed** at `/rss.xml`
