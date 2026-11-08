import { describe, expect, it } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ChatInterface from '../src/components/chat/ChatInterface'
import { EXAMPLE_MESSAGES } from '../src/consts'
import memories from '../src/data/memories.json'

const read = (path: string) => Bun.file(path).text()

describe('editorial identity', () => {
  it('leads with the story and keeps activity after work and writing', async () => {
    const home = await read('src/pages/index.astro')
    expect(home).not.toContain('<ProfileCard')
    expect(home.indexOf('<h1')).toBeLessThan(home.indexOf('<ExperienceTimeline>'))
    expect(home.indexOf('<ProjectsShowcase')).toBeLessThan(home.indexOf('id="activity-title"'))
    expect(home.indexOf('<BlogCard')).toBeLessThan(home.indexOf('id="activity-title"'))
    expect(home).toContain('<details')
    expect(home).toContain('aria-label="Connect with Nanda"')
  })

  it('retains employer links and email copying in the Home byline', async () => {
    const home = await read('src/pages/index.astro')
    expect(home).toContain("{ text: 'ZOG', href: 'https://zero-one-group.com/' }")
    expect(home).toContain("{ text: 'Dicoding', href: 'https://www.dicoding.com/' }")
    expect(home).toContain('roleParts.map')
    expect(home).toContain('href={part.href}')
    expect(home).toContain('data-copy-email')
    expect(home).toContain('navigator.clipboard.writeText')
  })

  it('keeps the biography, principles, and handle without the bento scene', async () => {
    const about = await read('src/pages/about.astro')
    expect(about).toContain('renderInline(about.intro)')
    expect(about).toContain('about.bubbles.map')
    expect(about).toContain('about.highlights.map')
    expect(about).not.toContain('AboutScene')
    expect(about).not.toMatch(/about\.(whoLabel|buildLabel)/)
    expect(about).not.toContain('03 · Work')
  })

  it('renders one static photo per source entry and keeps native accessible controls', async () => {
    const gallery = await read('src/components/features/PhotoCollage.astro')
    expect(memories.length).toBeGreaterThan(0)
    expect(memories.every((photo) => Boolean(photo.src && photo.caption))).toBe(true)
    expect(gallery).toContain('photos.map(item')
    expect(gallery).not.toMatch(/marquee|grayscale|aria-hidden|\.\.\.photos/)
    expect(gallery).toContain('type="button" data-photo')
    expect(gallery).toContain('data-close-photo')
    expect(gallery).toContain('dialog.showModal()')
    expect(gallery).toContain('big.alt = text')
  })

  it('keeps article routes and semantic metadata without raised cards', async () => {
    const row = await read('src/components/BlogCard.astro')
    expect(row).toMatch(/href=\{`\/\$\{entry\.collection\}\/\$\{entry\.id\}`\}/)
    expect(row).toContain('<time datetime=')
    expect(row).toContain('{readTime}')
    expect(row).not.toMatch(/shadow-|grayscale|sm:flex-row/)
    const blog = await read('src/pages/blog/[...page].astro')
    expect(blog).toContain('<PaginationComponent')
    expect(blog).toContain('href="/tags"')
    expect(blog).toContain('href="/rss.xml"')
  })

  it('server-renders the chat guide, composer labels, and original relevant prompts without an API call', () => {
    const html = renderToStaticMarkup(createElement(ChatInterface))
    expect(html).toContain('Ask my assistant')
    expect(html).toContain('This is an AI assistant, not me')
    expect(html).toContain('aria-label="Your question"')
    expect(html).toContain('aria-label="Send question"')
    expect(html).toContain('role="log"')
    for (const prompt of EXAMPLE_MESSAGES) expect(html).toContain(prompt.heading)
    expect(html).not.toContain('Hobbies')
    expect(html).not.toContain('Feel free to ask me anything')
  })
})
