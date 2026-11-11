import { cn } from '@/lib/utils'

// Colored icons from github.com/tandpfun/skill-icons (MIT), stored in public/static/skills.
// skill-icons has no Odoo or AI icons. odoo-*.svg is drawn in-house; grokbot, codex, claude, kimi, deepseek and
// huggingface wrap marks from github.com/lobehub/lobe-icons (MIT) in the same tile style.
// Icons in THEMED ship as <name>-dark.svg and <name>-light.svg; the rest are a single <name>.svg.
const THEMED = new Set([
  'alpinejs', 'anaconda', 'androidstudio', 'apple', 'aws', 'azure', 'bash', 'bitbucket', 'bun', 'cloudflare',
  'debian', 'deno', 'dev', 'express', 'figma', 'firebase', 'flutter', 'github', 'githubactions', 'gitlab',
  'gmail', 'gradle', 'godot', 'jenkins', 'kotlin', 'laravel', 'linux', 'md', 'materialui', 'mint', 'mysql',
  'netlify', 'nextjs', 'nodejs', 'notion', 'odoo', 'npm', 'obsidian', 'pnpm', 'postgres', 'py', 'react', 'supabase',
  'tailwind', 'ubuntu', 'grokbot', 'codex', 'claude', 'kimi', 'deepseek', 'huggingface', 'vercel', 'vite', 'vitest', 'vscode', 'webpack', 'windows', 'yarn',
])

const ICON_BASE = '/static/skills'

interface StackIconProps {
  name: string
  className?: string
  /** Classes for the image itself, for example a size other than the default size-8. */
  imgClassName?: string
}

export function StackIcon({ name, className, imgClassName }: StackIconProps) {
  const img = (src: string, extra?: string) => (
    <img
      src={src}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn('size-8', imgClassName, extra)}
    />
  )
  return (
    <span className={cn('items-center justify-center', className)} aria-hidden="true">
      {THEMED.has(name) ? (
        <>
          {img(`${ICON_BASE}/${name}-light.svg`, 'dark:hidden')}
          {img(`${ICON_BASE}/${name}-dark.svg`, 'hidden dark:block')}
        </>
      ) : (
        img(`${ICON_BASE}/${name}.svg`)
      )}
    </span>
  )
}
