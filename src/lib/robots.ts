/**
 * robots.txt rules for crawlers. Search engines and AI answer engines may read everything, so the site can
 * be found and cited. Bots that collect text to train models are asked to stay out. robots.txt is
 * voluntary, so bots that ignore it need a firewall rule (Cloudflare WAF), see docs in the site settings.
 */

/** Crawlers whose job is to gather training data. Search and retrieval bots are not in this list. */
export const TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'Applebot-Extended', 'Bytespider', 'meta-externalagent'] as const

/** Paths no crawler needs. The API only serves the page's own widgets. */
export const PRIVATE_PATHS = ['/api/'] as const

export function robotsTxt({ sitemapUrl, llmsUrl }: { sitemapUrl: string; llmsUrl?: string }): string {
  const lines = ['User-agent: *', 'Allow: /', ...PRIVATE_PATHS.map((p) => `Disallow: ${p}`), '']
  for (const bot of TRAINING_BOTS) lines.push(`User-agent: ${bot}`, 'Disallow: /', '')
  lines.push(`Sitemap: ${sitemapUrl}`)
  if (llmsUrl) lines.push(`# LLM-friendly summary: ${llmsUrl}`)
  return lines.join('\n') + '\n'
}
