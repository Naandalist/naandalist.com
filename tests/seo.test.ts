import { describe as suite, it, expect } from 'bun:test'
import { robotsTxt, TRAINING_BOTS } from '../src/lib/robots'
import { sourcesFor, frontmatterDate, newestPostDate } from '../src/lib/lastmod'
import { blogPostingLd, breadcrumbLd, describe, personLd, plainText, serializeLd } from '../src/lib/jsonld'
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

suite('lastmod sources', () => {
  it('maps pages to the content that feeds them', () => {
    expect(sourcesFor('/')).toContain('src/content/authors/naandalist.md')
    expect(sourcesFor('/about/')).toContain('src/pages/about.astro')
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
  })
  it('numbers breadcrumbs from 1', () => {
    expect(breadcrumbLd([{ name: 'a', url: 'u1' }, { name: 'b', url: 'u2' }]).itemListElement.map((i) => i.position)).toEqual([1, 2])
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
