---
name: naandalist-design
description: Guides creation of Astro components that match naandalist.com's dark, glassmorphic design system with cyan accents and precise spacing.
license: MIT
---

# Naandalist Design System

You are helping a developer maintain and extend naandalist.com's unique design aesthetic. This portfolio site is built with Astro 7, Tailwind CSS, and features a sophisticated dark theme with glassmorphism effects, precision spacing, and a signature cyan accent color.

## When to Use This Skill

Invoke `/naandalist-design` when creating or modifying UI components, pages, or any visual elements. Use it before writing any Astro component code.

## Design Principles

**Overall aesthetic:** Minimalist dark mode with subtle glassmorphism, precise white-space management, and intentional color constraints. Typography-driven. Cyan accent color for inline links, not card hover.

**Design philosophy:** Every pixel has purpose. Avoid clutter. Let white space breathe. Use consistent spacing relationships throughout. Motion should be purposeful, never decorative.

---

## Color System

**Primary background:** `bg-neutral-900` (hex `#171717`)
**Primary text:** `text-neutral-300` — readable on dark, not pure white
**Accent color:** `#18dcff` (inline links, focus rings)
**Accent hover:** `#17c0eb` (slightly darker cyan)
**Neutral grays (muted):** `text-neutral-400`, `text-neutral-700`, `text-neutral-800`
**White overlays:** `white/5`, `white/10`, `white/20`, `white/30`, `white/40`, `white/60`, `white/70`

**Cards & borders:** `border border-white/20` with class `card-hover`
**Card hover:** `hover:border-white/40 hover:shadow-[0_0_18px] hover:shadow-white/15`
**Disabled/muted state:** `text-white/40` or `text-neutral-500`
**Success accent:** `#10b981` (green-500, used only for "copied" feedback)

**NEVER use:** Light backgrounds, blue/cyan glow on cards, high-saturation fills

---

## Container & Layout

**Page container:** Always wrap content in `mx-auto max-w-screen-sm px-5`.

**Component spacing:** `gap-2`, `gap-3`, `gap-4`, `gap-6`, `space-y-4`, `space-y-6`, `space-y-10`

**Section breaks:** Use `space-y-10` or `space-y-12` between major content sections

---

## Typography

**Font families:**
- **Sans (UI):** Inter (regular 400, semibold 600 only). Preloaded via Head.astro
- **Prose blocks:** Apply `prose prose-invert` class from @tailwindcss/typography plugin

**Heading hierarchy:**
- Page titles: `font-semibold text-white`
- Section headers: `text-xs font-medium uppercase tracking-[0.18em] text-white`
- Card titles: `font-semibold text-white` — stay white on hover
- Body text: `text-sm text-neutral-300`
- Muted/metadata: `text-xs text-neutral-400`

---

## Interactive Elements

**Links in prose:** `text-link hover:text-link-hover underline underline-offset-2 decoration-link/30 hover:decoration-link-hover/50 transition-colors duration-300`

**Focus rings:** `ring-2 ring-link ring-offset-2 ring-offset-neutral-900`
**Button baseline:** `.px-3 .py-1.5 rounded-md`

**Card hover:** Use the shared `.card-hover` class from `src/styles/global.css`. Do not turn card titles cyan.

---

## Cards & Containers

**Card base pattern:**
```
border border-white/20
rounded-lg p-4
card-hover
```

**Pill/badge pattern:**
```
bg-white/10 text-white/70 px-2 py-0.5 rounded-md text-xs
```

**Glass effect header:**
```
bg-neutral-900/10 backdrop-blur-sm saturate-200
```

---

## Animation & Motion

**Entry animations:** Add the `.animate` class. CSS uses `@starting-style` over `duration-700 ease-out`.

**Hover animations:** Card glow uses `transition-[border-color,box-shadow] duration-300`. Icon nudge can stay at 1-2px.

**NEVER:** Rotate, skew, or bounce elements. Do not use blue `shadow-link` on cards.

---

## Image Handling

**Thumbnail fallback:** `bg-gradient-to-r from-cyan-500 to-blue-500`
**Image hover state:** `group-hover:scale-105 transition-transform duration-300`

---

## Anti-Patterns (NEVER Do These)

- Light backgrounds or pure white fills
- Blue/cyan card hover glow (`hover:border-link`, `hover:shadow-link`)
- Changing card titles to `text-link` on hover
- React/JSX components
- Relative imports (`../../`)

---

## Key Files to Reference

- `src/components/ResumeCard.astro` — current card hover target
- `src/components/ArrowCard.astro` — posts / compact cards
- `src/components/ProjectCard.astro` — project cards
- `src/styles/global.css` — `.card-hover` and `.animate`
- `tailwind.config.mjs` — link color tokens
