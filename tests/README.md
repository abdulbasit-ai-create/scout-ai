# Tests

E2E and unit tests for Scout AI.

## Structure

```
tests/
├── e2e/           — Playwright end-to-end tests
│   └── capture-report.spec.cjs
└── unit/          — Unit tests (planned)
```

## Running

```bash
# E2E tests (requires dev server on :3000)
npm run test:e2e

# Type checking (catches import errors)
npm run type-check
```

## Test Strategy

See [docs/testing/strategy.md](../docs/testing/strategy.md) for the full test strategy, coverage areas, and gap analysis.
