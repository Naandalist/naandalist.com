---
name: naandalist-design
description: Guides creation of Astro components that match naandalist.com's dark, glassmorphic design system with cyan accents and precise spacing.
license: MIT
---

# Naandalist Design System

You are helping a developer maintain and extend naandalist.com's unique design aesthetic. This portfolio site is built with Astro 5, Tailwind CSS, and features a sophisticated dark theme with glassmorphism effects, precision spacing, and a signature cyan accent color.

## When to Use This Skill

Invoke `/naandalist-design` when creating or modifying UI components, pages, or any visual elements. Use it before writing any Astro component code.

## Design Principles

**Overall aesthetic:** Minimalist dark mode with subtle glassmorphism, precise white-space management, and intentional color constraints. Typography-driven. Cyan accent color for interactivity.

**Design philosophy:** Every pixel has purpose. Avoid clutter. Let white space breathe. Use consistent spacing relationships throughout. Motion should be purposeful, never decorative.

---

## Color System

**Primary background:** `bg-neutral-900` (hex `#171717`)
**Primary text:** `text-neutral-300` — readable on dark, not pure white
**Accent color:** `#18dcff` (link color, focus rings, key interactive elements)
**Accent hover:** `#17c0eb` (slightly darker cyan)
**Neutral grays (muted):** `text-neutral-400`, `text-neutral-700`, `text-neutral-800`
**White overlays:** `white/5`, `white/10`, `white/20`, `white/30`, `white/60`, `white/70` — use opacity for hierarchy, never solid white on dark backgrounds

**Cards & borders:** `border border-white/20` with `hover:bg-white/5 hover:border-white/30`
**Disabled/muted state:** `text-white/40` or `text-neutral-500`
**Success accent:** `#10b981` (green-500, used only for "copied" feedback)

**NEVER use:** Light backgrounds, bright primary blues or purples, high-saturation colors, anything that reads as "generic Bootstrap UI"

---

## Container & Layout

**Page container:** Always wrap content in `mx-auto max-w-screen-sm px-5` — this constrains width to ~384px max with 5px side padding on small screens. Every component must respect this constraint.

**Component spacing:** Use Tailwind's space utilities. Standard spacing ladder: `gap-2`, `gap-3`, `gap-4`, `gap-6`, `space-y-4`, `space-y-6`, `space-y-10` (for section breaks)

**Section breaks:** Use `space-y-10` or `space-y-12` between major content sections

---

## Typography

**Font families:**
- **Sans (UI):** Inter (regular 400, semibold 600 only). Preloaded via Head.astro
- **Serif (editorial):** Lora available as fallback for accent text, but rarely used
- **Prose blocks:** Apply `prose prose-invert` class from @tailwindcss/typography plugin

**Heading hierarchy:**
- Page titles: `text-xl sm:text-2xl font-semibold text-white`
- Section headers: `text-xs font-medium uppercase tracking-[0.18em] text-white`
- Card titles: `font-semibold text-white`
- Body text: `text-sm text-neutral-300`
- Muted/metadata: `text-xs text-neutral-400`

---

## Interactive Elements

**Links:** `text-link hover:text-link-hover underline underline-offset-2 decoration-link/30 hover:decoration-link-hover/50 transition-colors duration-300`
All interactive text should use this pattern — consistent cyan on dark, smooth color transitions.

**Focus rings:** `ring-2 ring-link ring-offset-2 ring-offset-neutral-900` — using the cyan accent color
**Button baseline:** `.px-3 .py-1.5 rounded-md` (adjust based on context)

**Interactive transitions:** ALWAYS include `transition-colors duration-300 ease-in-out` on any element with `:hover` state. No instant color changes.

**Hover states:** Subtle, never aggressive. Example pattern:
```
border border-white/20 hover:bg-white/5 hover:border-white/30 hover:text-white
transition-colors duration-300
```

---

## Cards & Containers

**Card base pattern:**
```
border border-white/20
hover:bg-white/5 hover:text-white
transition-colors duration-300
rounded-lg p-4
```

**Pill/badge pattern:**
```
bg-white/10 text-white/70 px-2 py-0.5 rounded-md text-xs
```
Use for tech stack, skill tags, category labels. Minimal, subtle, readable.

**Glass effect header:**
```
bg-neutral-900/10 backdrop-blur-sm saturate-200
border-b border-white/10
```
Used for fixed headers, modal backgrounds. The 10% neutral-900 + backdrop blur creates subtle glassmorphism without being too flashy.

---

## Animation & Motion

**Entry animations:** Add the `.animate` class to components that need entry animation. The CSS handles the rest with `@starting-style` (opacity 0 → 1, translateY 0.75rem → 0) over `duration-700 ease-out`.

**Pattern:** Any major content section should have `.animate` class. Examples: home intro, post content, section containers.

**Hover animations:** Use `transition-colors duration-300` for color changes. For icon movement:
- `group-hover:-translate-x-1` for left-pointing icons
- `group-hover:-translate-y-2` for up-pointing icons
These subtle 2-4px movements telegraph interaction without being distracting.

**NEVER:** Rotate, skew, scale, or bounce elements. Motion should be restrained and purposeful.

---

## Component Conventions

**All components are `.astro` files.** No React, Vue, or TSX. No JSX-style syntax.

**Props:** Always type props with TypeScript interfaces. Example:
```typescript
interface Props {
  entry: CollectionEntry<"posts">;
  lang?: "en" | "id";
}
const { entry, lang = "en" } = Astro.props;
```

**Class merging:** Use `cn()` from `@lib/utils` to merge Tailwind classes with runtime conditions. Combines clsx and tailwind-merge for DX.

**SVG icons:** Load from `src/assets/icons/` or use `skillicons.dev` API. Always set `class="w-4 h-4"` or appropriate size.

**Slots:** Use Astro slots for flexible layouts. Example:
```astro
<div class="...">
  <slot />
</div>
```

---

## Common Component Patterns

**Section header with description:**
```astro
<h2 class="text-xs font-medium uppercase tracking-[0.18em] text-white">
  Section Title
</h2>
```

**Grid of cards (auto-responsive):**
```astro
<div class="flex flex-col gap-4">
  {/* Each card */}
</div>
```

**Link button with arrow:**
```astro
<Link href={url} class="inline-flex items-center gap-2 px-3 py-1.5">
  <span>Label</span>
  <svg class="w-4 h-4">...</svg>
</Link>
```

**Badge list:**
```astro
<div class="flex flex-wrap gap-2">
  {items.map(item => (
    <span class="bg-white/10 text-white/70 px-2 py-0.5 rounded-md text-xs">
      {item}
    </span>
  ))}
</div>
```

---

## Image Handling

**Hero/thumbnail images:** Provide webp + fallback png. Use responsive sizes attribute. Load as fetchpriority="high" only for above-fold images.

**Thumbnail fallback:** If no image provided, use `bg-gradient-to-r from-cyan-500 to-blue-500` background. Never leave blank.

**Image hover state:** `group-hover:scale-105 transition-transform duration-300` for subtle zoom. Keep scale small (105%, not 110%).

---

## Anti-Patterns (NEVER Do These)

- **Light backgrounds or light text on dark:** Use only white with opacity, never pure white
- **Generic primary-blue Tailwind colors:** Only use the site's accent `#18dcff`
- **Inline styles over Tailwind classes:** Always prefer Tailwind utilities
- **Magic numbers for spacing:** Use Tailwind's standardized spacing (`gap-3`, `px-4`, etc.)
- **Hardcoded colors:** Define in Tailwind config or use existing tokens
- **React/JSX syntax in components:** This is Astro, use only `.astro` format
- **Relative imports (`../../`):** Always use import aliases (`@components`, `@lib`, etc.)
- **JavaScript animations over CSS:** Use CSS `transition` and `@starting-style` for performance
- **Excessive padding inside cards:** Keep padding consistent (`p-3` or `p-4` max)
- **Non-mobile-first responsive design:** Build small-first, then `sm:` breakpoint for tablet+

---

## Verification Checklist

Before submitting a component:

- ✓ Uses only dark colors (neutral-900 base, white/opacity overlays)
- ✓ Accent color is `#18dcff` or darker (`#17c0eb`)
- ✓ All text readable on dark background
- ✓ Proper spacing with Tailwind utilities
- ✓ Interactive elements have `transition-colors duration-300`
- ✓ Container respects `mx-auto max-w-screen-sm px-5`
- ✓ All imports use `@*` aliases, never relative paths
- ✓ Component is `.astro` file with TypeScript props
- ✓ Uses `cn()` for conditional class merging
- ✓ Follows existing component patterns (no new patterns)
- ✓ `.animate` class added to sections if appropriate

---

## Key Files to Reference

- `src/components/` — See existing components for patterns (ArrowCard, ProjectCard, Header, etc.)
- `src/styles/global.css` — Base styles, `.animate` definition, prose styling
- `tailwind.config.mjs` — Design tokens, custom colors (link)
- `src/constants.ts` — Brand info, site metadata
- `src/lib/utils.ts` — `cn()` function and other utilities

When in doubt, look at existing components first. This site has strong visual consistency—maintain it.
