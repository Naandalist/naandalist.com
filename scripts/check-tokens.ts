/**
 * Fails when a component uses a size that is not a design token.
 * Rules live in docs/design-system.md. Run: bun run check:tokens
 *
 * Add `token-ok` on a line to skip it (use sparingly, say why in the same line).
 */
import { Glob } from 'bun'

export interface Violation {
  token: string
  line: number
  rule: string
}

const SIDES = '(?:t|b|l|r|tl|tr|bl|br|s|e)'

const RULES: { rule: string; pattern: RegExp }[] = [
  { rule: 'padding off the 2/4/8/12/16/20 grid', pattern: /\b(?:p|px|py|pt|pb|pl|pr|ps|pe)-(?:1\.5|2\.5|3\.5)\b/g },
  // Safe-area insets are allowed because the notch is not part of our scale.
  { rule: 'arbitrary padding', pattern: /\b(?:p|px|py|pt|pb|pl|pr)-\[(?![^\]]*safe-area)[^\]]+\]/g },
  { rule: 'removed text class', pattern: /(?<![\w-])text-(?:h1|h2|h3|hero|body|md|fluid-[a-z0-9]+)(?![\w-])/g },
  { rule: 'arbitrary text size', pattern: /(?<![\w-])text-\[[^\]]+\]/g },
  { rule: 'radius not in tokens', pattern: new RegExp(`(?<![\\w-])rounded(?:-${SIDES})?-(?:2xl|3xl|4xl)(?![\\w-])`, 'g') },
  { rule: 'arbitrary radius', pattern: new RegExp(`(?<![\\w-])rounded(?:-${SIDES})?-\\[(?!inherit)[^\\]]+\\]`, 'g') },
  { rule: 'radius without a size', pattern: new RegExp(`(?<![\\w-])rounded(?:-${SIDES})?(?![\\w-])`, 'g') },
  { rule: 'shadow not in tokens', pattern: /(?<![\w-])shadow-(?:xs|sm|md|lg|xl|2xl|inner)(?![\w-])/g },
  { rule: 'shadow without a token', pattern: /(?<![\w-])shadow(?![\w[-])/g },
  { rule: 'arbitrary shadow', pattern: /(?<![\w-])shadow-\[[^\]]+\]/g },
]

export function findViolations(source: string): Violation[] {
  const found: (Violation & { index: number })[] = []
  const lineStarts = [0]
  for (let i = 0; i < source.length; i++) if (source[i] === '\n') lineStarts.push(i + 1)
  const lineOf = (index: number) => {
    let lo = 0
    let hi = lineStarts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (lineStarts[mid] <= index) lo = mid
      else hi = mid - 1
    }
    return lo + 1
  }
  const lines = source.split('\n')

  for (const { rule, pattern } of RULES) {
    for (const m of source.matchAll(pattern)) {
      const line = lineOf(m.index ?? 0)
      if (lines[line - 1].includes('token-ok')) continue
      found.push({ token: m[0], line, rule, index: m.index ?? 0 })
    }
  }
  return found.sort((a, b) => a.index - b.index).map(({ token, line, rule }) => ({ token, line, rule }))
}

async function main() {
  const glob = new Glob('src/**/*.{astro,tsx,ts,css}')
  let total = 0
  for await (const file of glob.scan('.')) {
    if (file.startsWith('src/generated/')) continue
    const violations = findViolations(await Bun.file(file).text())
    for (const v of violations) {
      console.log(`${file}:${v.line}  ${v.token}  (${v.rule})`)
    }
    total += violations.length
  }
  if (total > 0) {
    console.error(`\n${total} token violation(s). See docs/design-system.md.`)
    process.exit(1)
  }
  console.log('check:tokens ok')
}

if (import.meta.main) await main()
