import { describe as suite, it, expect } from 'bun:test'
import vercel from '../vercel.json'
import { robotsTxt, TRAINING_BOTS } from '../src/lib/robots'
import { sourcesFor, frontmatterDate, newestPostDate, fallbackDate, lastmodFor } from '../src/lib/lastmod'
import { blogPostingLd, breadcrumbLd, collectionPageLd, creativeWorkLd, describe, softwareSourceCodeLd, personLd, plainText, serializeLd } from '../src/lib/jsonld'
import { llmsFullTxt, llmsTxt, stripMdx, type LlmsInput } from '../src/lib/llms'

suite('robots', () => {
  const txt = robotsTxt({ sitemapUrl: 'https://x.dev/sitemap-index.xml', llmsUrl: 'https://x.dev/llms.txt' })
  it('lets everyone in, keeps the API private, and blocks every training bot', () => {
    expect(txt).toContain('User-agent: *\nAllow: /\nDisallow: /api/')
    for (const bot of TRAINING_BOTS) expect(txt).toContain(`User-agent: ${bot}\nDisallow: /`)
    expect(txt).toContain('Sitemap: https://x.dev/sitemap-index.xml')
  })
  it('never blocks search or answer bots', () => {
    for (const bot of ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot']) expect(txt).not.toContain(`User-agent: ${bot}`)
  })
})

suite('crawler redirects', () => {
  it('sends /sitemap.xml to the generated sitemap index', () => {
    const hits = vercel.redirects.filter((r) => r.source === '/sitemap.xml' || r.source === '/sitemap.xml/')
    expect(hits.length).toBe(2)
    for (const r of hits) {
      expect(r.destination).toBe('/sitemap-index.xml')
      expect(r.permanent).toBe(true)
    }
  })
  it('sends /projects and /projects/ home, and leaves case-study URLs alone', () => {
    const hits = vercel.redirects.filter((r) => r.source === '/projects' || r.source === '/projects/')
    expect(hits.length).toBe(2)
    for (const r of hits) {
      expect(r.destination).toBe('/')
      expect(r.permanent).toBe(true)
    }
    expect(vercel.redirects.some((r) => r.source.includes('/projects/:'))).toBe(false)
  })
})

suite('sitemap filter', () => {
  it('keeps author archives out of the sitemap', async () => {
    const src = await Bun.file('astro.config.ts').text()
    expect(src).toMatch(/!new URL\(page\)\.pathname\.startsWith\('\/authors'\)/)
  })
})

suite('heading outline', () => {
  it('uses one h3 per job in the experience timeline', async () => {
    const src = await Bun.file('src/components/features/ExperienceTimeline.astro').text()
    expect(src.match(/<h3 /g)?.length).toBe(1)
  })
  it('puts the homepage name in h1 and the headline in h2', async () => {
    const card = await Bun.file('src/components/profile/ProfileCard.tsx').text()
    const home = await Bun.file('src/pages/index.astro').text()
    expect(card).toMatch(/<h1 className=/)
    expect(home).toContain('{home?.headline}</h2>')
  })
  it('does not use a document heading for the table of contents label', async () => {
    const src = await Bun.file('src/components/TableOfContents.astro').text()
    expect(src).not.toMatch(/<h2 class="mb-2/)
  })
})

suite('lastmod sources', () => {
  it('maps pages to the content that feeds them', () => {
    expect(sourcesFor('/')).toContain('src/content/authors/naandalist.md')
    expect(sourcesFor('/about/')).toContain('src/pages/about.astro')
    expect(sourcesFor('/contact/')).toEqual(['src/pages/contact.astro', 'src/content/authors/naandalist.md'])
    expect(sourcesFor('/blog/hello-world/')[0]).toBe('src/content/blog/hello-world')
    expect(sourcesFor('/blog/2/')).toEqual(['src/content/blog'])
    expect(sourcesFor('/unknown/')).toEqual([])
  })
  it('finds the newest post date for list pages', () => {
    expect(newestPostDate()).toBeInstanceOf(Date)
  })
  it('reads a post date from frontmatter when git is not usable', () => {
    expect(frontmatterDate(['src/content/blog/git-commit-message-convention'])).toBeInstanceOf(Date)
  })
  it('treats blog pagination as a list, not a post slug', () => {
    expect(fallbackDate('/blog/2/')?.valueOf()).toBe(newestPostDate()?.valueOf())
    expect(fallbackDate('/blog/2/')?.valueOf()).toBe(fallbackDate('/blog/')?.valueOf())
  })
  it('falls back to collection dates for posts, projects and packages', () => {
    expect(fallbackDate('/blog/git-commit-message-convention/')).toBeInstanceOf(Date)
    expect(fallbackDate('/projects/web-ringkaskata/')).toBeInstanceOf(Date)
    expect(fallbackDate('/npmjs/blobmascot/')).toBeInstanceOf(Date)
    expect(fallbackDate('/npmjs/')).toBeInstanceOf(Date)
    expect(fallbackDate('/contact/')).toBeUndefined()
  })
  it('writes ISO lastmod dates that are not in the future', () => {
    const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    const latest = Date.now() + 86_400_000
    for (const path of ['/', '/about/', '/blog/', '/blog/2/', '/contact/', '/projects/web-ringkaskata/', '/npmjs/blobmascot/']) {
      const date = lastmodFor(path)
      if (!date) throw new Error(`missing lastmod for ${path}`)
      expect(date.getTime()).toBeLessThanOrEqual(latest)
      expect(date.toISOString()).toMatch(iso)
    }
  })
})

suite('jsonld', () => {
  it('builds a person without empty fields', () => {
    const p = personLd({ name: 'A', url: 'https://x.dev/', sameAs: ['https://g.com/a', undefined] })
    expect(p.sameAs).toEqual(['https://g.com/a'])
    expect('jobTitle' in p).toBe(false)
  })
  it('dates a post and falls back to the publish date', () => {
    const d = new Date('2026-01-02T00:00:00Z')
    const ld = blogPostingLd({ url: 'https://x.dev/blog/a/', title: 'T', description: 'D', published: d, author: personLd({ name: 'A', url: 'https://x.dev/' }) })
    expect(ld.datePublished).toBe(d.toISOString())
    expect(ld.dateModified).toBe(d.toISOString())
    expect(ld.publisher).toEqual(ld.author)
    expect(ld.publisher).toMatchObject({ '@type': 'Person', name: 'A', url: 'https://x.dev/' })
  })
  it('numbers breadcrumbs from 1', () => {
    expect(breadcrumbLd([{ name: 'a', url: 'u1' }, { name: 'b', url: 'u2' }]).itemListElement.map((i) => i.position)).toEqual([1, 2])
  })
  it('lists the entries of a collection page in order', () => {
    const ld = collectionPageLd({ url: 'u', name: 'n', description: 'd', items: [{ name: 'a', url: 'u1' }, { name: 'b', url: 'u2' }] })
    expect(ld['@type']).toBe('CollectionPage')
    expect(ld.mainEntity.itemListElement.map((i) => i.position)).toEqual([1, 2])
  })
  it('describes a case study as CreativeWork', () => {
    const ld = creativeWorkLd({
      url: 'https://x.dev/projects/p/',
      name: 'P',
      description: 'A project',
      sameAs: ['https://p.dev', undefined],
      modified: new Date('2026-08-29T00:00:00Z'),
      author: personLd({ name: 'A', url: 'https://x.dev/' }),
    })
    expect(ld['@type']).toBe('CreativeWork')
    expect(ld.sameAs).toEqual(['https://p.dev'])
    expect(ld.dateModified).toBe('2026-08-29T00:00:00.000Z')
    expect('image' in ld).toBe(false)
  })
  it('describes a package and drops the repository when there is none', () => {
    const ld = softwareSourceCodeLd({ url: 'u', name: 'pkg', description: 'd', npm: 'https://npm/pkg', version: '1.0.0', license: 'MIT', published: new Date('2026-01-02T00:00:00Z'), author: personLd({ name: 'A', url: 'https://x.dev/' }) })
    expect('codeRepository' in ld).toBe(false)
    expect(ld.dateModified).toBe(ld.datePublished)
  })
  it('cannot close the script tag', () => {
    expect(serializeLd({ a: '</script><b>' })).not.toContain('</script>')
  })
  it('makes short plain descriptions', () => {
    expect(plainText('I am **bold** and [linked](https://x.dev) text.')).toBe('I am bold and linked text.')
    const long = describe('word '.repeat(80), 155)
    expect(long.length).toBeLessThanOrEqual(155)
    expect(long.endsWith('…')).toBe(true)
  })
})

suite('llms', () => {
  const input: LlmsInput = {
    site: 'https://x.dev',
    name: 'Ada',
    summary: 'Builds **things**.',
    role: 'Engineer',
    location: 'Bogor',
    aboutIntro: 'Hello.',
    posts: [{ id: 'one', title: 'One', description: 'First post', date: new Date('2026-03-04'), body: "import X from 'x'\n\n\n\nBody text." }],
    projects: [{ name: 'P', description: 'A project', url: 'https://github.com/a/p' }],
    links: [{ label: 'GitHub', url: 'https://github.com/a' }],
  }
  it('lists pages, posts and projects with absolute links', () => {
    const t = llmsTxt(input)
    expect(t.startsWith('# Ada\n\n> Builds things.')).toBe(true)
    expect(t).toContain('- [One](https://x.dev/blog/one/): First post (2026-03-04)')
    expect(t).toContain('- [P](https://github.com/a/p): A project')
    expect(t).toContain('https://x.dev/llms-full.txt')
  })
  it('puts each post body into the full file without import lines', () => {
    const t = llmsFullTxt(input)
    expect(t).toContain('## One')
    expect(t).toContain('Body text.')
    expect(t).not.toContain("import X")
    expect(stripMdx("import a from 'a'\nhi")).toBe('hi')
  })
})
