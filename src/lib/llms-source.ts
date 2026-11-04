import { getCollection, getEntry } from 'astro:content'
import { SITE, SOCIAL_LINKS } from '@/consts'
import type { LlmsInput } from '@/lib/llms'

/** Reads the collections into the shape the llms builders want. */
export async function loadLlmsInput(site: URL | string | undefined): Promise<LlmsInput> {
  const base = String(site ?? SITE.SITEURL)
  const author = await getEntry('authors', 'naandalist')
  const posts = (await getCollection('blog'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  const projects = await getCollection('projects')
  const a = author?.data
  return {
    site: base,
    name: a?.name ?? SITE.TITLE,
    summary: a?.home?.tagline ?? SITE.DESCRIPTION,
    role: a?.home?.role ?? a?.role,
    location: a?.location,
    aboutIntro: a?.about?.intro,
    aboutBuild: a?.about?.buildBody,
    posts: posts.map((p) => ({ id: p.id, title: p.data.title, description: p.data.description, date: p.data.date, body: p.body })),
    projects: projects.map((p) => ({ name: p.data.name, description: p.data.description, url: p.data.link ?? p.data.github ?? base })),
    links: [
      a?.github && { label: 'GitHub', url: a.github },
      a?.linkedin && { label: 'LinkedIn', url: a.linkedin },
      a?.instagram && { label: 'Instagram', url: a.instagram },
      { label: 'Gallery', url: a?.home?.galleryUrl ?? 'https://gallery.naandalist.com' },
      { label: 'RSS', url: new URL(SOCIAL_LINKS.find((l) => l.label === 'RSS')?.href ?? '/rss.xml', base).href },
    ].filter((l): l is { label: string; url: string } => Boolean(l)),
  }
}
