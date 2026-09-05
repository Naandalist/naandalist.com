# Naandalist.com

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/Naandalist/naandalist.com)
[![Astro](https://img.shields.io/badge/Astro-7.2-FF5D01.svg)](https://astro.build)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.12-brightgreen.svg)](https://nodejs.org)
[![Bun](https://img.shields.io/badge/Bun-%3E%3D1.4-f9f1e1.svg)](https://bun.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Personal portfolio and blog built with Astro, with bilingual English and Indonesian
content, a clean design, and a focus on performance and SEO.

This app is live at [naandalist.com](https://naandalist.com/).

## Features

- English and Indonesian routes
- Blog posts, projects, work history, and npm package collections
- MDX and type-safe Astro Content Collections
- Resume index at `/resume` and `/id/resume`, with PDF detail pages at `/resume/{slug}`
- Generated sitemap, RSS feed, robots.txt, and structured metadata
- Vercel Analytics and Speed Insights

## Tech Stack

- Astro 7
- Tailwind CSS 3
- TypeScript 5
- MDX and Astro Content Collections
- Bun
- Vercel Analytics and Speed Insights

## Requirements

- Node.js 22.12 or newer
- Bun 1.4 or newer

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Naandalist/naandalist.com.git
cd naandalist.com
```

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun dev
```

The site will be available at `http://localhost:4321`.

## Scripts

| Command | Description |
| --- | --- |
| `bun dev` | Start the local development server |
| `bun run build` | Type-check and build the production site |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint |
| `bun test` | Run unit tests |
| `bun run verify:routes` | Verify generated routes |
| `bun run verify:seo` | Verify generated SEO metadata |

## License

MIT License — see [LICENSE](LICENSE) for details.
