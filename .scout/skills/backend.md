# Backend Skill

## Purpose
Guide for building API routes in `app/api/` with consistent error handling, rate limiting, and request validation.

## When to Use
- Creating or modifying API routes in `app/api/`
- Adding request validation or error handling
- Implementing rate limiting
- Calling external APIs (NVIDIA NIM, Playwright)

## Workflow
1. Set `export const runtime = "nodejs"` at the top of every route file
2. Validate request body/method at the start — return 400 with `{ error: string }` on failure
3. Apply rate limiting via `@/lib/security/rate-limit` before processing
4. Wrap business logic in try/catch — return 500 with `{ error: string }` on failure
5. Return consistent JSON responses: `{ error: string }` for errors
6. Use `export async function GET/POST(request: NextRequest)` pattern

## Checklist
- [ ] `export const runtime = "nodejs"` set at top of file
- [ ] Rate limiting applied via `@/lib/security/rate-limit`
- [ ] Request body validated at the start of the handler
- [ ] try/catch wrapping all business logic
- [ ] Error responses return `{ error: string }`
- [ ] 500 returned on unhandled errors
- [ ] 400 returned on validation failures

## Best Practices
- Validate request body shape and types immediately after receiving
- Return consistent error shapes — always `{ error: string }`
- Use early returns for validation failures, not nested if-blocks
- Log errors server-side before returning 500
- Keep route handlers thin — delegate business logic to lib utilities

## Common Mistakes
- Missing `export const runtime = "nodejs"` — causes edge runtime errors
- Returning error objects with inconsistent shapes
- Not rate-limiting POST endpoints
- Catching errors but not logging them
- Returning 500 without a descriptive error message

## Exit Criteria
- [ ] Route handler has `export const runtime = "nodejs"`
- [ ] Rate limiting applied via `@/lib/security/rate-limit`
- [ ] Request validated at the start of the handler
- [ ] All error paths return `{ error: string }`
- [ ] try/catch covers all business logic
- [ ] 500 returned for unhandled errors, 400 for bad input
