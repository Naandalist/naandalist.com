import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

// Colored icons from github.com/tandpfun/skill-icons (MIT), stored in public/static/skills.
// skill-icons has no Odoo or AI icons. odoo-*.svg and neon-*.svg are drawn in-house; grokbot, codex, claude, kimi, deepseek and
// huggingface wrap marks from github.com/lobehub/lobe-icons (MIT) in the same tile style.
// Icons in THEMED ship as <name>-dark.svg and <name>-light.svg; the rest are a single <name>.svg.
const THEMED = new Set([
  'alpinejs', 'anaconda', 'androidstudio', 'apple', 'astro', 'aws', 'azure', 'bash', 'bitbucket', 'bun', 'cloudflare', 'cloudinary',
  'debian', 'deno', 'dev', 'drizzle', 'dynatrace', 'express', 'fastlane', 'figma', 'firebase', 'flutter', 'gemini', 'github', 'githubactions', 'gitlab',
  'gmail', 'gradle', 'godot', 'jenkins', 'jsdelivr', 'kotlin', 'laravel', 'linux', 'maestro', 'md', 'materialui', 'mint', 'mysql',
  'netlify', 'nextjs', 'nodejs', 'notion', 'odoo', 'npm', 'obsidian', 'pnpm', 'postgres', 'py', 'react', 'react-query', 'resend', 'snyk', 'supabase',
  'tailwind', 'tiptap', 'ubuntu', 'grokbot', 'codex', 'claude', 'kimi', 'deepseek', 'huggingface', 'vercel', 'vite', 'vitest', 'vscode', 'webpack', 'windows', 'yarn',
])

const ICON_BASE = '/static/skills'

interface StackIconProps {
  name: string
  className?: string
  /** Classes for the image itself, for example a size other than the default size-8. */
  imgClassName?: string
}

/** One painted tile. Light/dark swap via CSS so themed icons are not two images in the DOM. */
export function StackIcon({ name, className, imgClassName }: StackIconProps) {
  const themed = THEMED.has(name)
  const light = `${ICON_BASE}/${themed ? `${name}-light` : name}.svg`
  const dark = themed ? `${ICON_BASE}/${name}-dark.svg` : light
  return (
    <span className={cn('items-center justify-center', className)} aria-hidden="true">
      <span
        className={cn(
          'inline-block size-8 bg-contain bg-center bg-no-repeat [background-image:var(--skill-light)] dark:[background-image:var(--skill-dark)]',
          imgClassName,
        )}
        style={{ '--skill-light': `url("${light}")`, '--skill-dark': `url("${dark}")` } as CSSProperties}
      />
    </span>
  )
}
