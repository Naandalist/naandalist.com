import { Camera, Check, Copy, Mail, MessageCircle } from 'lucide-react'
import * as React from 'react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import BabysBreathField from '@/components/profile/BabysBreathField'
import type { Scene } from '@/hooks/useBabysBreath'

/** The scene drawn in the card's bottom band. */
const CARD_SCENE: Scene = 'hike'

export interface ProfileLink {
  kind: 'mail' | 'linkedin' | 'github' | 'photo' | 'chat'
  label: string
  href: string
}

export interface RoleLink {
  /** Text inside `role` to turn into a link, e.g. "ZOG" */
  text: string
  href: string
}

interface Props {
  name: string
  role: string
  roleLinks?: RoleLink[]
  pronunciation?: string
  avatar: string
  links: ProfileLink[]
}

// Splits the role line so each matching text becomes a link. Text without a match stays plain.
function renderRole(role: string, roleLinks: RoleLink[]) {
  if (roleLinks.length === 0) return role
  const pattern = new RegExp(`(${roleLinks.map((l) => l.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`)
  return role.split(pattern).map((part) => {
    const link = roleLinks.find((l) => l.text === part)
    return link ? (
      <a
        key={link.href}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4 decoration-muted-foreground/60 hover:decoration-foreground"
      >
        {part}
      </a>
    ) : (
      <React.Fragment key={`t:${part}`}>{part}</React.Fragment>
    )
  })
}

const ICONS = {
  mail: Mail,
  linkedin: FaLinkedinIn,
  github: FaGithub,
  photo: Camera,
  chat: MessageCircle,
} as const

// A static profile card on the same glass surface as the Wakatime card: no flip, no tilt.
// The only hover flourish is the glint that travels once around the border (.glint in global.css).
export default function ProfileCard({ name, role, roleLinks = [], pronunciation, avatar, links }: Props) {
  const [copied, setCopied] = React.useState(false)

  const copyMail = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be blocked. The mailto link still works.
    }
  }

  return (
    <section
      className="glass-card glint backdrop-blur-md shadow-1 overflow-hidden relative isolate h-80 sm:h-auto sm:min-h-72 rounded-xl border-1 p-4 sm:p-6 flex flex-col"
      aria-label={`${name}, profile`}
    >
      <div className="relative z-10 flex items-stretch gap-4">
        <img
          src={avatar}
          alt=""
          width={80}
          height={80}
          decoding="async"
          fetchPriority="high"
          className="size-16 sm:size-20 shrink-0 rounded-lg object-cover bg-secondary/40"
        />
        <div className="min-w-0 flex flex-col justify-between">
          <h2 className="flex items-center gap-2 font-title text-2xl max-sm:leading-tight sm:text-display-sm text-foreground">
            {name}
            <img src="/assets/checklist_10629607.png" alt="Verified" title="Verified" width="512" height="512" className="inline-block size-5 shrink-0 select-none" draggable={false} />
          </h2>
          <p className="text-sm font-medium text-foreground sm:text-base">{renderRole(role, roleLinks)}</p>
          {pronunciation && <p className="font-mono text-xs text-muted-foreground">{pronunciation}</p>}
        </div>
      </div>

      <div className="relative z-10 my-3 h-px bg-border" />

      <ul className="relative z-10 grid grid-cols-1 gap-x-6 gap-y-2 font-mono text-sm sm:grid-cols-2">
        {links.map((link) => {
          const Icon = ICONS[link.kind]
          const internal = link.kind === 'mail' || link.kind === 'chat'
          return (
            <li key={link.href} className="flex min-w-0 items-center gap-2">
              <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <a
                href={link.href}
                target={internal ? undefined : '_blank'}
                rel={internal ? undefined : 'noreferrer noopener'}
                className="truncate text-foreground/80 transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
              {link.kind === 'mail' && (
                <button
                  type="button"
                  onClick={() => copyMail(link.label)}
                  className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  aria-label={copied ? 'Email copied' : 'Copy email address'}
                >
                  {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <BabysBreathField scene={CARD_SCENE} cell={2} className="absolute inset-x-0 bottom-0 h-1/4 w-full text-foreground/55 sm:h-24" />
    </section>
  )
}
