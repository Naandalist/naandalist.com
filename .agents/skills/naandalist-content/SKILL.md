---
name: naandalist-content
description: Guides creation and editing of bilingual content (posts, projects, work, npm packages) with proper i18n structure, frontmatter, and writing voice.
license: MIT
---

# Naandalist Content Creation

You are helping maintain naandalist.com's content library. This is a bilingual English + Indonesian portfolio site with a content-driven architecture. Every content entry must exist in both languages with consistent structure, proper frontmatter, and voice matching the author's professional identity as a frontend developer.

## When to Use This Skill

Invoke `/naandalist-content` whenever you need to create, edit, or understand content for this site. Use it before writing any `.md` files.

---

## Core Principle: Bilingual Everything

**Every content entry must have exactly two files:**
- `index.md` — English version
- `index.id.md` — Indonesian version

Both files live in the same directory slug. Both must have identical frontmatter structure with matching `lang` field.

**Directory structure:**
```
src/content/[collection]/[slug]/
├── index.md       (English, lang: "en")
└── index.id.md    (Indonesian, lang: "id")
```

Examples:
```
src/content/posts/git-commit-convention/
├── index.md
└── index.id.md

src/content/projects/mobile-app-kbbi/
├── index.md
└── index.id.md
```

---

## Content Collections

This site has 4 content collections in `src/content/`. Each has different required frontmatter fields.

### 1. Posts (Blog Articles)

**Directory:** `src/content/posts/[slug]/`
**URL:** `/posts/[slug]` (EN) or `/id/posts/[slug]` (ID)

**Required frontmatter:**
```yaml
---
title: String (the post title)
subtitle: String (one-liner description)
description: String (longer description for SEO, 150-160 chars)
date: ISO 8601 date string (e.g., "2024-02-15T10:30:00Z")
draft: Boolean (true hides from production build)
featured: Boolean (true pins to top of /posts listing)
keywords: Array of strings (SEO keywords, 3-5 items)
lang: "en" (for index.md) or "id" (for index.id.md)
---
```

**Example frontmatter:**
```yaml
---
title: "Git Commit Message Convention"
subtitle: "Writing clear, consistent commit messages that scale"
description: "Learn how to write commit messages that improve code review and project history"
date: "2024-02-15T10:30:00Z"
draft: false
featured: true
keywords: ["git", "commit", "conventions", "best practices"]
lang: "en"
---
```

**Content:** MDX markdown. The site uses `@astrojs/mdx` so you can use JSX components inside markdown.

### 2. Work (Employment History)

**Directory:** `src/content/work/[slug]/`
**URL:** `/work` page shows entries (no detail pages)

**Required frontmatter:**
```yaml
---
company: String (company name)
role: String (job title)
logoUrl: String (URL to company logo, or Cloudinary CDN)
dateStart: ISO 8601 date string (start date)
dateEnd: ISO 8601 date string or null (end date, null for current role)
featured: Boolean (true shows on homepage)
lang: "en" or "id"
---
```

**Example:**
```yaml
---
company: "Acme Corp"
role: "Senior Frontend Developer"
logoUrl: "https://example.com/logo.png"
dateStart: "2022-01-15T00:00:00Z"
dateEnd: "2024-06-30T00:00:00Z"
featured: true
lang: "en"
---
```

**Content:** Brief description of role, accomplishments, skills. Keep to 2-3 sentences.

### 3. Projects (Portfolio)

**Directory:** `src/content/projects/[slug]/`
**URL:** `/projects/[slug]` (EN) or `/id/projects/[slug]` (ID)

**Required frontmatter:**
```yaml
---
title: String (project name)
description: String (1-2 sentences describing the project)
date: ISO 8601 date string
draft: Boolean
featured: Boolean (true pins to top of /projects)
liveURL: String (URL to deployed/live project)
repoURL: String (GitHub or GitLab URL)
imageUrl: String (screenshot or hero image URL)
techStack: Array of strings (e.g., ["React", "TypeScript", "Tailwind"])
category: String (e.g., "Web App", "Mobile App", "Library")
platforms: Array of strings (e.g., ["Web", "iOS", "Android"])
price: String (free, paid, open-source, etc.)
keywords: Array of strings (SEO keywords)
lang: "en" or "id"
---
```

**Example:**
```yaml
---
title: "KBBI Mobile App"
description: "A mobile app for Indonesian dictionary lookups with offline support"
date: "2023-06-20T00:00:00Z"
draft: false
featured: true
liveURL: "https://play.google.com/store/apps/details?id=com.naandalist.kbbi"
repoURL: "https://github.com/naandalist/kbbi-mobile"
imageUrl: "https://res.cloudinary.com/.../kbbi-thumb.webp"
techStack: ["React Native", "TypeScript", "Firebase"]
category: "Mobile App"
platforms: ["iOS", "Android"]
price: "Free"
keywords: ["kbbi", "dictionary", "indonesian", "mobile"]
lang: "en"
---
```

**Content:** Longer description. How it works. Key features. What you learned.

### 4. NPM Packages

**Directory:** `src/content/npmjs/[slug]/`
**URL:** `/npmjs/[slug]` (EN) or `/id/npmjs/[slug]` (ID)

**Required frontmatter:**
```yaml
---
title: String (package name)
description: String (what it does)
date: ISO 8601 date string (publication date)
draft: Boolean
featured: Boolean (true pins to top of /npmjs)
npmURL: String (https://npmjs.com/package/...)
repoURL: String (GitHub URL)
version: String (e.g., "1.2.3")
license: String (e.g., "MIT", "Apache-2.0")
keywords: Array of strings (npm keywords)
lang: "en" or "id"
---
```

**Example:**
```yaml
---
title: "@naandalist/ui"
description: "A collection of reusable React components with TypeScript support"
date: "2023-01-10T00:00:00Z"
draft: false
featured: false
npmURL: "https://www.npmjs.com/package/@naandalist/ui"
repoURL: "https://github.com/naandalist/ui"
version: "2.1.5"
license: "MIT"
keywords: ["react", "components", "typescript", "ui", "library"]
lang: "en"
---
```

**Content:** Brief overview. Features. Installation instructions. Usage examples.

---

## Slug Naming Convention

**Format:** kebab-case, descriptive, URL-friendly

**Examples:**
- ✓ `git-commit-message-convention`
- ✓ `mobile-app-kbbi-vi`
- ✓ `building-performant-react-apps`
- ✗ `git_commit_convention` (use hyphens, not underscores)
- ✗ `GitCommitConvention` (lowercase only)
- ✗ `git-commit-message-convention-for-clean-code` (too long, >50 chars preferred)

---

## Writing Tone & Voice

### English (index.md)

**Tone:** Professional but conversational. Developer-to-developer. Approachable.

**Author identity:** Listiananda Apriliawan, a frontend developer from Indonesia. Expertise in React Native (mobile), React (web), and now Astro. Opinions backed by experience.

**Style guidelines:**
- Write in first person ("I", "we") for authority and relatability
- Keep sentences short and punchy
- Use active voice (avoid "was", "is being")
- Provide practical, actionable insights
- Include code examples when relevant
- Link to related content or external resources
- Be opinionated but respectful of alternatives
- Avoid jargon; explain technical terms

**Post structure:**
1. **Hook:** Why this topic matters
2. **Context:** What problem does this solve?
3. **Deep dive:** Explanation with examples
4. **Practical application:** How to use this
5. **Conclusion:** Takeaway, next steps

### Indonesian (index.id.md)

**Language:** Correct, professional Bahasa Indonesia. Not machine-translated from English.

**Tone:** Match English version's conversational professionalism.

**Translation approach:**
- Translate meaning, not word-for-word
- Keep technical terms in English (e.g., "React", "TypeScript") where appropriate
- Adapt examples to Indonesian context where it makes sense
- Preserve the author's voice

**Style guidelines:**
- Use formal "Anda" (you) or casual "kamu" depending on context (usually formal for professional content)
- Keep sentences short
- Use standard Indonesian spelling and grammar
- Provide context for Indonesian readers if culturally relevant

---

## Frontmatter Field Details

### Shared Fields

**`draft: Boolean`**
- `true` — Exclude from production builds. Useful for work-in-progress content.
- `false` — Include in production builds (default).

**`featured: Boolean`**
- `true` — Pin to top of listing pages (/posts, /projects, /npmjs). Home page shows featured items.
- `false` — Normal listing order (default).

**`lang: String`**
- MUST be `"en"` for `index.md` files
- MUST be `"id"` for `index.id.md` files
- Never mixed or inconsistent

**`date: String`**
- ISO 8601 format: `"YYYY-MM-DDTHH:MM:SSZ"`
- Example: `"2024-02-15T09:30:00Z"`
- Use `Z` for UTC timezone
- Even if you don't know exact time, use `T00:00:00Z`

**`keywords: Array`**
- 3-5 relevant keywords for SEO
- Lowercase, no duplicates
- Example: `["react", "performance", "optimization"]`

---

## File Creation Workflow

### Step 1: Create the slug directory
```bash
mkdir -p src/content/posts/my-new-post
```

### Step 2: Create both language files
```bash
touch src/content/posts/my-new-post/index.md
touch src/content/posts/my-new-post/index.id.md
```

### Step 3: Write frontmatter (identical structure in both files, except `lang` field)

**index.md:**
```yaml
---
title: "My Post Title"
subtitle: "Short description"
description: "SEO description"
date: "2024-02-15T00:00:00Z"
draft: false
featured: false
keywords: ["keyword1", "keyword2"]
lang: "en"
---

# English content starts here...
```

**index.id.md:**
```yaml
---
title: "Judul Post Saya"
subtitle: "Deskripsi singkat"
description: "Deskripsi untuk SEO"
date: "2024-02-15T00:00:00Z"
draft: false
featured: false
keywords: ["keyword1", "keyword2"]
lang: "id"
---

# Konten bahasa Indonesia dimulai di sini...
```

### Step 4: Write content in markdown (MDX supported)

Use standard markdown + JSX components. The site supports all MDX features.

### Step 5: Test locally
```bash
bun run dev
```
Visit http://localhost:4321 (EN) and http://localhost:4321/id (ID) to verify.

### Step 6: Build and verify
```bash
bun run build
bun run verify:routes
```

---

## Date Handling

**ISO 8601 format required:** `YYYY-MM-DDTHH:MM:SSZ`

**How to get ISO dates:**
```javascript
new Date("2024-02-15").toISOString()
// Output: "2024-02-15T00:00:00.000Z"
// Remove milliseconds: "2024-02-15T00:00:00Z"
```

**Dates in posts display as:** "Feb 15, 2024" (formatted by `FormattedDate.astro`)

---

## Anti-Patterns (NEVER Do These)

- **Create only one language file:** Always create both `index.md` AND `index.id.md`
- **Use different frontmatter structure in EN vs ID:** Same fields, only `lang` differs
- **Use incorrect date format:** Always use `YYYY-MM-DDTHH:MM:SSZ`
- **Leave frontmatter fields blank:** Fill all required fields
- **Use camelCase or snake_case slugs:** Only kebab-case
- **Translate English title literally into Indonesian:** Adapt the title to read naturally in Indonesian
- **Use `draft: true` for finished content:** Use only for WIP
- **Forget the `lang` field:** ALWAYS include it, matching the file language
- **Copy-paste English content for Indonesian:** Write proper Indonesian, even if shorter/different
- **Use relative imports in markdown:** Link using site URLs (`/posts/slug`, `/id/posts/slug`)

---

## Verification Checklist

Before committing content:

- ✓ Both `index.md` and `index.id.md` files exist in the slug directory
- ✓ Frontmatter is valid YAML with all required fields
- ✓ `lang: "en"` in index.md, `lang: "id"` in index.id.md
- ✓ `date` field is ISO 8601 format with Z timezone
- ✓ No typos in field names (common mistake: `authors` vs `author`)
- ✓ `keywords` is an array, not a string
- ✓ English content is natural and conversational
- ✓ Indonesian content is properly written (not machine-translated)
- ✓ Slug is kebab-case
- ✓ No broken links in content
- ✓ Images/media are optimized webp if possible
- ✓ Run `bun run dev` and verify both EN and ID versions render
- ✓ Run `bun run build && bun run verify:routes` — no errors

---

## Key Files to Reference

- `src/content/config.ts` — Collection schemas and validation (read if unsure about field types)
- `src/content/posts/git-commit-message-convention/` — Example post entry (read for structure)
- `src/lib/utils.ts` — `formatDate()` function (how dates are displayed)
- `src/i18n/utils.ts` — `useTranslations()` helper (how content is translated)

When in doubt, look at existing entries. Consistency is key.

---

## Example: Creating a New Blog Post

**Command:**
```bash
mkdir -p src/content/posts/my-new-article
touch src/content/posts/my-new-article/index.md
touch src/content/posts/my-new-article/index.id.md
```

**index.md:**
```markdown
---
title: "Building Accessible React Components"
subtitle: "A practical guide to WCAG compliance"
description: "Learn how to build accessible React components that work for everyone"
date: "2024-02-15T10:00:00Z"
draft: false
featured: false
keywords: ["react", "accessibility", "wcag", "a11y"]
lang: "en"
---

# Building Accessible React Components

Accessibility isn't a feature—it's a responsibility. In this post, I'll share practical techniques for building React components that work for everyone.

## Why Accessibility Matters

...content continues...
```

**index.id.md:**
```markdown
---
title: "Membangun Komponen React yang Aksesibel"
subtitle: "Panduan praktis kepatuhan WCAG"
description: "Pelajari cara membangun komponen React yang aksesibel untuk semua orang"
date: "2024-02-15T10:00:00Z"
draft: false
featured: false
keywords: ["react", "accessibility", "wcag", "a11y"]
lang: "id"
---

# Membangun Komponen React yang Aksesibel

Aksesibilitas bukan sekadar fitur—ini adalah tanggung jawab. Dalam artikel ini, saya akan berbagi teknik praktis untuk membangun komponen React yang bekerja untuk semua orang.

## Mengapa Aksesibilitas Penting

...konten lanjutan...
```

Then:
```bash
bun run dev        # Test locally
bun run build      # Build for production
```

Done! The content will appear on `/posts/building-accessible-react-components` (EN) and `/id/posts/building-accessible-react-components` (ID).
