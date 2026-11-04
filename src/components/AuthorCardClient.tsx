'use client'

import { motion } from 'motion/react'
import {
  PiEnvelope,
  PiGithubLogo,
  PiGlobe,
  PiInstagramLogo,
  PiLinkedinLogo,
} from 'react-icons/pi'
import AvatarComponent from '@/components/ui/Avatar'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type Props = {
  id: string
  name: string
  avatar?: string
  bio?: string
  pronouns?: string
  github?: string
  linkedin?: string
  instagram?: string
  website?: string
  mail?: string
  linkDisabled?: boolean
}

const containerVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const, staggerChildren: 0.08 },
  },
}

const childVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export function AuthorCardClient({
  id,
  name,
  avatar,
  bio,
  pronouns,
  github,
  linkedin,
  instagram,
  website,
  mail,
  linkDisabled = false,
}: Props) {
  const socialLinks = [
    website && { href: website, label: 'Website', icon: <PiGlobe className="size-4" /> },
    github && { href: github, label: 'GitHub', icon: <PiGithubLogo className="size-4" /> },
    linkedin && { href: linkedin, label: 'LinkedIn', icon: <PiLinkedinLogo className="size-4" /> },
    instagram && { href: instagram, label: 'Instagram', icon: <PiInstagramLogo className="size-4" /> },
    mail && { href: `mailto:${mail}`, label: 'Email', icon: <PiEnvelope className="size-4" /> },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[]

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg border shadow-1 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Subtle top highlight — minimal Vercel-style accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/20 to-transparent" />

      <div className="p-4">
        <div className="flex flex-wrap gap-4">
          {/* Avatar */}
          <motion.div variants={childVariants}>
            {linkDisabled ? (
              <AvatarComponent
                src={avatar}
                alt={`Avatar of ${name}`}
                fallback={name[0]}
                className="size-20 sm:size-32 rounded-md"
              />
            ) : (
              <motion.a
                href={`/authors/${id}`}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="block"
              >
                <AvatarComponent
                  src={avatar}
                  alt={`Avatar of ${name}`}
                  fallback={name[0]}
                  className="size-32 cursor-pointer rounded-md transition-shadow duration-150 hover:ring-2 hover:ring-primary"
                />
              </motion.a>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex grow flex-col justify-between gap-y-4">
            <motion.div variants={childVariants}>
              <div className="flex flex-wrap items-center gap-x-2">
                <h3 className="text-lg font-semibold">{name}</h3>
                {pronouns && (
                  <span className="text-sm text-muted-foreground">({pronouns})</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{bio}</p>
            </motion.div>

            <motion.ul
              className="not-prose flex flex-wrap gap-2"
              role="list"
              variants={childVariants}
            >
              {socialLinks.map(({ href, label, icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    title={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
                  >
                    {icon}
                  </a>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
