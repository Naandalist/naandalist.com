# CLAUDE.md — Agent Context for naandalist.com

## Project Overview

**naandalist.com** is a personal portfolio and blog website for Listiananda Apriliawan. Built with Astro 5, Tailwind CSS, and MDX, featuring bilingual content (English/Indonesian) and a fully typed codebase.

---

## Tech Stack

- **Framework**: Astro 5 (`^5.17.1`)
- **Styling**: Tailwind CSS 3 + `@tailwindcss/typography`
- **Content**: MDX via `@astrojs/mdx` + Astro Content Collections
- **Language**: TypeScript 5 (strict mode)
- **Runtime**: Bun (package manager & test runner)
- **Linting**: ESLint 8 + Astro plugin + TypeScript plugin
- **Analytics**: Vercel Analytics, Speed Insights, Umami
- **SEO**: `@astrojs/sitemap`, `@astrojs/rss`, JSON-LD schemas
- **Hosting**: Vercel

---

## Commands

| Command | Purpose |
|---|---|
| `bun run dev` | Start dev server (localhost:4321) |
| `bun run build` | `astro check && astro build` — type-check first, then build to `dist/` |
| `bun run lint` | Run ESLint across all files |
| `bun run lint:fix` | Auto-fix ESLint violations |
| `bun run preview` | Preview prod build locally |
| `bun run verify:routes` | Validate no malformed i18n paths in `dist/` |

---

## Import Aliases

Always use `@*` paths (defined in tsconfig):

```typescript
import { SITE } from "@constants";           // src/constants.ts
import { useTranslations } from "@i18n/utils"; // src/i18n/utils.ts
import { cn } from "@lib/utils";             // src/lib/utils.ts
import PageLayout from "@layouts/PageLayout.astro";
import ArrowCard from "@components/ArrowCard.astro";
```

**Alias mapping:**
- `@constants` → `src/constants.ts`
- `@types` → `src/types.ts`
- `@components/` → `src/components/`
- `@layouts/` → `src/layouts/`
- `@lib/` → `src/lib/`
- `@assets/` → `src/assets/`
- `@utils/` → `src/utils/`

---

## Project Structure

```
src/
├── components/          # Astro UI components (PascalCase)
├── content/             # Astro Content Collections (posts, work, projects, npmjs)
│   └── config.ts        # Collection schemas & zod validation
├── layouts/             # PageLayout.astro (single root layout)
├── pages/               # File-based routing (index.astro, [...slug].astro)
│   └── id/              # Indonesian locale mirror of all routes
├── lib/                 # Utilities & helpers
│   ├── utils.ts         # cn(), formatDate(), readingTime(), dateRange()
│   └── jsonld.ts        # JSON-LD schema generators
├── i18n/                # Internationalization
│   ├── ui.ts            # Translation strings (typed const)
│   └── utils.ts         # getLangFromUrl(), useTranslations()
├── utils/               # More utilities
│   └── language.ts      # detectLanguage(), getAlternateLanguagePath()
├── scripts/             # Client-side scripts
├── styles/              # global.css
├── constants.ts         # SITE, HOME, POSTS, PROJECTS, NPMJS, SOCIALS
└── types.ts             # Site, Metadata, Socials type definitions
```

---

## Internationalization (i18n)

**Default language:** English (`en`)
**Supported languages:** English + Indonesian (`id`)

### Content Pattern

Each piece of content has **two files per slug**:
```
src/content/posts/
├── my-article/
│   ├── index.md       # English version
│   └── index.id.md    # Indonesian version
```

### URL Structure

- English: `/posts/my-article/`
- Indonesian: `/id/posts/my-article/`

### Helpers

- `getLangFromUrl(url)` — extract language from route
- `useTranslations(lang)` — fetch typed translation object
- Both in `src/i18n/utils.ts`

### Translation Strings

All UI strings live in `src/i18n/ui.ts` as a typed `const` object:

```typescript
export const ui = {
  en: { "nav.home": "Home", ... },
  id: { "nav.home": "Beranda", ... },
}
```

---

## Content Collections

4 content collections defined in `src/content/config.ts`:

### `posts` (Blog articles)
Fields: `title`, `subtitle`, `description`, `date`, `draft`, `featured`, `keywords`, `lang`

### `work` (Employment history)
Fields: `company`, `role`, `logoUrl`, `dateStart`, `dateEnd`, `featured`, `lang`

### `projects` (Portfolio projects)
Fields: `title`, `description`, `date`, `draft`, `featured`, `liveURL`, `repoURL`, `imageUrl`, `techStack`, `category`, `platforms`, `price`, `keywords`, `lang`

### `npmjs` (NPM packages)
Fields: `title`, `description`, `date`, `draft`, `featured`, `npmURL`, `repoURL`, `version`, `license`, `keywords`, `lang`

**Shared fields:**
- `draft: boolean` — excludes from production builds
- `featured: boolean` — pins content to top of listings
- `lang: 'en' | 'id'` — content language

---

## Coding Conventions

### Naming

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase `.astro` | `ArrowCard.astro`, `PostLayout.astro` |
| Pages | kebab-case folders + `index.astro` | `src/pages/blog/[...slug].astro` |
| TypeScript files | camelCase | `utils.ts`, `language.ts` |
| Constants | SCREAMING_SNAKE_CASE | `SITE`, `POSTS`, `SOCIALS` |
| Types | PascalCase | `Site`, `Metadata`, `Socials` |

### Component Pattern

- **All components are `.astro` files** (no React/Vue/TSX)
- Single root layout: `PageLayout.astro` (accepts `title`, `description`, `showHeader`)
- Use `cn()` for class merging (clsx + tailwind-merge)

### TypeScript

- Strict mode enabled (tsconfig)
- Always type-check before build: `astro check`

### ESLint Rules

- **Semicolons required** (`semi: error`)
- **Double quotes** (`quotes: "double"`)
- **Import ordering**: grouped, alphabetized
- **No unused vars** (ignore `^_` prefix)

---

## Key Files

| File | Purpose |
|---|---|
| `src/constants.ts` | SITE, HOME, POSTS, PROJECTS, NPMJS, SOCIALS config |
| `src/types.ts` | TypeScript interfaces: Site, Metadata, Socials |
| `src/lib/utils.ts` | Utility functions: `cn()`, `formatDate()`, `readingTime()`, `dateRange()` |
| `src/lib/jsonld.ts` | JSON-LD schema generators for SEO |
| `src/i18n/ui.ts` | All UI translation strings |
| `src/i18n/utils.ts` | i18n helper functions |
| `astro.config.mjs` | Astro config: integrations, sitemap, SSR, i18n |

---

## Common Tasks

### Add a blog post
1. Create `src/content/posts/my-post/index.md` (EN) + `index.id.md` (ID)
2. Front matter: `title`, `subtitle`, `description`, `date`, `draft`, `featured`, `keywords`, `lang`
3. Run `bun run dev` — appears automatically

### Add a portfolio project
1. Create `src/content/projects/my-project/index.md` + `index.id.md`
2. Front matter: `title`, `description`, `date`, `draft`, `featured`, `liveURL`, `repoURL`, `imageUrl`, `techStack`, `category`, `platforms`, `price`, `keywords`, `lang`

### Add an NPM package entry
1. Create `src/content/npmjs/my-package/index.md` + `index.id.md`
2. Front matter: `title`, `description`, `date`, `draft`, `featured`, `npmURL`, `repoURL`, `version`, `license`, `keywords`, `lang`

### Create a new page
1. Create `src/pages/my-page/index.astro`
2. For Indonesian: create `src/pages/id/my-page/index.astro` with same content
3. Use `PageLayout` wrapper
4. Reference translations via `useTranslations(lang)`

### Lint & auto-fix
```bash
bun run lint:fix
```

### Build & deploy
```bash
bun run build
bun run verify:routes  # Verify i18n paths
# Push to GitHub — Vercel auto-deploys
```

---

## Notes for Agents

1. **Always use `bun`** not `npm` or `yarn`
2. **Check imports**: Use `@*` aliases, never relative `../../`
3. **Content is bi-lingual**: Every content entry needs `index.md` (EN) + `index.id.md` (ID)
4. **Build includes type-check**: `astro check` runs before `astro build`
5. **Astro components only**: No React/Vue components in this codebase
6. **Sitemap excludes pages**: `/privacy/` and `/terms/` filtered from sitemap
7. **JSON-LD for SEO**: Use schemas in `src/lib/jsonld.ts` for rich snippets
8. **Before requesting edits**: Always read the file first to understand context
