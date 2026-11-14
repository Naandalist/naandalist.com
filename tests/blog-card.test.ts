import { describe, it, expect } from 'bun:test'

const read = (p: string) => Bun.file(p).text()

describe('blog cards', () => {
  it('lays out homepage latest posts in three columns', async () => {
    const home = await read('src/pages/index.astro')
    const consts = await read('src/consts.ts')
    expect(home).toMatch(/Latest posts[\s\S]*?lg:grid-cols-3/)
    expect(home).toContain('layout="stack"')
    expect(consts).toMatch(/NUM_POSTS_ON_HOMEPAGE:\s*6/)
  })

  it('keeps list pages as editorial rows', async () => {
    const card = await read('src/components/BlogCard.astro')
    expect(card).toContain("layout = 'row'")
    expect(card).toContain('sm:grid-cols-[8rem_minmax(0,1fr)]')
    expect(await read('src/pages/blog/[...page].astro')).toContain('<BlogCard entry={post} />')
    expect(await read('src/pages/tags/[...id].astro')).toContain('<BlogCard entry={post} />')
    expect(await read('src/pages/authors/[...id].astro')).toContain('<BlogCard entry={post} />')
  })
})
