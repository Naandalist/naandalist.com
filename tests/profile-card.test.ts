import { describe, it, expect } from 'bun:test'

const read = (p: string) => Bun.file(p).text()

describe('profile card', () => {
  it('does not flip: no flip state, back face, or tilt left in the card', async () => {
    const card = await read('src/components/profile/ProfileCard.tsx')
    expect(card).not.toMatch(/flipped|flip-face|flip-inner|flip-zone|tiltFromPointer|nextFlip/i)
    const css = await read('src/styles/global.css')
    expect(css).not.toMatch(/flip-scene|flip-tilt|flip-inner|flip-face|data-flipped/)
  })

  it('sits on the glass surface and keeps the border glint as the only hover flourish', async () => {
    const css = await read('src/styles/global.css')
    expect(css).toContain('.glass-card')
    expect(css).toMatch(/\.glint:hover::after \{ animation: metal-glint/)
    const card = await read('src/components/profile/ProfileCard.tsx')
    expect(card).toMatch(/className="glass-card glint /)
  })

  it('is a plain heading card, not a role="button"', async () => {
    const card = await read('src/components/profile/ProfileCard.tsx')
    expect(card).not.toContain('role="button"')
    expect(card).toMatch(/<h1/)
    expect(card).not.toMatch(/<h2/)
  })

  it('shows the same square photo as About, in full color, without a border', async () => {
    const card = await read('src/components/profile/ProfileCard.tsx')
    const img = card.match(/<img[\s\S]*?\/>/)?.[0] ?? ''
    expect(img).toContain('alt={name}')
    expect(img).toContain('rounded-lg')
    expect(img).not.toContain('grayscale')
    expect(img).not.toMatch(/\bborder\b/)
    const home = await read('src/pages/index.astro')
    expect(home).toContain('author?.data.avatar')
  })

  it('links a gallery only when the author sets one', async () => {
    const home = await read('src/pages/index.astro')
    expect(home).toMatch(/home\?\.galleryUrl \? \[\{ kind: 'photo'/)
  })

  it('shows the current role line', async () => {
    const home = await read('src/content/authors/naandalist.md')
    // The card renders home.role (index.astro), not the byline role at the top of the file.
    expect(home).toMatch(/home:\n(?:\s+\S+.*\n)*? {2}role: '([^']+)'/)
    expect(RegExp.$1).toBe('Product Engineer 3 @ZOG • Code Reviewer @Dicoding')
  })

  it('uses a camera icon for the photo gallery link', async () => {
    const card = await read('src/components/profile/ProfileCard.tsx')
    expect(card).toContain('Camera')
    expect(card).not.toContain('Globe')
    expect(await read('src/pages/index.astro')).toContain("kind: 'photo'")
  })

  it('stretches the text block to the photo height, name at the top and spelling at the bottom', async () => {
    const card = await read('src/components/profile/ProfileCard.tsx')
    expect(card).toMatch(/flex items-stretch gap-4/)
    expect(card).toMatch(/min-w-0 flex flex-col justify-between/)
  })

  it('keeps the minimum card height and grows to match the row', async () => {
    const card = await read('src/components/profile/ProfileCard.tsx')
    expect(card).toContain('h-80 sm:h-auto sm:min-h-72')
    expect(card).not.toContain('sm:h-88')
  })

  it('uses a smaller photo and a stronger role line', async () => {
    const card = await read('src/components/profile/ProfileCard.tsx')
    const img = card.match(/<img[\s\S]*?\/>/)?.[0] ?? ''
    expect(img).toContain('size-16 sm:size-20')
    expect(card).toMatch(/text-sm font-medium text-foreground sm:text-base">\{renderRole\(role, roleLinks\)\}/)
    expect(card).toContain('my-3 h-px bg-border')
  })
})
