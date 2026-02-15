---
name: naandalist-maintainer
description: Maintain and extend naandalist.com (Astro + Tailwind + bilingual content). Use when editing routes, content collections, UI components, SEO metadata, JSON-LD, or i18n behavior for English/Indonesian parity.
---

# Naandalist Maintainer

Follow this workflow for any non-trivial change.

## 1. Inspect the target surface
- For layout/meta changes, read:
  - `src/layouts/PageLayout.astro`
  - `src/components/Head.astro`
  - `src/components/Header.astro`
  - `src/components/Footer.astro`
- For content rendering, read the matching files under:
  - `src/components/`
  - `src/pages/`
  - `src/pages/id/`

## 2. Preserve bilingual behavior
- Keep route and link parity for:
  - English: `/...`
  - Indonesian: `/id/...`
- Use existing helpers:
  - `src/i18n/utils.ts`
  - `src/utils/language.ts`

## 3. Use existing project conventions
- Package manager/scripts: Bun
- Imports: aliases from `tsconfig.json`
- Components: Astro components (`.astro`) with typed props
- Styling: Tailwind utilities matching current design system

## 4. Validate before finishing
- Run:
  - `bun run build`
  - `bun run verify:routes`
- If change touches i18n or SEO, confirm generated `dist/` output on both `/` and `/id/` pages.

## 5. Apply focused quality gates
Read and apply:
- `references/workflows.md`
- `references/quality-gates.md`
