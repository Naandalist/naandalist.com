# CODEX.md — Agent Context for naandalist.com

## Scope
Use this file as Codex-specific working guidance for this repository.

## Core Rules
- Use `bun` for all scripts.
- Use path aliases (`@components`, `@lib`, `@layouts`, etc.), not deep relative imports.
- Keep bilingual parity: all route/content behavior must work for both `en` and `id`.
- Do not run git operations in this repo unless explicitly requested.

## Fast Commands
- `bun run dev` — start local dev server
- `bun run build` — type-check + build
- `bun run lint` — lint
- `bun run lint:fix` — auto-fix lint issues
- `bun run verify:routes` — check i18n route output in `dist/`

## Architecture Snapshot
- Framework: Astro 5 + Tailwind CSS 3 + TypeScript strict
- Content collections: `posts`, `projects`, `work`, `npmjs`
- i18n: default `en`; Indonesian under `/id/*`
- Layout shell: `/src/layouts/PageLayout.astro`
- SEO/meta: `/src/components/Head.astro`
- JSON-LD: `/src/lib/jsonld.ts`

## High-Risk Areas (Check Every Time)
- Locale correctness on `/id/*` pages:
  - `<html lang>`
  - `meta[name="language"]`
  - Open Graph locale
  - locale-aware nav and internal links
- Structured data language and canonical URL consistency
- Content slug cleanup for `index.id.md` routes

## Definition of Done
1. Build passes: `bun run build`
2. Route verification passes: `bun run verify:routes`
3. Changed links and metadata validated for both `/` and `/id/` paths
4. No new hardcoded English paths in Indonesian views
