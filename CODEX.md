# CODEX.md — Canonical Reference

**→ See [.github/copilot-instructions.md](.github/copilot-instructions.md) for the full, authoritative project guide.**

This file is maintained for Codex-agent compatibility. All core rules, commands, architecture, and coding conventions are documented in `.github/copilot-instructions.md`.

## Why One Source of Truth?

Keeping multiple copies of project guidance causes:

- Version drift (e.g., Astro 5 vs 6)
- Inconsistent examples
- Confusion about which rules to follow

The `.github/copilot-instructions.md` file is the canonical reference and is kept in sync with the actual project state.

## Quick Links

- **Full guide**: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- **Build**: `bun run build` (type-check + build)
- **Dev**: `bun run dev` (localhost:4321)
- **Lint**: `bun run lint:fix` (auto-fix)
- **Verify**: `bun run verify:routes` (check i18n paths)

## High-Risk Areas (Validation Checklist)

When working with i18n or content changes:

1. **Locale correctness on `/id/*` pages:**
   - `<html lang>` matches locale
   - `meta[name="language"]` correct
   - Open Graph locale consistent
   - Nav and internal links use correct locale path

2. **Content bilingual parity:**
   - Both `index.md` (EN) and `index.id.md` (ID) present for new content
   - Frontmatter `lang` field set correctly
   - Slug cleanup: no English bleeding into ID routes

3. **Structured data (JSON-LD):**
   - Language attribute matches locale
   - Canonical URL is locale-aware

## Definition of Done

✓ Build passes: `bun run build`
✓ Routes verified: `bun run verify:routes`
✓ Links validated: both `/` and `/id/` paths work
✓ No hardcoded English paths in Indonesian views
