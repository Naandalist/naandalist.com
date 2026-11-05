export type Site = {
  TITLE: string
  DESCRIPTION: string
  EMAIL: string
  NUM_POSTS_ON_HOMEPAGE: number
  NUM_PACKAGES_ON_HOMEPAGE: number
  POSTS_PER_PAGE: number
  SITEURL: string
}

export type Link = {
  href: string
  label: string
}

export const SITE: Site = {
  TITLE: 'Listiananda Apriliawan',
  DESCRIPTION: 'naandalist.com is the digital home of Listiananda Apriliawan.',
  EMAIL: 'dev@naandalist.com',
  NUM_POSTS_ON_HOMEPAGE: 4,
  NUM_PACKAGES_ON_HOMEPAGE: 3,
  POSTS_PER_PAGE: 7,
  SITEURL: 'https://naandalist.com',
}

export const NAV_LINKS: Link[] = [
  { href: '/about', label: 'about' },
  { href: '/blog', label: 'blog' },
  { href: '/npmjs', label: 'packages' },
  { href: '/chat', label: 'chat' },
]

export const SOCIAL_LINKS: Link[] = [
  { href: 'https://linkedin.com/in/naandalist', label: 'LinkedIn' },
  { href: 'https://instagram.com/naandalist', label: 'Instagram' },
  { href: 'dev@naandalist.com', label: 'Email' },
  { href: '/rss.xml', label: 'RSS' },
]

// Chatbot example messages
import { Computer, Gamepad, GraduationCap } from 'lucide-react'

export const EXAMPLE_MESSAGES = [
  {
    heading: 'Hobbies',
    message: 'What do you do for fun?',
    icon: Gamepad,
  },
  {
    heading: 'Background',
    message: 'What did you study?',
    icon: GraduationCap,
  },
  {
    heading: 'Skills',
    message: "What is a skill you're proud of?",
    icon: Computer,
  },
] as const
