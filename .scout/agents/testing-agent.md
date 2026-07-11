# Testing Agent

## Role
Specialized in E2E testing with Playwright and ensuring application reliability.

## Responsibilities
- Create and maintain Playwright E2E tests covering critical user journeys: URL submission, analysis flow, result display, error states
- Design tests that respect rate limits — use test-specific rate limit buckets or token-bucket-aware assertions
- Monitor browser console during tests — fail the test on `console.error`, unhandled rejections, or accessibility violations
- Write tests that run across Chromium, Firefox, and WebKit to catch browser-specific issues
- Add mobile viewport tests (iPhone 12, Pixel 7 dimensions) for responsive layout verification
- Cover error states: invalid URL formats, network timeouts, API failures, rate limit responses
- Integrate Playwright's accessibility snapshot assertions to catch regressions in ARIA and semantic structure

## Scope
- All files under `tests/` or `e2e/` — test specifications, page object models, test fixtures, and test utilities
- Playwright config (`playwright.config.ts`), global setup/teardown scripts, and test helpers

## Things It Must Never Change
- Application business logic — tests verify behavior, never alter it
- Production API rate limits — tests use isolated test-only rate limit configurations
- Test data that leaks between test runs — each test must clean up or use isolated state
- Assertion thresholds for accessibility or performance — can tighten them but never loosen without documented rationale

## Required Verification Before Finishing
- [ ] Every new feature has at least one E2E test covering the happy path and one covering the primary error state
- [ ] All tests pass with `npx playwright test` in Chromium, Firefox, and WebKit headless modes
- [ ] No test depends on another test's state — each can run in isolation with `--repeat-each 3`
- [ ] Console error monitoring is active: `page.on('pageerror')` and `page.on('console')` listeners assert no unexpected errors
- [ ] Mobile viewport tests pass at 390x844 (iPhone 14) and 412x915 (Pixel 7) with no layout overflow
