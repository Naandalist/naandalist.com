/**
 * llms.txt and llms-full.txt: a plain markdown map of the site for language-model tools.
 * Search engines do not use it, but agents that do get a clean list without the page chrome.
 * Both files are built from the content collections, so they update with every build.
 */
import { describe, plainText } from '@/lib/jsonld'

export interface LlmsPost {
  id: string
  title: string
  description: string
  date: Date
  body?: string
}
export interface LlmsProject {
  name: string
  description: string
  /** The project's own site or repository. Project pages on this site only redirect home. */
  url: string
}
export interface LlmsInput {
  site: string
  name: string
  summary: string
  role?: string
  location?: string
  aboutIntro?: string
  aboutBuild?: string
  posts: LlmsPost[]
  projects: LlmsProject[]
  links: { label: string; url: string }[]
}

const abs = (site: string, path: string) => new URL(path, site).href
const day = (d: Date) => d.toISOString().slice(0, 10)

export function llmsTxt(i: LlmsInput): string {
  const out = [`# ${i.name}`, '', `> ${plainText(i.summary)}`, '']
  const facts = [i.role, i.location && `Based in ${i.location}`].filter(Boolean)
  if (facts.length) out.push(`${facts.join('. ')}.`, '')
  out.push(
    '## Pages',
    `- [Home](${abs(i.site, '/')}): ${describe(i.summary, 120)}`,
    `- [About](${abs(i.site, '/about/')}): ${describe(i.aboutIntro ?? i.summary, 120)}`,
    `- [Blog](${abs(i.site, '/blog/')}): Posts about software, AI and building products.`,
    '',
  )
  if (i.posts.length) {
    out.push('## Blog')
    for (const p of i.posts) out.push(`- [${p.title}](${abs(i.site, `/blog/${p.id}/`)}): ${plainText(p.description)} (${day(p.date)})`)
    out.push('')
  }
  if (i.projects.length) {
    out.push('## Projects')
    for (const p of i.projects) out.push(`- [${p.name}](${p.url}): ${plainText(p.description)}`)
    out.push('')
  }
  out.push('## Links', ...i.links.map((l) => `- [${l.label}](${l.url})`), '', '## Optional', `- [Full text of this site](${abs(i.site, '/llms-full.txt')}): About page and every blog post in one file.`, '')
  return out.join('\n')
}

/** MDX posts can start with import lines. They mean nothing outside the build, so drop them. */
export const stripMdx = (body: string) => body.replace(/^import\s.+$/gm, '').replace(/\n{3,}/g, '\n\n').trim()

export function llmsFullTxt(i: LlmsInput): string {
  const out = [`# ${i.name}`, '', `> ${plainText(i.summary)}`, '']
  if (i.aboutIntro || i.aboutBuild) {
    out.push('## About', '')
    if (i.aboutIntro) out.push(i.aboutIntro, '')
    if (i.aboutBuild) out.push(i.aboutBuild, '')
  }
  for (const p of i.posts) {
    out.push(`## ${p.title}`, '', `URL: ${abs(i.site, `/blog/${p.id}/`)}`, `Published: ${day(p.date)}`, '')
    if (p.body) out.push(stripMdx(p.body), '')
  }
  return out.join('\n')
}
