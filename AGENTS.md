# AGENTS.md

Personal site for naandalist. Astro (static output, Vercel adapter) with React islands, Tailwind v4, Bun. Generic working rules come from the dotagent, the facts below are this repo's.

## Start here

- Tokens and UI rules: `docs/design-system.md`
- Setup and env var names: `README.md`

## Commands

- Gate (run before every PR, same as CI): `bun run check && bun run lint && bun run check:tokens && bun test && bun run build`
- Dev: `bun install`, `bun run dev`
- Type check: `bun run check`. Lint: `bun run lint` (Biome). Token lint: `bun run check:tokens`. Build: `bun run build`. Test: `bun test` (one file: `bun test tests/github.test.ts`)
- Format with Biome locally: `bun run format`. Format is not in the gate yet; do not mass-reformat unless that is the task.
- Runtime is Bun, not Node. Scripts in `scripts/` are `.ts` and run with `bun scripts/<name>.ts`. CI uses `oven-sh/setup-bun`.
- Vercel: install uses Bun via `bun.lock` (confirm `bun install` in the build log). Functions run on Node (`engines.node: 24.x`). Do not set `bunVersion` in `vercel.json` until Vercel lists Astro on the Bun runtime.

## Workflow

- Branch from `main`. One task is one branch and one PR.
- Commits are one line, `type(scope): summary`, no trailer. Types: `feat`, `fix`, `hotfix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `revert`, `ci`, `build`. Scope is required.
- Names say what changed. Never a plan label (`milestone-1`, `task-2`, `wip`, "finishing task") and never `(#N)`.
- Never edit protected paths: `bun.lock`, `.env*`.
- Touch only what the task needs. Do not add a dependency without asking.

## Editing UI

- Use only tokens from `docs/design-system.md`. Add a missing token there and in `src/styles/global.css` first.
- No raw hex, `px`/`rem`, or `clamp()` in components, except the rare one-off with `token-ok` and a reason.
- Cards, buttons, chips, and dialogs use the glass style (`glass-card`, `rounded-full` buttons, no `metal`). The rules and the border-colour gotcha are in `docs/design-system.md`.
- Titles outside blog use `font-title`. Blog stays sans.
- Keep layout and sizes stable. Do not change dimensions, fonts, or spacing for performance alone.

## New page

- Add it under `src/pages/` and wrap it in `Layout.astro` with `title` and `description`.
- Use existing components and tokens. Do not add a new dependency for something CSS or the platform does.
- Check at 320, 768, and 1440 px.

## Performance

- Islands: `client:visible` or `client:idle` for anything below the fold. `client:load` only if needed on first paint.
- Images: WebP, explicit width and height, lazy unless above the fold.
- Measure before and after: build, serve `dist/client` with gzip, then run Lighthouse on mobile and desktop.
- Data that must stay fresh is fetched at runtime (see `GithubGraph.tsx` and `/api/contributions`), not baked at build.

## Done means

- The gate passes.
- Visual check on the pages you touched. No layout shift.
- Update `docs/design-system.md` if a token changed, and `README.md` if a claim changed.
- Update `public/scratch/lighthouse.png` when the desktop scores change.

## Secrets

- Never commit values from `.env`. Names only in `README.md`.
