/** schema.org JSON-LD for search engines. Everything is built from the content, so it never goes stale. */

export interface PersonInput {
  name: string
  url: string
  image?: string
  jobTitle?: string
  description?: string
  email?: string
  alternateName?: string
  sameAs?: (string | undefined)[]
}

const CONTEXT = 'https://schema.org'

/** Drops empty fields so the output only has what we know. */
const clean = <T extends Record<string, unknown>>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0))) as T

export function personLd(p: PersonInput) {
  return clean({
    '@type': 'Person',
    '@id': `${p.url}#person`,
    name: p.name,
    alternateName: p.alternateName,
    url: p.url,
    image: p.image,
    jobTitle: p.jobTitle,
    description: p.description,
    email: p.email ? `mailto:${p.email}` : undefined,
    sameAs: p.sameAs?.filter((s): s is string => Boolean(s)),
  })
}

export function websiteLd({ name, alternateName, url, description }: { name: string; alternateName?: string[]; url: string; description?: string }) {
  return { '@context': CONTEXT, ...clean({ '@type': 'WebSite', '@id': `${url}#website`, name, alternateName, url, description, inLanguage: 'en' }) }
}

/** The About page. Google reads ProfilePage with a Person as its main entity. */
export function profilePageLd({ url, person }: { url: string; person: ReturnType<typeof personLd> }) {
  return { '@context': CONTEXT, '@type': 'ProfilePage', url, mainEntity: person }
}

export function blogPostingLd(p: { url: string; title: string; description: string; published: Date; modified?: Date; image?: string; author: ReturnType<typeof personLd>; tags?: string[] }) {
  return {
    '@context': CONTEXT,
    ...clean({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.published.toISOString(),
      dateModified: (p.modified ?? p.published).toISOString(),
      image: p.image,
      keywords: p.tags,
      author: p.author,
      mainEntityOfPage: { '@type': 'WebPage', '@id': p.url },
      inLanguage: 'en',
    }),
  }
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: item.url })),
  }
}

/** Safe to put inside a script tag: "<" is escaped so content can never close it. */
export function serializeLd(data: object | object[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/** Plain text from a markdown line, for meta descriptions. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** A meta description of at most `max` characters, cut at a word boundary. */
export function describe(text: string, max = 155): string {
  const t = plainText(text)
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1).replace(/\s+\S*$/, '')
  return `${cut}…`
}
