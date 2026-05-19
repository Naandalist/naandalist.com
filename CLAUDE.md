# CLAUDE.md — Canonical Reference

**→ See [.github/copilot-instructions.md](.github/copilot-instructions.md) for the full, authoritative project guide.**

This file is maintained for Claude-based agent compatibility. All core rules, commands, architecture, and coding conventions are documented in `.github/copilot-instructions.md`.

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

## Claude-Agent-Specific Notes

- Use the project skills for content and design tasks:
  - `naandalist-content` — create/edit bilingual posts, projects, work, npm entries
  - `naandalist-design` — Astro components matching the glassmorphic dark design
- Always check `.github/copilot-instructions.md` before proposing changes
- Ask clarifying questions if requirements conflict with documented conventions
