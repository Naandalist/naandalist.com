import { describe, it, expect } from 'bun:test'

const read = (p: string) => Bun.file(p).text()

describe('package cards', () => {
  it('lays out homepage packages in three columns', async () => {
    const home = await read('src/pages/index.astro')
    const consts = await read('src/consts.ts')
    expect(home).toMatch(/Open source contributions[\s\S]*?lg:grid-cols-3/)
    expect(home).toContain('<PackageCard entry={entry} layout="stack" />')
    expect(consts).toMatch(/NUM_PACKAGES_ON_HOMEPAGE:\s*6/)
  })

  it('keeps the packages index as editorial rows', async () => {
    const card = await read('src/components/PackageCard.astro')
    expect(card).toContain("layout = 'row'")
    expect(card).toContain('sm:grid-cols-[8rem_minmax(0,1fr)]')
    expect(await read('src/pages/npmjs/index.astro')).toContain('<PackageCard entry={entry} />')
  })
})
