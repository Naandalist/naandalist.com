import { Marquee } from '@devnomic/marquee'
import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
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
}

const StackIcon: React.FC<StackIconProps> = ({ name, className }) => {
  const img = (src: string, extra?: string) => (
    <img
      src={src}
      alt=""
      width={32}
      height={32}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn('size-8', extra)}
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

interface Stack {
  name: string
  alt: string
  url: string
}

const row1: Stack[] = [
  // Languages
  { name: 'js', alt: 'JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { name: 'ts', alt: 'TypeScript', url: 'https://typescriptlang.org' },
  { name: 'py', alt: 'Python', url: 'https://python.org' },
  { name: 'kotlin', alt: 'Kotlin', url: 'https://kotlinlang.org' },
  { name: 'swift', alt: 'Swift', url: 'https://swift.org' },
  { name: 'cpp', alt: 'C++', url: 'https://isocpp.org' },
  { name: 'bash', alt: 'Bash', url: 'https://gnu.org/software/bash' },
  { name: 'html', alt: 'HTML', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
  { name: 'css', alt: 'CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
  { name: 'md', alt: 'Markdown', url: 'https://commonmark.org' },
  // Frontend
  { name: 'react', alt: 'React', url: 'https://react.dev' },
  { name: 'redux', alt: 'Redux', url: 'https://redux.js.org' },
  { name: 'nextjs', alt: 'Next.js', url: 'https://nextjs.org' },
  { name: 'astro', alt: 'Astro', url: 'https://astro.build' },
  { name: 'gatsby', alt: 'Gatsby', url: 'https://gatsbyjs.com' },
  { name: 'svelte', alt: 'Svelte', url: 'https://svelte.dev' },
  { name: 'alpinejs', alt: 'Alpine.js', url: 'https://alpinejs.dev' },
  { name: 'jquery', alt: 'jQuery', url: 'https://jquery.com' },
  { name: 'materialui', alt: 'Material UI', url: 'https://mui.com' },
  { name: 'tailwind', alt: 'Tailwind CSS', url: 'https://tailwindcss.com' },
  // Mobile and desktop
  { name: 'flutter', alt: 'Flutter', url: 'https://flutter.dev' },
  { name: 'electron', alt: 'Electron', url: 'https://electronjs.org' },
  // Backend and runtimes
  { name: 'nodejs', alt: 'Node.js', url: 'https://nodejs.org' },
  { name: 'bun', alt: 'Bun', url: 'https://bun.sh' },
  { name: 'deno', alt: 'Deno', url: 'https://deno.com' },
  { name: 'express', alt: 'Express', url: 'https://expressjs.com' },
  { name: 'adonis', alt: 'AdonisJS', url: 'https://adonisjs.com' },
  { name: 'django', alt: 'Django', url: 'https://djangoproject.com' },
  { name: 'laravel', alt: 'Laravel', url: 'https://laravel.com' },
  { name: 'wordpress', alt: 'WordPress', url: 'https://wordpress.org' },
  { name: 'odoo', alt: 'Odoo', url: 'https://odoo.com' },
]

const row2: Stack[] = [
  // Databases and BaaS
  { name: 'postgres', alt: 'PostgreSQL', url: 'https://postgresql.org' },
  { name: 'mysql', alt: 'MySQL', url: 'https://mysql.com' },
  { name: 'mongodb', alt: 'MongoDB', url: 'https://mongodb.com' },
  { name: 'prisma', alt: 'Prisma', url: 'https://prisma.io' },
  { name: 'supabase', alt: 'Supabase', url: 'https://supabase.com' },
  { name: 'firebase', alt: 'Firebase', url: 'https://firebase.google.com' },
  { name: 'appwrite', alt: 'Appwrite', url: 'https://appwrite.io' },
  // Cloud and hosting
  { name: 'aws', alt: 'AWS', url: 'https://aws.amazon.com' },
  { name: 'azure', alt: 'Azure', url: 'https://azure.microsoft.com' },
  { name: 'cloudflare', alt: 'Cloudflare', url: 'https://cloudflare.com' },
  { name: 'vercel', alt: 'Vercel', url: 'https://vercel.com' },
  { name: 'netlify', alt: 'Netlify', url: 'https://netlify.com' },
  { name: 'heroku', alt: 'Heroku', url: 'https://heroku.com' },
  { name: 'nginx', alt: 'Nginx', url: 'https://nginx.org' },
  // DevOps and version control
  { name: 'docker', alt: 'Docker', url: 'https://docker.com' },
  { name: 'jenkins', alt: 'Jenkins', url: 'https://jenkins.io' },
  { name: 'githubactions', alt: 'GitHub Actions', url: 'https://github.com/features/actions' },
  { name: 'git', alt: 'Git', url: 'https://git-scm.com' },
  { name: 'github', alt: 'GitHub', url: 'https://github.com' },
  { name: 'gitlab', alt: 'GitLab', url: 'https://gitlab.com' },
  { name: 'bitbucket', alt: 'Bitbucket', url: 'https://bitbucket.org' },
  // Testing and monitoring
  { name: 'jest', alt: 'Jest', url: 'https://jestjs.io' },
  { name: 'vitest', alt: 'Vitest', url: 'https://vitest.dev' },
  { name: 'postman', alt: 'Postman', url: 'https://postman.com' },
  { name: 'sentry', alt: 'Sentry', url: 'https://sentry.io' },
]

const row3: Stack[] = [
  // Build and package managers
  { name: 'vite', alt: 'Vite', url: 'https://vite.dev' },
  { name: 'webpack', alt: 'webpack', url: 'https://webpack.js.org' },
  { name: 'babel', alt: 'Babel', url: 'https://babeljs.io' },
  { name: 'gradle', alt: 'Gradle', url: 'https://gradle.org' },
  { name: 'npm', alt: 'npm', url: 'https://npmjs.com' },
  { name: 'pnpm', alt: 'pnpm', url: 'https://pnpm.io' },
  { name: 'yarn', alt: 'Yarn', url: 'https://yarnpkg.com' },
  // Editors and IDEs
  { name: 'vscode', alt: 'VS Code', url: 'https://code.visualstudio.com' },
  { name: 'atom', alt: 'Atom', url: 'https://github.com/atom/atom' },
  { name: 'androidstudio', alt: 'Android Studio', url: 'https://developer.android.com/studio' },
  { name: 'anaconda', alt: 'Anaconda', url: 'https://anaconda.com' },
  // AI
  { name: 'claude', alt: 'Claude', url: 'https://claude.ai' },
  { name: 'codex', alt: 'Codex', url: 'https://openai.com/codex' },
  { name: 'grokbot', alt: 'Grok', url: 'https://grok.com' },
  { name: 'deepseek', alt: 'DeepSeek', url: 'https://deepseek.com' },
  { name: 'kimi', alt: 'Kimi', url: 'https://kimi.com' },
  { name: 'huggingface', alt: 'Hugging Face', url: 'https://huggingface.co' },
  // Design and creative
  { name: 'figma', alt: 'Figma', url: 'https://figma.com' },
  { name: 'ae', alt: 'After Effects', url: 'https://adobe.com/products/aftereffects.html' },
  { name: 'godot', alt: 'Godot', url: 'https://godotengine.org' },
  // Productivity and community
  { name: 'notion', alt: 'Notion', url: 'https://notion.so' },
  { name: 'obsidian', alt: 'Obsidian', url: 'https://obsidian.md' },
  { name: 'discord', alt: 'Discord', url: 'https://discord.com' },
  { name: 'gmail', alt: 'Gmail', url: 'https://mail.google.com' },
  { name: 'dev', alt: 'DEV', url: 'https://dev.to' },
  // Operating systems
  { name: 'linux', alt: 'Linux', url: 'https://linux.org' },
  { name: 'ubuntu', alt: 'Ubuntu', url: 'https://ubuntu.com' },
  { name: 'debian', alt: 'Debian', url: 'https://debian.org' },
  { name: 'mint', alt: 'Linux Mint', url: 'https://linuxmint.com' },
  { name: 'apple', alt: 'macOS', url: 'https://apple.com/macos' },
  { name: 'windows', alt: 'Windows', url: 'https://microsoft.com/windows' },
]

export default function TechStackSlider() {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [marqueeKey, setMarqueeKey] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 768px)')
    const handle = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    setIsDesktop(mq.matches)
    mq.addEventListener('change', handle)

    const rerun = () => {
      // bump key to force remount of Marquee rows
      setMarqueeKey((p) => p + 1)
    }
    document.addEventListener('astro:page-load', rerun)
    window.addEventListener('astro:page-load', rerun)

    return () => {
      mq.removeEventListener('change', handle)
      document.removeEventListener('astro:page-load', rerun)
      window.removeEventListener('astro:page-load', rerun)
    }
  }, [])


  return (
    <div
      className="relative mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-lg"
      style={{ background: 'transparent' }}
    >
      <div className="flex flex-1 flex-col justify-center">
        {/* Row 1 */}
        <Marquee
          key={`row1-${marqueeKey}`}
          fade={true}
          direction="left"
          pauseOnHover={hoveredKey !== null || isDesktop}
          className="mb-4 transform rotate-1"
          innerClassName="gap-2 [--duration:148s]"
        >
          {row1.map((stack) => (
            <Tooltip key={stack.name} label={stack.alt}>
              <a
                href={stack.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={stack.alt}
                className="relative mx-1 sm:mx-2 flex h-12 w-14 cursor-pointer items-center justify-center rounded-md bg-linear-to-br from-[#ffffff] to-[#e6e6e6] dark:from-[#1f1f1f] dark:to-[#0e0e0e] border border-black/10 dark:border-transparent p-2 sm:p-2 shadow-2"
                onMouseEnter={() => setHoveredKey(stack.name)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <div className="absolute h-12 w-14 rounded-md border-2 border-b-0 border-r-0 border-white dark:border-[#2a2a2a] pointer-events-none" />
                <span
                  className="h-full w-full select-none flex items-center justify-center transition-all duration-150 text-neutral-900 dark:text-white"
                  draggable={false}
                >
                  {hoveredKey === stack.name ? (
                    <ExternalLink size="1.6em" className="sm:hidden text-neutral-800 dark:text-white/80" aria-hidden="true" />
                  ) : (
                    <StackIcon name={stack.name} className="flex sm:hidden" />
                  )}
                  {hoveredKey === stack.name ? (
                    <ExternalLink size="1.6em" className="hidden sm:inline text-neutral-800 dark:text-white/80" aria-hidden="true" />
                  ) : (
                    <StackIcon name={stack.name} className="hidden sm:flex" />
                  )}
                </span>
              </a>
            </Tooltip>
          ))}
        </Marquee>

        {/* Row 2 */}
        <Marquee
          key={`row2-${marqueeKey}`}
          fade={true}
          direction="left"
          reverse={true}
          pauseOnHover={hoveredKey !== null || isDesktop}
          className="mb-4 transform rotate-1"
          innerClassName="gap-2 [--duration:80s]"
        >
          {row2.map((stack) => (
            <Tooltip key={stack.name} label={stack.alt}>
              <a
                href={stack.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={stack.alt}
                className="relative mx-1 sm:mx-2 flex h-12 w-14 cursor-pointer items-center justify-center rounded-md bg-linear-to-br from-[#ffffff] to-[#e6e6e6] dark:from-[#1f1f1f] dark:to-[#0e0e0e] border border-black/10 dark:border-transparent p-2 sm:p-2 shadow-2"
                onMouseEnter={() => setHoveredKey(stack.name)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <div className="absolute h-12 w-14 rounded-md border-2 border-b-0 border-r-0 border-white dark:border-[#2a2a2a] pointer-events-none" />
                <span
                  className="h-full w-full select-none flex items-center justify-center transition-all duration-150 text-neutral-900 dark:text-white"
                  draggable={false}
                >
                  {hoveredKey === stack.name ? (
                    <ExternalLink size="1.6em" className="sm:hidden text-neutral-800 dark:text-white/80" aria-hidden="true" />
                  ) : (
                    <StackIcon name={stack.name} className="flex sm:hidden" />
                  )}
                  {hoveredKey === stack.name ? (
                    <ExternalLink size="1.6em" className="hidden sm:inline text-neutral-800 dark:text-white/80" aria-hidden="true" />
                  ) : (
                    <StackIcon name={stack.name} className="hidden sm:flex" />
                  )}
                </span>
              </a>
            </Tooltip>
          ))}
        </Marquee>

        {/* Row 3 */}
        <Marquee
          key={`row3-${marqueeKey}`}
          fade={true}
          direction="left"
          pauseOnHover={hoveredKey !== null || isDesktop}
          className="mb-4 transform rotate-1"
          innerClassName="gap-2 [--duration:68s]"
        >
          {row3.map((stack) => (
            <Tooltip key={stack.name} label={stack.alt}>
              <a
                href={stack.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={stack.alt}
                className="relative mx-1 sm:mx-2 flex h-12 w-14 cursor-pointer items-center justify-center rounded-md bg-linear-to-br from-[#ffffff] to-[#e6e6e6] dark:from-[#1f1f1f] dark:to-[#0e0e0e] border border-black/10 dark:border-transparent p-2 sm:p-2 shadow-2"
                onMouseEnter={() => setHoveredKey(stack.name)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <div className="absolute h-12 w-14 rounded-md border-2 border-b-0 border-r-0 border-white dark:border-[#2a2a2a] pointer-events-none" />
                <span
                  className="h-full w-full select-none flex items-center justify-center transition-all duration-150 text-neutral-900 dark:text-white"
                  draggable={false}
                >
                  {hoveredKey === stack.name ? (
                    <ExternalLink size="1.6em" className="sm:hidden text-neutral-800 dark:text-white/80" aria-hidden="true" />
                  ) : (
                    <StackIcon name={stack.name} className="flex sm:hidden" />
                  )}
                  {hoveredKey === stack.name ? (
                    <ExternalLink size="1.6em" className="hidden sm:inline text-neutral-800 dark:text-white/80" aria-hidden="true" />
                  ) : (
                    <StackIcon name={stack.name} className="hidden sm:flex" />
                  )}
                </span>
              </a>
            </Tooltip>
          ))}
        </Marquee>
      </div>
    </div>
  )
}
