// Runs Lighthouse 3 times on the served home page and fails when the median misses a budget. CI only.
// Usage: bun scripts/lighthouse-check.ts <mobile|desktop>
// Budgets: performance, accessibility, best practices at 90 or more, SEO at 100, Cumulative Layout Shift at 0.1 or less.
// Lighthouse is pinned here, not in package.json, so the lockfile stays untouched.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'

const preset = process.argv[2] ?? 'mobile'
const url = 'http://localhost:4400/'
const dir = `.lighthouse/${preset}`
const budgets: Record<string, number> = { performance: 0.9, accessibility: 0.9, 'best-practices': 0.9, seo: 1 }
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]

fs.mkdirSync(dir, { recursive: true })
const scores: Record<string, number[]> = Object.fromEntries(Object.keys(budgets).map((k) => [k, []]))
const shifts: number[] = []
for (let run = 1; run <= 3; run++) {
  const file = `${dir}/run-${run}.json`
  const args = ['--bun', 'lighthouse@13.6.0', url, '--output=json', `--output-path=${file}`, '--chrome-flags=--headless=new --no-sandbox', '--quiet']
  if (preset === 'desktop') args.push('--preset=desktop')
  execFileSync('bunx', args, { stdio: 'inherit' })
  const report = JSON.parse(fs.readFileSync(file, 'utf8'))
  for (const k of Object.keys(budgets)) scores[k].push(report.categories[k]?.score ?? 0)
  shifts.push(report.audits['cumulative-layout-shift'].numericValue)
}

let failed = false
for (const [k, budget] of Object.entries(budgets)) {
  const score = median(scores[k])
  const ok = score >= budget
  failed ||= !ok
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${preset} ${k} median ${Math.round(score * 100)} (runs ${scores[k].map((s) => Math.round(s * 100)).join(', ')}), budget >= ${budget * 100}`)
}
const cls = median(shifts)
const clsOk = cls <= 0.1
failed ||= !clsOk
console.log(`${clsOk ? 'ok  ' : 'FAIL'} ${preset} CLS median ${cls.toFixed(3)} (runs ${shifts.map((s) => s.toFixed(3)).join(', ')}), budget <= 0.1`)
process.exit(failed ? 1 : 0)
