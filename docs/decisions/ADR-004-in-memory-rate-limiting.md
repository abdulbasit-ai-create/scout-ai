# ADR-004: Use In-Memory Rate Limiting

**Status:** Accepted  
**Date:** 2026-07-11  
**Tags:** rate-limiting, security, abuse-prevention

## Context

Scout AI exposes two public API endpoints that consume server resources:

| Endpoint | Resource Cost | Risk |
|---|---|---|
| `POST /api/capture` | Launches Playwright browser — high CPU/memory per request | Abuse could exhaust server resources |
| `POST /api/analyze` | Calls external NVIDIA NIM API — rate-limited by provider | Abuse could exhaust free tier quota |

Requirements:
- Prevent any single IP from overwhelming the server
- Simple implementation with zero external dependencies
- Per-endpoint limits (capture is more expensive than analyze)
- Must not require a database or external service to function
- Clear error feedback to clients (Retry-After headers)

## Decision

Use an **in-memory Map-based sliding window** rate limiter in `lib/security/rate-limit.ts`.

```
Map<string, number[]>            ← key: "{ip}:{kind}", value: array of timestamps
WINDOW_MS = 60_000               ← 1-minute sliding window
MAX_HITS = { capture: 5, analyze: 15 }

checkRateLimit(ip, kind):
  1. now = Date.now()
  2. windowStart = now - WINDOW_MS
  3. key = `${ip}:${kind}`
  4. Filter timestamps > windowStart
  5. If count >= max → return { ok: false, remaining: 0, resetAfter }
  6. Else → push now, return { ok: true, remaining }

Cleanup: setInterval every 60s
  → Remove stale entries (all timestamps outside window)
  → Delete keys with empty arrays
  → .unref() so it doesn't block process exit
```

Rate limit enforcement in API routes:

```typescript
const ip = getClientIp(req)
// Uses: x-forwarded-for → x-real-ip → "127.0.0.1"
const limit = checkRateLimit(ip, "capture")
if (!limit.ok) {
  return NextResponse.json(
    { error: `Rate limit exceeded. Retry in ${Math.ceil(limit.resetAfter / 1000)}s.` },
    { status: 429, headers: { "Retry-After": ..., "X-RateLimit-Remaining": "0" } }
  )
}
```

## Consequences

### Positive
- **Zero dependencies**: Pure TypeScript, no Redis, no database, no npm packages
- **Simple to understand**: Sliding window algorithm is straightforward
- **Per-endpoint granularity**: Different limits for expensive (capture) vs cheap (analyze) operations
- **Memory safe**: Cleanup interval prevents unbounded Map growth
- **Clear client feedback**: Retry-After and X-RateLimit-Remaining headers

### Negative
- **Lost on restart**: Rate limit state is volatile — a server restart resets all counters
- **Single instance only**: Does not work across multiple server instances (each has its own Map)
- **IP spoofing**: Relies on `x-forwarded-for` header which can be spoofed; acceptable for current scale
- **No persistence**: Rate limit data is lost on process restart — attacker could restart to reset limits (not applicable in production with process managers)

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| **Redis-based rate limiting** | Requires Redis server infrastructure — overkill for single-instance MVP |
| **Database-based (SQLite/Postgres)** | Slower (disk I/O), more complex, adds a dependency |
| **express-rate-limit middleware** | Express-specific; Scout AI uses Next.js App Router |
| **Cloudflare / CDN-level** | Not applicable — no CDN in current hosting setup |
| **Token bucket algorithm** | Sliding window is simpler and sufficient for this use case |

**When to upgrade to Redis**: If Scout AI is deployed across multiple instances (horizontal scaling), the in-memory Map must be replaced with a shared Redis instance. The `ponytail:` comment in the source already marks this upgrade path: `// ponytail: in-memory sliding window rate limiter, per-IP. Upgrade to Redis if this runs across multiple instances.`
