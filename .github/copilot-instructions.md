# GitHub Copilot Instructions for naandalist.com

## Project Context

**naandalist.com** is a personal portfolio and blog website built with **Astro 7**, **Tailwind CSS 3**, **TypeScript** (strict mode), and **Markdown** content. It's bilingual (English + Indonesian), fully typed, and deployed on Vercel with analytics & performance monitoring.

---

## Essential Rules

### 1. Package Manager & Commands

**Always use `bun`** — never `npm` or `yarn`.

```bash
# Development
bun run dev              # Start dev server (localhost:4321)
bun run dev:network      # Dev server accessible on network
bun run preview          # Preview production build locally
bun run preview:network  # Preview on network

# Build & Type-check
bun run build            # Type-check then build (astro check && astro build)
bun run astro check      # Type-check without building

# Linting & Testing
bun run lint             # Run ESLint
bun run lint:fix         # Auto-fix linting issues
bun run test             # Run tests via Bun

# Verification
bun run verify:routes    # Validate i18n paths in dist/
bun run verify:seo       # Validate SEO metadata in built pages
```

### 2. Import Paths

**Always use `@*` aliases** — never relative paths like `../../lib/utils`.

Correct:

```typescript
import { SITE } from "@constants";
import { cn } from "@lib/utils";
import PageLayout from "@layouts/PageLayout.astro";
```

Never:

```typescript
import { cn } from "../../../../lib/utils"; // ❌
```

### 3. Components

**Only `.astro` components** — no React, Vue, or TSX.

- File names: PascalCase (`ArrowCard.astro`, `PostLayout.astro`)
- Use `cn()` utility for class merging (from `@lib/utils`)

### 4. Code Style

- **Quotes**: Always double quotes (`"string"`, not `'string'`)
- **Semicolons**: Required (`;` at end of statements)
- **Imports**: Group and alphabetize imports by type

### 5. Internationalization (i18n)

Every piece of content has **two files per slug**:

```
src/content/posts/my-article/
├── index.md       ← English version
└── index.id.md    ← Indonesian version
```

**URL structure:**

- English: `/posts/my-article/`
- Indonesian: `/id/posts/my-article/`

**Helper functions** (in `src/i18n/utils.ts`):

- `getLangFromUrl(url)` — extract language from route
- `useTranslations(lang)` — get typed translation object

### 6. Content Collections

Four collections in `src/content/config.ts`:

- **posts** — blog articles (title, subtitle, description, date, draft, featured, keywords, lang)
- **work** — employment history (company, role, logoUrl, dateStart, dateEnd, featured, lang)
- **projects** — portfolio (title, description, date, draft, featured, liveURL, repoURL, imageUrl, techStack, category, platforms, price, keywords, lang)
- **npmjs** — npm packages (title, description, date, draft, featured, npmURL, repoURL, version, license, keywords, lang)

**Shared fields:**

- `draft: boolean` — exclude from production
- `featured: boolean` — pin to top of listings
- `lang: 'en' | 'id'` — content language

### 7. Content Format

All content is written in **Markdown** (`.md` files):

- Posts, projects, work, and npm entries use frontmatter (YAML) + Markdown body
- No JSX/React components in content
- MDX support is installed but not required for basic content

### 8. Testing & Verification

Before finishing:

- **Run type-check + build**: `bun run build` (includes `astro check`)
- **Lint**: `bun run lint:fix` (auto-fix code style)
- **Preview**: `bun run preview` (test production build locally)
- **Verify routes**: `bun run verify:routes` (check bilingual paths)
- **Verify SEO**: `bun run verify:seo` (validate metadata)

---

## Project Structure

```
src/
├── assets/                  # Static images, logos
│   ├── images/
│   └── logo-company/
├── components/              # Astro UI components (PascalCase)
│   ├── ArrowCard.astro
│   ├── Footer.astro
│   ├── Header.astro
│   ├── JsonLd.astro
│   ├── PostLayout.astro
│   ├── ResumeCard.astro
│   ├── ResumeList.astro
│   └── ...
├── content/                 # Astro Content Collections
│   ├── config.ts            # Collection schemas & Zod validation
│   ├── posts/               # Blog articles (bilingual)
│   ├── projects/            # Portfolio projects (bilingual)
│   ├── work/                # Employment history (bilingual)
│   └── npmjs/               # NPM packages (bilingual)
├── i18n/                    # Internationalization
│   ├── ui.ts                # Typed translation strings
│   └── utils.ts             # Locale helpers
├── layouts/
│   └── PageLayout.astro     # Single root layout (all pages wrap this)
├── lib/                     # Core utilities
│   ├── utils.ts             # cn(), formatDate(), readingTime(), dateRange()
│   ├── jsonld.ts            # JSON-LD schema generators for SEO
│   └── README.md
├── pages/                   # File-based routing
│   ├── index.astro          # Home (EN)
│   ├── contact.astro        # Contact (EN)
│   ├── 404.astro
│   ├── robots.txt.ts        # robots.txt generation
│   ├── rss.xml.ts           # RSS feed generation
│   ├── resume/              # Resume index + PDF viewer (EN)
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── id/                  # Indonesian locale mirror
│   │   ├── index.astro      # Home (ID)
│   │   ├── contact.astro    # Contact (ID)
│   │   ├── resume/          # Resume index (ID)
│   │   ├── posts/
│   │   ├── projects/
│   │   ├── npmjs/
│   │   ├── work/
│   │   ├── privacy/
│   │   └── terms/
│   ├── posts/
│   ├── projects/
│   ├── npmjs/
│   ├── work/
│   ├── privacy/
│   └── terms/
├── scripts/                 # Client-side scripts
│   └── main.ts
├── styles/                  # Global styles
│   └── global.css
├── utils/                   # Utility modules
│   ├── language.ts          # detectLanguage(), getAlternateLanguagePath()
│   └── resumes.ts           # Scan public/resume PDFs
├── constants.ts             # SITE, HOME, POSTS, PROJECTS, NPMJS, SOCIALS config
├── types.ts                 # TypeScript interfaces: Site, Metadata, Socials
└── env.d.ts                 # Astro environment types

Root files:
├── astro.config.mjs         # Astro config
├── tailwind.config.mjs      # Tailwind config
├── tsconfig.json            # TypeScript config with path aliases
├── .eslintrc.cjs            # ESLint config
├── package.json             # Dependencies & scripts
└── bun.lock                 # Bun lock file
```

---

## Key Files & Utilities

| File                    | Purpose                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| `src/constants.ts`      | SITE, HOME, POSTS, PROJECTS, NPMJS, SOCIALS config                          |
| `src/types.ts`          | TypeScript interfaces (Site, Metadata, Socials)                             |
| `src/lib/utils.ts`      | `cn()` (class merging), `formatDate()`, `readingTime()`, `dateRange()`      |
| `src/lib/jsonld.ts`     | JSON-LD schema generators for SEO                                           |
| `src/i18n/ui.ts`        | All UI translation strings (typed const)                                    |
| `src/i18n/utils.ts`     | `getLangFromUrl()`, `useTranslations()`                                     |
| `src/utils/language.ts` | `detectLanguage()`, `getAlternateLanguagePath()`                            |
| `src/utils/resumes.ts`  | Lists PDF files from `public/resume/`                                       |
| `astro.config.mjs`      | Astro config (integrations, sitemap, MDX, Tailwind, redirects, performance) |
| `tsconfig.json`         | Path aliases (@constants, @lib, @components, etc.)                          |
| `.eslintrc.cjs`         | ESLint rules (strict mode, quotes, semicolons, import ordering)             |

---

## Common Tasks

### Add a blog post

1. Create `src/content/posts/my-post/index.md` (EN)
2. Create `src/content/posts/my-post/index.id.md` (ID)
3. Include front matter: `title`, `subtitle`, `description`, `date`, `draft`, `featured`, `keywords`, `lang`
4. Content appears automatically on `bun run dev`

### Add a portfolio project

1. Create `src/content/projects/my-project/index.md` + `index.id.md`
2. Include: `title`, `description`, `date`, `draft`, `featured`, `liveURL`, `repoURL`, `imageUrl`, `techStack`, `category`, `platforms`, `price`, `keywords`, `lang`

### Add a resume PDF

1. Put the file in `public/resume/` using `Listiananda-Apriliawan-{Role}.pdf`
2. It appears on `/resume` and `/id/resume` automatically
3. The viewer is `/resume/{slug}` where slug is the filename without `.pdf`
4. The raw file stays at `/resume/{filename}.pdf`

### Create a new page

1. Create `src/pages/my-page/index.astro` (EN)
2. Create `src/pages/id/my-page/index.astro` (ID) — same content
3. Wrap with `PageLayout` (from `@layouts/PageLayout.astro`)
4. Use `useTranslations(lang)` for UI strings

### Fix linting & build

```bash
bun run lint:fix   # Auto-fix quote, semicolon, and import ordering issues
bun run build      # Verify no type errors
```

---

## Integrations & Features

| Integration                 | Purpose                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| **@astrojs/mdx**            | Content authoring (`.md` + Markdown syntax)                             |
| **@astrojs/tailwind**       | Styling with Tailwind CSS 3                                             |
| **@astrojs/sitemap**        | Auto-generated sitemap (excludes privacy, terms, and resume pages)      |
| **@astrojs/rss**            | RSS feed generation                                                     |
| **@vercel/analytics**       | Web analytics for user behavior                                         |
| **@vercel/speed-insights**  | Performance monitoring                                                  |
| **@fontsource/inter**       | Open-source Inter typeface                                              |
| **@tailwindcss/typography** | Tailwind prose plugin for Markdown styling                              |

---

## Notes

- **Build runs type-check first**: `bun run build` = `astro check && astro build`
- **Bilingual content is mandatory**: Every content entry needs English + Indonesian versions
- **Markdown only**: Content files are `.md` (Markdown), not MDX
- **Astro components only**: No JSX/React components in this project
- **Sitemap excludes**: `/privacy/`, `/terms/`, `/resume`, `/id/resume`, and resume detail pages
- **Resume pages are noindex**: list and PDF viewer are kept out of search results
- **Prefetch disabled**: Manual prefetch disabled in config; modern browser caching handles performance
- **Collections backwards compat**: Legacy collections mode enabled for compatibility
- **Before editing**: Always check the file structure and context first — ask questions if unsure
- **NEVER execute git commands**: Only RECOMMEND git operations (commit messages, branch names, workflow suggestions). Never run any git command (`git commit`, `git push`, `git pull`, `git rebase`, `git checkout`, etc.). The user handles all git operations manually.
