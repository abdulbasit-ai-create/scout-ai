# Unit Tests

Planned unit tests for utility functions and business logic.

## Priority

1. `lib/security/rate-limit.ts` — Boundary conditions, window cleanup, edge cases
2. `lib/analysis/analytics.ts` — localStorage limits, error handling, data integrity
3. `lib/utils/utils.ts` — cn() class merging behavior
4. Capture URL validation (from `app/api/capture/route.ts`)

## Framework

Planned: Vitest with minimal configuration (works with Next.js via `@vitejs/plugin-react`).
