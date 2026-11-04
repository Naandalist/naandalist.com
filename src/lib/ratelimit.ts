import { createHmac } from 'node:crypto'

const DAILY_LIMIT = 10
const COOKIE_NAME = 'rl_token'
const SECRET = process.env.RATE_LIMIT_SECRET || 'fallback-secret-change-in-production'

/**
 * Get UTC date string (YYYY-MM-DD)
 */
function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Create HMAC signature for data
 */
function sign(data: string): string {
  return createHmac('sha256', SECRET).update(data).digest('hex').slice(0, 16)
}

/**
 * Verify and parse signed cookie value
 * Format: date:count:signature
 */
function verifyAndParse(value: string): { date: string; count: number } | null {
  const parts = value.split(':')
  if (parts.length !== 3) return null

  const [date, countStr, signature] = parts
  const count = parseInt(countStr, 10)
  if (Number.isNaN(count)) return null

  // Verify signature
  const expectedSig = sign(`${date}:${count}`)
  if (signature !== expectedSig) return null

  return { date, count }
}

/**
 * Create signed cookie value
 */
function createSignedValue(date: string, count: number): string {
  const signature = sign(`${date}:${count}`)
  return `${date}:${count}:${signature}`
}

/**
 * Parse cookies from header
 */
function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf('=')
    if (eq > -1) {
      const k = part.slice(0, eq).trim()
      const v = part.slice(eq + 1).trim()
      out[k] = decodeURIComponent(v)
    }
  }
  return out
}

/**
 * Serialize cookie with security attributes
 */
function serializeCookie(name: string, value: string, maxAgeSeconds: number): string {
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'SameSite=Strict',
    'HttpOnly',
    'Secure',
  ]
  return attrs.join('; ')
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  setCookie: string
}

/**
 * Check and increment rate limit using signed cookies
 *
 * Privacy-first approach:
 * - No IP address stored
 * - No database storage needed
 * - Cookie is cryptographically signed (HMAC-SHA256)
 * - Tampering is detected and rejected
 *
 */
export function checkRateLimit(request: Request): RateLimitResult {
  const today = getTodayUTC()
  const cookies = parseCookies(request.headers.get('cookie'))
  const raw = cookies[COOKIE_NAME]

  let count = 0

  if (raw) {
    const parsed = verifyAndParse(raw)
    if (parsed && parsed.date === today) {
      count = parsed.count
    }
    // If signature invalid or date changed, start fresh 
  }

  // Check if already at limit before incrementing
  if (count >= DAILY_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      limit: DAILY_LIMIT,
      setCookie: serializeCookie(COOKIE_NAME, createSignedValue(today, count), 86400),
    }
  }

  // Increment and create new signed cookie
  const newCount = count + 1
  const remaining = Math.max(0, DAILY_LIMIT - newCount)

  return {
    allowed: true,
    remaining,
    limit: DAILY_LIMIT,
    setCookie: serializeCookie(COOKIE_NAME, createSignedValue(today, newCount), 86400),
  }
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(request: Request): Omit<RateLimitResult, 'setCookie'> {
  const today = getTodayUTC()
  const cookies = parseCookies(request.headers.get('cookie'))
  const raw = cookies[COOKIE_NAME]

  let count = 0

  if (raw) {
    const parsed = verifyAndParse(raw)
    if (parsed && parsed.date === today) {
      count = parsed.count
    }
  }

  return {
    allowed: count < DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - count),
    limit: DAILY_LIMIT,
  }
}
