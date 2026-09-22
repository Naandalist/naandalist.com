---
name: naandalist-design
description: Brand constraints for naandalist.com. Use when creating or editing any visual UI. Defines dark theme, cyan-for-links-only, container width, type hierarchy, and Astro-only components. Does not own motion or micro-polish; defer those to better-ui and emil-design-eng.
license: MIT
---

# Naandalist design constraints

This skill is the identity gate for naandalist.com.
It does not redesign the site. It stops the agent from drifting off-brand.

Stack: Astro components + Tailwind. No React, Vue, or TSX.

When this skill conflicts with `better-ui` or `emil-design-eng`:

- This skill wins on color, type, container, and component format.
- `better-ui` wins on radius, optical alignment, surfaces, press feedback.
- `emil-design-eng` wins on whether something should animate, easing, and duration.

## Brand

- Background: `bg-neutral-900` (`#171717`). Dark only. No light theme.
- Body text: `text-neutral-300`. Not pure white for long copy.
- Headings and card titles: `text-white`. Card titles stay white on hover.
- Accent: `#18dcff` (`text-link`) and hover `#17c0eb` (`text-link-hover`).
- Accent is for inline links and focus rings only. Never for card borders, card fill, or card glow.
- Overlays: `white/5`, `white/10`, `white/20`, `white/30`, `white/40`. No solid white surfaces.
- Success (copy feedback only): `#10b981`.
- Cards: `border border-white/20` plus the shared `.card-hover` class from `src/styles/global.css`. Do not invent a second hover language.

Never: light backgrounds, purple/blue Tailwind primaries, cyan glow on cards, Bootstrap-looking fills.

## Layout

- Page width: content lives inside the existing `Container` (`max-w-screen-sm`, horizontal padding already defined). Do not widen the column.
- Spacing ladder: `gap-2`, `gap-3`, `gap-4`, `gap-6`, `space-y-4`, `space-y-6`, `space-y-10`.
- Major sections: `space-y-10` or `space-y-12`.
- Do not change header/footer structure to add sidebars or multi-column marketing layouts.

## Type

- UI font: Inter 400 / 600. Do not introduce a new UI face.
- Page title: `font-semibold text-white`.
- Section label: `text-xs font-medium uppercase tracking-[0.18em] text-white`.
- Card title: `font-semibold text-white`.
- Body: `text-sm text-neutral-300`.
- Meta: `text-xs text-neutral-400`.
- Markdown/prose: `prose prose-invert`.
- Prose links follow the existing `article a` rules in `global.css`.

## Components

- New UI is an `.astro` file. Type props in the frontmatter.
- Imports use `@components`, `@lib`, `@layouts`, `@constants`. No `../../`.
- Merge classes with `cn()` from `@lib/utils` when classes are conditional.
- Icons stay small (`w-4 h-4` unless the existing component is already larger).
- Tech chips: `bg-white/10 text-white/70 px-2 py-0.5 rounded-md text-xs`.
- Focus: `ring-2 ring-link ring-offset-2 ring-offset-neutral-900`.

## Motion

Do not freeze durations or easings in this file.

- Decide frequency / purpose / easing / duration with `emil-design-eng`.
- Decide radius, optical alignment, image edges, press scale with `better-ui`.
- Keep using the shared classes `.animate` and `.card-hover` in `src/styles/global.css`. Change those classes if polish requires it; do not fork hover styles into each component.
- Honor `prefers-reduced-motion`.
- No rotate, skew, bounce, or decorative spring libraries. No new motion dependency.

## Anti-patterns

- React/JSX in this repo
- New color tokens
- Turning titles into `text-link` on hover
- `hover:border-link` or `hover:shadow-link` on cards
- `transition: all` / `transition-all`
- Animating header, language switcher, or other high-frequency chrome
- Relative imports
- Inline styles when a Tailwind class exists

## Read these first

- `src/styles/global.css`
- `src/components/Container.astro`
- `src/components/ProjectCard.astro`
- `src/components/ArrowCard.astro`
- `src/components/Header.astro`
- `src/components/Home.astro`
