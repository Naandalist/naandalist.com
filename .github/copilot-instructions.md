# GitHub Copilot Instructions for naandalist.com

## Project Context

**naandalist.com** is a personal portfolio and blog website built with **Astro 5**, **Tailwind CSS 3**, and **TypeScript** (strict mode). It's bilingual (English + Indonesian) and fully typed.

---

## Essential Rules

### 1. Package Manager
**Always use `bun`** — never `npm` or `yarn`.
```bash
bun run dev        # Start dev server
bun run build      # Type-check then build (astro check && astro build)
bun run lint:fix   # Auto-fix linting issues
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
import { cn } from "../../../../lib/utils";  // ❌
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

### 7. Testing & Verification
Before finishing:
- **Run type-check + build**: `bun run build` (includes `astro check`)
- **Lint**: `bun run lint:fix` (auto-fix code style)
- **Preview**: `bun run preview` (test production build locally)

---

## Key Files & Utilities

| File | Purpose |
|---|---|
| `src/constants.ts` | SITE, HOME, POSTS, PROJECTS, NPMJS, SOCIALS config |
| `src/types.ts` | TypeScript interfaces (Site, Metadata, Socials) |
| `src/lib/utils.ts` | `cn()`, `formatDate()`, `readingTime()`, `dateRange()` |
| `src/i18n/ui.ts` | All UI translation strings (typed const) |
| `astro.config.mjs` | Astro config (integrations, sitemap, i18n) |

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

## Notes

- **Build runs type-check first**: `bun run build` = `astro check && astro build`
- **Bilingual content is mandatory**: Every content entry needs English + Indonesian versions
- **Astro only**: No JSX/React in this project
- **Sitemap excludes pages**: `/privacy/` and `/terms/` are filtered from sitemap
- **Before editing**: Always check the file structure and context first — ask questions if unsure
