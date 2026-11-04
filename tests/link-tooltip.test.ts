import { describe, expect, it } from 'bun:test'
import { describeLink, isTextLink } from '@/lib/link-tooltip'

const link = (href: string, extra: Record<string, string> = {}, text = 'label') => ({
  href,
  textContent: text,
  getAttribute: (n: string) => extra[n] ?? (n === 'href' ? href : null),
  querySelector: () => null,
})

describe('describeLink', () => {
  it('shows host and path for external links', () => {
    expect(describeLink(link('https://ipb.ac.id/') as never, 'https://naandalist.com')).toBe('ipb.ac.id')
    expect(describeLink(link('https://github.com/naandalist') as never, 'https://naandalist.com')).toBe('github.com/naandalist')
  })

  it('shows the path for same-site links', () => {
    expect(describeLink(link('https://naandalist.com/blog/post') as never, 'https://naandalist.com')).toBe('/blog/post')
  })

  it('shows the address for mailto links', () => {
    expect(describeLink(link('mailto:me@naandalist.com') as never, 'https://naandalist.com')).toBe('me@naandalist.com')
  })

  it('prefers an explicit title or aria-label', () => {
    expect(describeLink(link('https://a.com', { title: 'My site' }) as never, 'https://naandalist.com')).toBe('My site')
    expect(describeLink(link('https://a.com', { 'aria-label': 'GitHub' }) as never, 'https://naandalist.com')).toBe('GitHub')
  })
})

describe('isTextLink', () => {
  it('accepts links with text and rejects empty ones or opt-outs', () => {
    expect(isTextLink(link('/a') as never)).toBe(true)
    expect(isTextLink(link('/a', {}, '  ') as never)).toBe(false)
    expect(isTextLink(link('/a', { 'data-no-tip': '' }) as never)).toBe(false)
  })
})
