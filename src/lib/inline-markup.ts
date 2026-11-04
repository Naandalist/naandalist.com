/**
 * Tiny inline markup for copy kept in content files: **bold** and [text](url).
 * Input is escaped first, so the output is safe for set:html. Only http(s), mailto and
 * site-relative urls become links.
 */

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const bold = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')

const LINK = 'text-foreground underline decoration-muted-foreground underline-offset-[3px] hover:decoration-foreground'

export function renderInline(text: string): string {
  const safe = escapeHtml(text)
  const withLinks = safe.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label: string, url: string) => {
    if (/^https?:\/\//.test(url) || url.startsWith('mailto:')) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${LINK}">${label}</a>`
    }
    if (url.startsWith('/')) return `<a href="${url}" class="${LINK}">${label}</a>`
    return match
  })
  return bold(withLinks)
}
