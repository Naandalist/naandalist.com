# Workflows

## A. Add or edit page-level UI
1. Identify EN page in `src/pages/` and matching ID page in `src/pages/id/`.
2. Ensure both render the same structural behavior, with localized text/links.
3. Keep `PageLayout` usage consistent.
4. Run build and route verification.

## B. Add content entry
1. Create bilingual files in same slug directory:
- `index.md` (`lang: en`)
- `index.id.md` (`lang: id`)
2. Match frontmatter fields with `src/content/config.ts` schema.
3. Check listing and detail pages for both languages.

## C. Update SEO or structured data
1. Confirm metadata from `Head.astro` is locale-aware.
2. Confirm JSON-LD URLs and language reflect entry language.
3. Validate output in generated `dist/` pages for EN and ID examples.

## D. Update navigation or links
1. Avoid hardcoded English paths in Indonesian contexts.
2. Ensure active-state logic works for both `/foo` and `/id/foo`.
3. Keep semantics valid (no nested interactive elements like `a > button`).
