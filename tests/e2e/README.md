# E2E Tests

Playwright-based end-to-end tests that verify the full Scout AI flow.

## Files

- `capture-report.spec.cjs` — Comprehensive E2E test covering API routes, landing page, capture flow, report page, theme toggle, share/print, mobile viewport, and console error tracking.

## Running

```bash
# Start the dev server in one terminal
npm run dev

# In another terminal, run tests
npm run test:e2e
```

The test uses headless Chromium via Playwright. Requires Playwright browser binaries (`npx playwright install chromium`).
