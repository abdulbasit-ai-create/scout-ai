# Security Module

Security-related utilities for the Scout AI application.

## Files

- `rate-limit.ts` — In-memory sliding window rate limiter per IP. Supports separate limits for capture (5/min) and analyze (15/min) endpoints. Returns remaining count and retry-after timing.

## Usage

```tsx
import { checkRateLimit } from "@/lib/security/rate-limit"

const { ok, remaining, resetAfter } = checkRateLimit(clientIp, "capture")
```

## Note

Rate limiter is in-memory only — resets on server restart. Upgrade to Redis for multi-instance deployments.
