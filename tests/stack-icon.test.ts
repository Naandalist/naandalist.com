import { describe, it, expect } from 'bun:test'

const read = (p: string) => Bun.file(p).text()

describe('stack icons', () => {
  it('paints tiles with CSS so themed icons are not two img tags', async () => {
    const icon = await read('src/components/features/StackIcon.tsx')
    expect(icon).not.toMatch(/<img[\s>]/)
    expect(icon).toContain('--skill-light')
    expect(icon).toContain('--skill-dark')
    expect(icon).toContain('aria-hidden="true"')
  })

  it('renders one icon per cell, not a mobile copy and a desktop copy', async () => {
    const slider = await read('src/components/features/TechStackSlider.tsx')
    expect(slider).not.toMatch(/StackIcon[^>]*sm:hidden/)
    expect(slider).not.toMatch(/StackIcon[^>]*hidden sm:flex/)
    expect(slider.match(/<StackIcon /g)?.length).toBe(1)
  })
})
