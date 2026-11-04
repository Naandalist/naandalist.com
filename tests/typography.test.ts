import { describe, it, expect } from 'bun:test'
import { Glob } from 'bun'

const read = (p: string) => Bun.file(p).text()

async function filesUsingTitleFont() {
  const used: string[] = []
  for await (const f of new Glob('src/**/*.{astro,tsx}').scan('.')) {
    if ((await read(f)).includes('font-title')) used.push(f)
  }
  return used
}

describe('Instrument Serif', () => {
  it('is self-hosted as a real woff2 file', async () => {
    const file = Bun.file('public/fonts/InstrumentSerif-Regular.woff2')
    expect(await file.exists()).toBe(true)
    const magic = new TextDecoder().decode((await file.slice(0, 4).arrayBuffer()))
    expect(magic).toBe('wOF2')
    expect(file.size).toBeLessThan(60_000)
  })

  it('is declared with swap and exposed as font-title at weight 400', async () => {
    const css = await read('src/styles/global.css')
    expect(css).toMatch(/font-family:\s*["']Instrument Serif["']/)
    expect(css).toContain('/fonts/InstrumentSerif-Regular.woff2')
    expect(css).toMatch(/@utility font-title\s*\{[^}]*font-weight:\s*400/)
  })

  it('is preloaded for the first title', async () => {
    expect(await read('src/components/Head.astro')).toContain('/fonts/InstrumentSerif-Regular.woff2')
  })

  it('is used on page and section titles, never on blog pages', async () => {
    const used = await filesUsingTitleFont()
    for (const expected of [
      'src/pages/index.astro',
      'src/pages/about.astro',
      'src/components/ErrorPage.astro',
      'src/components/features/ProjectsShowcase.tsx',
      'src/components/EditorialProfileCard.astro',
    ]) {
      expect(used).toContain(expected)
    }
    const blog = used.filter(
      (f) =>
        f.startsWith('src/pages/blog/') ||
        f.startsWith('src/pages/tags/') ||
        f.startsWith('src/pages/authors/') ||
        f.includes('BlogCard') ||
        f.includes('TableOfContents'),
    )
    expect(blog).toEqual([])
  })

  it('is never combined with bold, semibold or mono on the same line', async () => {
    for (const f of await filesUsingTitleFont()) {
      const bad = (await read(f))
        .split('\n')
        .filter((l) => l.includes('font-title') && /font-(bold|semibold|mono|medium)/.test(l))
      expect(bad).toEqual([])
    }
  })
})
