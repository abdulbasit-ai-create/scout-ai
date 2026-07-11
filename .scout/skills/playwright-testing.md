# Playwright Testing Skill

## Purpose
Guide for writing and running Playwright E2E tests using CommonJS format with headless Chromium.

## When to Use
- Writing new E2E tests
- Debugging failing E2E tests
- Adding test coverage for new features
- Before deployment to verify critical paths

## Workflow
1. Place test file in `tests/e2e/` with `.spec.cjs` suffix (CommonJS format)
2. Launch browser with `chromium.launch({ headless: true })`
3. Cover critical paths: landing page, API routes, capture flow, report page
4. Test theme toggle, mobile viewport, share/print functionality
5. Test error states: invalid URL, rate limit exceeded, API failure
6. Track console errors after each page interaction
7. Add waits between capture tests to respect rate limits

## Checklist
- [ ] File placed in `tests/e2e/` with `.spec.cjs` suffix
- [ ] Browser launched with `chromium.launch({ headless: true })`
- [ ] Landing page renders correctly
- [ ] API routes return expected responses
- [ ] Capture flow works end-to-end
- [ ] Report page actions work (analyze, share, print)
- [ ] Theme toggle works
- [ ] Mobile viewport tested (375px)
- [ ] Error states tested (invalid URL, rate limit, API failure)
- [ ] Console errors tracked after each interaction
- [ ] Waits added between capture tests for rate limits

## Best Practices
- Use `page.waitForSelector` over fixed timeouts
- Test error states by triggering actual failures (invalid URL, rate limit)
- Track console errors with `page.on('console', ...)` listener
- Test at mobile viewport (375px) and desktop (1280px)
- Keep tests independent — each test cleans up after itself

## Common Mistakes
- Using fixed `setTimeout` instead of `waitForSelector`
- Not waiting between capture tests — hitting rate limits
- Not testing error states
- Not tracking console errors
- Tests depending on each other's state

## Exit Criteria
- [ ] All critical paths tested: landing, capture, analyze, report
- [ ] Error states tested: invalid URL, rate limit, API failure
- [ ] Theme toggle tested in both light and dark
- [ ] Mobile viewport tested at 375px
- [ ] Console errors tracked — zero in passing tests
- [ ] Rate limits respected — waits between capture tests
