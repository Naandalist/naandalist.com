import { describe, it, expect } from 'bun:test'

const read = (p: string) => Bun.file(p).text()

describe('profile card', () => {
  it('has no visible flip button, only one that shows up when focused by keyboard', async () => {
    const card = await read('src/components/profile/ProfileFlipCard.tsx')
    expect(card).not.toContain('RotateCw')
    expect(card).not.toMatch(/absolute right-3 top-3/)
    expect((card.match(/sr-only focus-visible:not-sr-only/g) ?? []).length).toBe(2)
    // The name stays a real heading, not the child of a role="button".
    expect(card).not.toContain('role="button"')
  })

  it('can flip back by tapping the back face, since touch has no hover', async () => {
    const card = await read('src/components/profile/ProfileFlipCard.tsx')
    expect(card).toMatch(/flip-face-back[\s\S]{0,400}onClick/)
  })

  it('shows the same square photo as About, without a border', async () => {
    const card = await read('src/components/profile/ProfileFlipCard.tsx')
    const img = card.match(/<img[\s\S]*?\/>/)?.[0] ?? ''
    expect(img).toContain('rounded-lg')
    expect(img).toContain('grayscale')
    expect(img).not.toMatch(/\bborder\b/)
    const home = await read('src/pages/index.astro')
    expect(home).toContain('author?.data.avatar')
  })

  it('links the gallery instead of the main site', async () => {
    const home = await read('src/content/authors/naandalist.md')
    expect(home).toContain('gallery.naandalist.com')
  })

  it('shows the role as AI Engineer', async () => {
    expect(await read('src/content/authors/naandalist.md')).toContain('AI Engineer, Final Year CS @ IPB')
  })

  it('uses a camera icon for the photo gallery link', async () => {
    const card = await read('src/components/profile/ProfileFlipCard.tsx')
    expect(card).toContain('Camera')
    expect(card).not.toContain('Globe')
    expect(await read('src/pages/index.astro')).toContain("kind: 'photo'")
  })

  it('stretches the text block to the photo height, name at the top and spelling at the bottom', async () => {
    const card = await read('src/components/profile/ProfileFlipCard.tsx')
    expect(card).toMatch(/data-flip-zone[\s\S]{0,160}items-stretch/)
    expect(card).toMatch(/min-w-0 flex flex-col justify-between/)
  })

  it('is a shorter card on desktop', async () => {
    const card = await read('src/components/profile/ProfileFlipCard.tsx')
    expect(card).toContain('sm:h-72')
    expect(card).not.toContain('sm:h-88')
  })

  it('uses a smaller photo and a stronger role line', async () => {
    const card = await read('src/components/profile/ProfileFlipCard.tsx')
    const img = card.match(/<img[\s\S]*?\/>/)?.[0] ?? ''
    expect(img).toContain('size-16 sm:size-20')
    expect(card).toMatch(/text-sm font-medium text-foreground sm:text-base">\{role\}/)
    expect(card).toContain('my-3 h-px bg-border')
  })
})
