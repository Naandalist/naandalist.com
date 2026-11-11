# Design System

Single source of truth for sizes and fonts. If a value is not here, it does not exist.
Check with `bun run check:tokens` (also runs in review). Tokens live in `src/styles/global.css` under `@theme`.

## Spacing

The 2/4/8/12/16/20 rule applies to **padding** (`p-*`, `px-*`, `py-*`, `pt/pb/pl/pr-*`).
Gap and margin use Tailwind defaults.

| Token | px | Class |
|---|---|---|
| 0.5 | 2 | `p-0.5` |
| 1 | 4 | `p-1` |
| 2 | 8 | `p-2` |
| 3 | 12 | `p-3` |
| 4 | 16 | `p-4` |
| 5 | 20 | `p-5` |
| 6 | 24 | `p-6` |
| 8 | 32 | `p-8` |
| 10 | 40 | `p-10` |
| 12 | 48 | `p-12` |
| 16 | 64 | `p-16` |

Never use: `p*-1.5` (6px), `p*-2.5` (10px), `p*-3.5` (14px), or arbitrary padding such as `py-[7px]`.
Safe-area insets (`env(safe-area-inset-*)`) are allowed.

Fluid tokens (the only `clamp()` allowed for padding), set in `:root`:
- `--space-gutter` page side gutter: `px-(--space-gutter)`
- `--space-card` card padding: `p-(--space-card)`
- `--space-sec` section rhythm: `.py-section`

## Text

Body text uses **Tailwind defaults only**: `text-xs` 12, `text-sm` 14, `text-base` 16, `text-lg` 18, `text-xl` 20, `text-2xl` 24, `text-3xl` 30.
Never use: `text-[...]`, `text-md`, `text-h1..3`, `text-hero`, `text-body`, `text-fluid-*`.

Display sizes for serif titles (tokens in `@theme`):
- `text-display` clamp 40 to 64, line height 1.05, home hero name and page h1
- `text-display-md` clamp 32 to 48, line height 1.1, section titles
- `text-display-sm` 32, line height 1.15, small display titles

## Fonts

| Family | Use | Never |
|---|---|---|
| Geist (sans, default) | Body, nav, buttons, card text, labels, all blog pages | Page h1 and section titles outside blog |
| Geist Mono (`font-mono`) | Code, role and pronunciation lines, email and handle rows, numbers and stats, chart axes, dates in project cards | Body paragraphs, titles |
| Instrument Serif (`font-title`) | Page h1, section titles, About headings | Blog and blog posts, body, buttons, nav, numbers, code |
| Damion (SVG path only, no font file shipped) | The "naandalist" header signature, from `scripts/build-signature.ts` | Any live text |

## Radius

`rounded-xs` 2, `rounded-sm` 4, `rounded-md` 8, `rounded-lg` 12, `rounded-xl` 16, plus `rounded-full` and `rounded-none`.
Never use bare `rounded`, `rounded-2xl`, `rounded-3xl`, or `rounded-[...]` (except `rounded-[inherit]`).

| Use | Token |
|---|---|
| Tags, small badges | `rounded-sm` |
| Inputs, list items | `rounded-md` |
| Cards, panels, dialogs | `rounded-lg` |
| Profile cards (Home and About), chat panel | `rounded-xl` |
| All buttons and icon buttons, filter chips, pagination, avatars, the navbar pill | `rounded-full` |

## Shadow

`shadow-1` (cards, buttons), `shadow-2` (hover, popovers), `shadow-3` (modals).
Never use `shadow`, `shadow-sm|md|lg|xl|2xl`, or `shadow-[...]`.

## Borders

`--default-border-width` is 2px, so a bare `border` is 2px. Glass surfaces use a 1px border: `border-1`, `border-t-1`, `border-b-1`, `border-l-1`, `border-r-1`. Use `border-l-2` or `border-t-2` for deliberate thick lines such as timeline connectors.
A base rule forces `border-color` to `--border` on `.border`, `.border-2`, `.border-t|b|l|r`, and on `rounded-sm|md|lg`, `.card`, and `.badge`. That is why glass borders must go through `glass-card` or the 1px classes (see Glass rules below).

## Colors

Semantic tokens only: background, foreground, card, primary, secondary, muted, accent, border, additive, destructive, ring.
Never use raw hex in components.

Fluid background tokens (set in `.dark` only, used by `.fluid-bg` in `global.css`):
- `--fluid-opacity` 0.25, how strongly the clouds show over the page
- `--fluid-haze` and `--fluid-deep`, the light and deep blue stops of the still gradient shown when WebGL2 is not available

Glass tokens, used by `.glass-card` (cards, panels, chips, dialogs, bubbles, and the menu dropdown):
- `--surface-glass` fill: white at 40% in light, white at 6% in dark
- `--border-glass` border: navy at 18% in light, white at 15% in dark
- `--border-glass-hover` border on hover (pointer devices only, 0.35s): navy at 36% in light, white at 60% in dark

Pair `.glass-card` with `border-1` and `backdrop-blur-md`, in place of `bg-card/80` and `border-border`.

Glass rules:
- Buttons and icon buttons are `rounded-full`. Use `glass-card [--border-glass:var(--foreground)_/_0.3] bg-foreground/10 hover:bg-foreground/20` for a filled glass button.
- Text-only buttons (Load more, inactive pagination numbers) show glass only on hover.
- Do not use `metal` or `metal-button` on new controls. Only the glint (`.glint`) stays, on cards.
- Use `border-1`, `border-t-1`, or `border-l-2` for borders. Plain `border`, `border-2`, `border-t`, `border-b`, and `rounded-*` force the border colour to `--border` and turn glass borders near-black. `glass-card` wins over that rule because it is `!important`.
- Override a glass border colour with the variable, for example `[--border-glass:var(--foreground)_/_0.25]`. Pin the hover colour with `[--border-glass-hover:...]`.
- Do not fade edges with an opaque `from-background` gradient. Use a mask (`mask-x-from-[...]`, `mask-t-from-[...]`) so it works on glass.
- Tech icons use the coloured files in `public/static/skills` (via `StackIcon`) first, and a mono icon only when none exists.

Navbar: `.site-header-bar` in `global.css` is bare at the top. A script in `Header.astro` adds `is-scrolled` after 80px of scroll, which narrows the bar and fades in a glass pill on `::before`.

The cloud colours themselves live in the shader in `src/components/background/fluid-atmosphere.ts`, not in CSS.

## Rules for an editor (human or AI)

1. Use only the tokens above. If a size is missing, add it here and in `global.css` first, then use it.
2. Never write inline `px`, `rem`, or `clamp()` for padding, text, radius, or shadow.
3. Titles outside blog use `font-title`, never `font-mono`.
4. Run `bun run check:tokens` and `bun test` before committing.
5. One-off exception: add `token-ok` on the same line with a reason.

## Motion and data

- First visit of a session: `html[data-reveal]` is set in `Head.astro`. `.reveal-stack` children fade up with a 70ms stagger (opacity and transform only, so no layout shift). Reduced motion disables it.
- GitHub contribution graph (`GithubGraph.tsx`) starts with build-time data and refetches `/api/contributions` on mount. Set `GITHUB_TOKEN` (read-only, public data) in Vercel for the GraphQL path; without it the public contributions page is used, and without both the card shows an empty state.
