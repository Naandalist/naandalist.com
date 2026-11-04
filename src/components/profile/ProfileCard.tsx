import { Camera, Check, Copy, Mail, MessageCircle } from 'lucide-react'
import * as React from 'react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import BabysBreathField from '@/components/profile/BabysBreathField'

export interface ProfileLink {
  kind: 'mail' | 'linkedin' | 'github' | 'photo' | 'chat'
  label: string
  href: string
}

interface Props {
  name: string
  role: string
  pronunciation?: string
  avatar: string
  links: ProfileLink[]
}

const ICONS = {
  mail: Mail,
  linkedin: FaLinkedinIn,
  github: FaGithub,
  photo: Camera,
  chat: MessageCircle,
} as const

// A static profile card: no flip, no tilt — the only hover flourish is the
// metal glint that travels once around the border (see .metal in global.css).
export default function ProfileCard({ name, role, pronunciation, avatar, links }: Props) {
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
      className="metal relative h-80 sm:h-72 rounded-xl border-1 border-border p-4 sm:p-6 flex flex-col"
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
          <h2 className="font-title text-2xl max-sm:leading-tight sm:text-display-sm text-foreground">{name}</h2>
          <p className="text-sm font-medium text-foreground sm:text-base">{role}</p>
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

      <BabysBreathField scene="dandelion" cell={2} className="absolute inset-x-0 bottom-0 h-1/4 w-full text-foreground/55 sm:h-24" />
    </section>
  )
}
