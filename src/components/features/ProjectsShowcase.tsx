'use client'

import { ArrowUpRight, BookOpen, SlidersHorizontal, Link2, Check, X, Wrench } from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { PiAmazonLogo, PiOpenAiLogo } from 'react-icons/pi'
import { VscAzureDevops } from 'react-icons/vsc'
import {
  SiAstro,
  SiDjango,
  SiDocker,
  SiExpo,
  SiFastapi,
  SiFlutter,
  SiGit,
  SiGithub,
  SiGo,
  SiGooglecloud,
  SiGraphql,
  SiJavascript,
  SiKubernetes,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiRedis,
  SiRust,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiLangchain,
  SiVite,
  SiCloudinary,
  SiCreatereactapp,
  SiDrizzle,
  SiDynatrace,
  SiFastlane,
  SiGooglegemini,
  SiHermes,
  SiJest,
  SiJsdelivr,
  SiNeon,
  SiReactquery,
  SiRedux,
  SiReduxsaga,
  SiResend,
  SiSentry,
  SiSnyk
} from 'react-icons/si'

const techIconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  'Next.js': SiNextdotjs,
  React: SiReact,
  'React Native': SiReact,
  TypeScript: SiTypescript,
  TailwindCSS: SiTailwindcss,
  Supabase: SiSupabase,
  PostgreSQL: SiPostgresql,
  Python: SiPython,
  'Google Cloud': SiGooglecloud,
  Expo: SiExpo,
  OpenAI: PiOpenAiLogo,
  'Node.js': SiNodedotjs,
  Prisma: SiPrisma,
  Docker: SiDocker,
  Git: SiGit,
  Vercel: SiVercel,
  MongoDB: SiMongodb,
  Redis: SiRedis,
  GraphQL: SiGraphql,
  Astro: SiAstro,
  JavaScript: SiJavascript,
  Go: SiGo,
  Rust: SiRust,
  FastAPI: SiFastapi,
  Django: SiDjango,
  Flutter: SiFlutter,
  Kubernetes: SiKubernetes,
  AWS: PiAmazonLogo,
  Langchain: SiLangchain,
  Vite: SiVite,
  'Redux Toolkit': SiRedux,
  'RTK Query': SiRedux,
  'Redux Saga': SiReduxsaga,
  'React Query': SiReactquery,
  Snyk: SiSnyk,
  Dynatrace: SiDynatrace,
  Sentry: SiSentry,
  Jest: SiJest,
  Fastlane: SiFastlane,
  'Drizzle ORM': SiDrizzle,
  Resend: SiResend,
  Cloudinary: SiCloudinary,
  'Neon PostgreSQL': SiNeon,
  'Google Gemini': SiGooglegemini,
  Hermes: SiHermes,
  'Create React App': SiCreatereactapp,
  jsDelivr: SiJsdelivr,
  'Azure DevOps': VscAzureDevops,
}

export type ProjectItem = {
  /** Content entry id. Used for /projects/<slug> and the ?project= deep link. */
  slug: string
  hasCaseStudy?: boolean
  name: string
  description: string
  tags: string[]
  type: string[]
  asset?: string
  fallback?: string
  link?: string
  github?: string
  date?: string
  techStack?: string[]
}

const VIDEO_RE = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i
function isVideo(src: string) {
  return VIDEO_RE.test(src)
}

type Props = {
  projects: ProjectItem[]
}

/** Types that stay on the projects but get no filter button. */
const HIDDEN_FILTER_TYPES = ['AI']

export function ProjectsShowcase({ projects }: Props) {
  const [activeType, setActiveType] = useState('All')
  const [visibleCount, setVisibleCount] = useState(4)
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)

  const allTypes = [
    'All',
    ...Array.from(new Set(projects.flatMap((p) => p.type)))
      .filter((type) => !HIDDEN_FILTER_TYPES.includes(type))
      .sort(),
  ]

  const filtered =
    activeType === 'All'
      ? projects
      : projects.filter((p) => p.type.includes(activeType))

  const visibleProjects = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleTypeChange = (type: string) => {
    setActiveType(type)
    setVisibleCount(4)
  }

  // Deep linking logic
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const projectSlug = searchParams.get('project')

    if (projectSlug) {
      const found = projects.find(p => p.slug === projectSlug)
      if (found) {
        setActiveType('All')
        const index = projects.indexOf(found)
        setVisibleCount((c) => (index >= c ? index + 1 : c))
        setSelectedProject(found)

        // Wait for render/expansion
        setTimeout(() => {
          const element = document.getElementById(projectSlug)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 300)
      }
    }
  }, [projects])

  return (
    <section className="flex flex-col gap-y-5">
      {/* Section heading */}
      <div className="flex items-center gap-4">
        <h2 className="shrink-0 font-title text-2xl max-sm:leading-tight sm:text-display-sm">
          Projects
        </h2>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
          <SlidersHorizontal size={14} />
        </div>
        <div className="flex gap-1.5">
          {allTypes.map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`h-7 shrink-0 rounded-full border-1 px-3 text-xs font-medium transition-colors duration-200 ${
                activeType === type
                  ? 'border-foreground bg-foreground text-background'
                  : 'glass-card bg-foreground/10 text-foreground backdrop-blur-md [--border-glass:var(--foreground)_/_0.3] hover:bg-foreground/20'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeType}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            initial={false}
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {visibleProjects.map((project) => (
              <motion.div
                key={project.name}
                id={project.slug}
                className="h-full scroll-mt-24"
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ProjectCard 
                  project={project} 
                  onOpenModal={() => setSelectedProject(project)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + 4)}
            className={`${buttonVariants({ variant: 'ghost' })} group`}
          >
            Load more stuff that i've built
            <span className="ml-1.5 transition-transform group-hover:translate-y-0.5">
              &darr;
            </span>
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal 
            project={selectedProject} 
            onClose={() => {
              setSelectedProject(null)
              const url = new URL(window.location.href)
              url.searchParams.delete('project')
              window.history.replaceState({}, '', url)
            }} 
          />
        )}
      </AnimatePresence>
    </section>
  )
}

function CopyLinkButton({ slug, className = "h-7 w-7", glass = false }: { slug: string; className?: string; glass?: boolean }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/projects/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const iconSize = className.includes('h-9') ? 16 : 14

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center justify-center transition-all active:scale-95 shadow-1 ${
        glass ? 'rounded-full border-1 glass-card [--border-glass:var(--foreground)_/_0.3] bg-foreground/10 text-foreground backdrop-blur-md hover:bg-foreground/20' : 'rounded-md border border-border bg-background text-foreground hover:bg-secondary'
      } ${className}`}
      aria-label="Copy project link"
      title="Copy Link"
    >
      {copied ? <Check size={iconSize} className="text-additive" aria-hidden="true" /> : <Link2 size={iconSize} aria-hidden="true" />}
    </button>
  )
}

function ProjectCard({ project, onOpenModal }: { project: ProjectItem; onOpenModal: () => void }) {
  const [hovered, setHovered] = useState(false)
  const [assetSrc, setAssetSrc] = useState(project.asset)
  const [assetErrored, setAssetErrored] = useState(false)
  // Tracked in React: a class added through the DOM is wiped when className re-renders (on hover).
  const [imgLoaded, setImgLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isInView = useInView(containerRef, { once: false, amount: 0.2 })
  // Fetch the video's first frame only when the card is about to scroll into view.
  const nearViewport = useInView(containerRef, { once: true, margin: '600px 0px 600px 0px' })

  useEffect(() => {
    setAssetSrc(project.asset)
    setAssetErrored(false)
  }, [project.asset])

  // Re-sync and re-load media on Astro view transitions
  useEffect(() => {
    const handlePageLoad = () => {
      setAssetSrc(project.asset)
      setAssetErrored(false)
      if (videoRef.current) {
        videoRef.current.load()
        if (!isMobile) {
          const playPromise = videoRef.current.play()
          if (playPromise !== undefined) {
            playPromise.catch(() => {})
          }
        }
      }
    }

    const handleBeforeSwap = () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }

    document.addEventListener('astro:page-load', handlePageLoad)
    document.addEventListener('astro:before-swap', handleBeforeSwap)

    return () => {
      document.removeEventListener('astro:page-load', handlePageLoad)
      document.removeEventListener('astro:before-swap', handleBeforeSwap)
    }
  }, [project.asset, isMobile])

  // Detect mobile viewport (disable video autoplay on mobile to save battery/data)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (videoRef.current && !isMobile) {
      if (isInView) {
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {})
        }
      } else {
        videoRef.current.pause()
      }
    }
  }, [isInView, isMobile])

  const handleError = () => {
    if (!assetErrored && project.fallback && document.visibilityState === 'visible') {
      setAssetSrc(project.fallback)
      setAssetErrored(true)
    }
  }

  return (
    // Nested links/buttons inside the card block a real <button>
    // biome-ignore lint/a11y/useSemanticElements: card hosts nested anchors; role+keyboard keep it operable
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onClick={onOpenModal}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenModal()
        }
      }}
      className="not-prose flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border-1 glass-card backdrop-blur-md shadow-1 transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-3 will-change-transform"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Media: video or image */}
      <div className="aspect-16/10 w-full overflow-hidden bg-muted relative image-loading-shimmer">
        {assetSrc && isVideo(assetSrc) ? (
          <video
            ref={videoRef}
            key={assetSrc}
            src={assetSrc}
            preload={nearViewport ? 'metadata' : 'none'}
            loop
            muted
            playsInline
            onError={(e) => {
              const video = e.currentTarget
              // Ignore aborted requests caused by page navigation
              if (video.error?.code === 1 || document.visibilityState === 'hidden') return
              handleError()
            }}
            className={`h-full w-full object-cover transition-all duration-200 ease-out ${
              hovered ? 'scale-[1.02] grayscale-0' : 'scale-100 grayscale'
            }`}
          />
        ) : assetSrc ? (

          <img
            key={assetSrc}
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0) setImgLoaded(true)
            }}
            src={assetSrc}
            alt={project.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={handleError}
            className={`h-full w-full object-cover transition-all duration-200 ease-out image-blur-load ${
              imgLoaded ? 'loaded' : ''
            } ${
              hovered ? 'scale-[1.02] grayscale-0' : 'scale-100 grayscale'
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
            No preview
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Name + Date */}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight">{project.name}</h3>
          {project.date && (
            <span className="shrink-0 whitespace-nowrap text-sm leading-tight text-muted-foreground">
              {project.date}
            </span>
          )}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" showHash={false} className="border-1 bg-foreground/10 text-foreground hover:bg-foreground/15">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground text-justify line-clamp-3">
          {project.description}
        </p>

        {/* Footer: tech icons + action buttons */}
        <div className="dashed-rule flex items-center gap-2 pt-3">
          {/* Every tech icon, wrapping onto a second line if the card is too narrow */}
          <div className="relative flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {project.techStack?.map((tech) => {
                const Icon = techIconMap[tech] ?? Wrench
                return (
                  <span
                    key={tech}
                    title={tech}
                    className="text-foreground/70 transition-colors hover:text-foreground shrink-0"
                  >
                    <Icon size={14} className="sm:hidden" aria-hidden="true" />
                    <Icon size={16} className="hidden sm:inline" aria-hidden="true" />
                  </span>
                )
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <CopyLinkButton slug={project.slug} glass />
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
                onClick={(e) => e.stopPropagation()}
                className="flex h-7 w-7 items-center justify-center rounded-full border-1 glass-card [--border-glass:var(--foreground)_/_0.3] bg-foreground/10 text-foreground backdrop-blur-md hover:bg-foreground/20 transition-colors"
              >
                <SiGithub size={14} aria-hidden="true" />
              </a>
            )}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View project"
                onClick={(e) => e.stopPropagation()}
                className="flex h-7 w-7 items-center justify-center rounded-full border-1 glass-card [--border-glass:var(--foreground)_/_0.3] bg-foreground/10 text-foreground backdrop-blur-md hover:bg-foreground/20 transition-colors"
              >
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectModal({ project, onClose }: { project: ProjectItem; onClose: () => void }) {
  const [assetSrc, setAssetSrc] = useState(project.asset)
  const [assetErrored, setAssetErrored] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setAssetSrc(project.asset)
    setAssetErrored(false)
  }, [project.asset])

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    // Prevent scrolling of body when modal is open
    document.body.style.overflow = 'hidden'
    
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'auto'
    }
  }, [onClose])

  const handleError = () => {
    if (!assetErrored && project.fallback) {
      setAssetSrc(project.fallback)
      setAssetErrored(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-background/70 backdrop-blur-2xl p-4 sm:p-4 md:p-8 cursor-pointer"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-7xl h-fit max-h-[75dvh] sm:h-175 md:h-155 overflow-hidden rounded-xl sm:rounded-lg border bg-background shadow-3 cursor-default mx-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile X close button */}
        <button
          type="button"
          onClick={onClose}
          className="md:hidden absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground/70 hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
        {/* Mobile: stacked layout */}
        <div className="flex flex-col md:grid md:grid-cols-[72%_28%] w-full h-full overflow-hidden">
          {/* Media Section */}
          <div className="relative bg-black border-b md:border-b-0 md:border-r w-full h-[30vh] md:h-full shrink-0 overflow-hidden image-loading-shimmer">
            {assetSrc && isVideo(assetSrc) ? (
              <video
                ref={videoRef}
                key={assetSrc}
                src={assetSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                onError={(e) => {
                  const video = e.currentTarget
                  if (video.error?.code === 1 || document.visibilityState === 'hidden') return
                  handleError()
                }}
                className="h-full w-full object-cover"
              />
            ) : assetSrc ? (
              <img
                key={assetSrc}
                ref={(el) => {
                  if (el?.complete && el.naturalWidth > 0) setImgLoaded(true)
                }}
                src={assetSrc}
                alt={project.name}
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                onError={handleError}
                className={`h-full w-full object-cover image-blur-load ${imgLoaded ? 'loaded' : ''}`}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">
                No preview available
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="flex flex-col min-h-0 bg-background overflow-hidden flex-1">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-8 scrollbar-hide">
              <div className="flex flex-col gap-4 sm:gap-5">
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight tracking-tight text-foreground">{project.name}</h3>
                  {project.date && (
                    <div className="flex">
                      <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-sm border border-border/50">
                        {project.date}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" showHash={false}>
                      {tag}
                    </Badge>
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground text-justify">
                  {project.description}
                </p>

                {project.hasCaseStudy && (
                  <a
                    href={`/projects/${project.slug}`}
                    className="inline-flex w-fit items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground"
                  >
                    <BookOpen size={14} aria-hidden="true" />
                    Read the case study
                  </a>
                )}

                {/* Tech Stack - Compact Grid */}
                <div className="pt-2">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-2 sm:mb-3">Powered By</h4>
                  <div className="grid grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-4 sm:gap-x-6">
                    {project.techStack?.map((tech) => {
                      const Icon = techIconMap[tech]
                      return (
                        <div key={tech} className="flex items-center gap-2 sm:gap-2.5 group">
                          <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md bg-secondary/30 border border-border/40 transition-all group-hover:bg-secondary/60 group-hover:border-foreground/20">
                            {Icon && <Icon size={12} className="sm:hidden text-foreground/60 group-hover:text-foreground transition-colors" aria-hidden="true" />}
                            {Icon && <Icon size={14} className="hidden sm:inline text-foreground/60 group-hover:text-foreground transition-colors" aria-hidden="true" />}
                          </div>
                          <span className="text-xs sm:text-xs font-medium text-foreground/50 group-hover:text-foreground transition-colors truncate">{tech}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer - Precision Consistent Height */}
            <div className="h-16 sm:h-20 shrink-0 px-4 sm:px-6 md:px-8 border-t border-border bg-background flex items-center justify-between gap-4 mt-auto">
              <div className="flex items-center gap-2">
                <CopyLinkButton slug={project.slug} className="h-9 w-9" />
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-all hover:bg-secondary active:scale-95 shadow-1"
                    title="View Source"
                  >
                    <SiGithub size={16} aria-hidden="true" />
                  </a>
                )}
              </div>

              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: 'default' }), 'gap-2 rounded-md h-9 px-5 text-xs font-bold shadow-1 active:scale-95 hover:bg-primary/85 flex items-center justify-center')}
                >
                  <ArrowUpRight size={16} aria-hidden="true" />
                  <span>Live Preview</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
