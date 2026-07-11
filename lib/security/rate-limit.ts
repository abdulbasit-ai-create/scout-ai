// ponytail: in-memory sliding window rate limiter, per-IP.
// Upgrade to Redis if this runs across multiple instances.

const hits = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_HITS = {
  capture: 5,   // 5 captures/min (Playwright is heavy)
  analyze: 15,  // 15 analyses/min
}

export type LimitKind = keyof typeof MAX_HITS

export function checkRateLimit(ip: string, kind: LimitKind): {
  ok: boolean; remaining: number; resetAfter: number
} {
  const now = Date.now()
  const windowStart = now - WINDOW_MS
  const max = MAX_HITS[kind]
  const key = `${ip}:${kind}`

  let timestamps = hits.get(key) || []
  timestamps = timestamps.filter((t) => t > windowStart)

  if (timestamps.length >= max) {
    const oldest = timestamps[0]
    return { ok: false, remaining: 0, resetAfter: oldest + WINDOW_MS - now }
  }

  timestamps.push(now)
  hits.set(key, timestamps)
  return { ok: true, remaining: max - timestamps.length, resetAfter: 0 }
}

// Periodic cleanup to avoid memory leaks
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS
  for (const [key, ts] of hits) {
    const clean = ts.filter((t) => t > cutoff)
    if (clean.length === 0) hits.delete(key)
    else hits.set(key, clean)
  }
}, 60_000).unref()
