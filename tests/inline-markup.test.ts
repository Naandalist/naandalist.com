import { describe, expect, it } from 'bun:test'
import { renderInline } from '@/lib/inline-markup'

describe('renderInline', () => {
  it('escapes html', () => {
    expect(renderInline('a <b> & "c"')).toBe('a &lt;b&gt; &amp; &quot;c&quot;')
  })

  it('renders **bold**', () => {
    expect(renderInline('is **very** good')).toBe('is <strong class="font-semibold text-foreground">very</strong> good')
  })

  it('renders external and internal links', () => {
    expect(renderInline('at [IPB](https://ipb.ac.id).')).toContain('href="https://ipb.ac.id" target="_blank" rel="noopener noreferrer"')
    expect(renderInline('see [blog](/blog)')).toMatch(/href="\/blog" class="[^"]*">blog<\/a>/)
  })

  it('does not allow javascript: urls', () => {
    expect(renderInline('[x](javascript:alert(1))')).not.toContain('<a')
  })

  it('keeps bold inside link text and escapes the url', () => {
    expect(renderInline('[**x**](https://a.com/?q="1")')).toContain('href="https://a.com/?q=&quot;1&quot;"')
  })
})
