# Testing Strategy

## Approach

Scout AI uses **E2E-only testing** with Playwright running headless Chromium. Tests are in a single file under `tests/e2e/` and run with plain Node.js — no test runner, no assertion library.

```
npm run test:e2e
```

Requires `npm run dev` running on `localhost:3000`.

## Test File

**File:** `tests/e2e/capture-report.spec.cjs` (CommonJS format, 169 lines)

### Structure

```
🧪 Scout AI — E2E Test Suite
│
├── API Routes          (6 tests)
├── Browser Tests
│   ├── Landing page    (3 tests)
│   ├── Capture flow    (2 tests)
│   ├── Report page     (10 tests)
│   └── Mobile viewport (2 tests)
└── Summary
```

### Key Patterns

- **Rate-limit awareness**: The test captures a real website (`example.com`), so it respects the 5/min capture limit
- **Console error tracking**: A `page.on("console")` listener collects errors; a `realErrors` array is checked after each section
- **localStorage verification**: Reads `scout:history` key to confirm history persistence
- **sessionStorage inspection**: Logs keys for debugging
- **Mobile viewport**: Resizes to 375×667 and re-checks critical elements
- **Clipboard permission**: Grants `clipboard-write` and `clipboard-read` for Share button test

## Coverage Areas

### API Routes (6 tests)

| Test | Verification |
|---|---|
| `GET / → 200` | Landing page loads successfully |
| `POST /api/capture empty → 400` | Empty URL returns validation error |
| `POST /api/capture empty → error field` | Error response has message |
| `POST /api/capture private IP → 400` | `127.0.0.1` blocked |
| `POST /api/analyze exists` | Endpoint doesn't return 404 |
| `GET /nonexistent → 404` | Unknown route handled |

### Landing Page (3 tests)

| Test | Verification |
|---|---|
| Page title includes "Scout AI" | Correct document title |
| No console errors | Zero errors on initial load |
| Empty URL shows validation error | Error message visible |

### Capture Flow (2 tests)

| Test | Verification |
|---|---|
| Loading screen shown | "Analyzing" text visible after submit |
| Redirects to /report | URL includes `/report` within 45s timeout |

### Report Page (10 tests)

| Test | Verification |
|---|---|
| Report URL has parameter | Contains `url=` or `id=` |
| Report content visible | "Intelligence Report" or "HTTPS" in body |
| Print button visible | Button with "Print" text exists |
| Share button visible | Button with "Share" text exists |
| Theme toggle visible | Button with `aria-label*="theme"` exists |
| Theme toggle works | Click toggles `.dark` class |
| Share shows "Copied!" | Click Share shows confirmation |
| No console errors (re-check) | After all interactions |
| Report History section | Heading "Report History" appears |
| Report History from localStorage | Key `scout:history` has data |

### Mobile Viewport (2 tests)

| Test | Verification |
|---|---|
| Input visible at 375×667 | URL input renders on mobile |
| Button visible at 375×667 | Analyze button renders on mobile |

## Running Tests

```bash
# Terminal 1: Start the dev server
npm run dev

# Terminal 2: Run tests (wait for server to be ready)
npm run test:e2e
```

Tests exit with code 0 on pass, 1 on failure. Output:

```
🧪 Scout AI — E2E Test Suite
Target: http://localhost:3000

── API Routes ──
  ✅ GET / → 200
  ✅ POST /api/capture empty → 400
  ✅ POST /api/capture empty → error field
  ✅ POST /api/capture private IP → 400
  ✅ POST /api/analyze exists
  ✅ GET /nonexistent → 404

── Browser Tests ──
  ✅ Page title
  ✅ No console errors
  ✅ Empty URL shows error
  ✅ Loading screen shown
  ✅ Redirects to /report
  ✅ Report URL has param
  ✅ Report content visible
  ✅ Print button
  ✅ Share button
  ✅ Theme toggle visible
  ✅ Theme toggle (dark=true)
  ✅ Share shows 'Copied!'
  ✅ No console errors
  ✅ Report History section
  ✅ Mobile: input visible
  ✅ Mobile: button visible

═══════════════════════════════════════════
  PASSED: 22  FAILED: 0
═══════════════════════════════════════════
```

## Gap Analysis

### Missing Coverage

| Area | Risk | Priority |
|---|---|---|
| **Unit tests for `lib/`** — `security/rate-limit.ts`, `analysis/analytics.ts`, `utils/utils.ts` | Low — these are small, pure functions | Medium |
| **Component-level tests** — `hero.tsx` edge cases, `analysis-loading.tsx` error states | Medium — error branches not fully tested | Low |
| **AI response mocking** — Currently tests real API calls | Medium — tests are slow and depend on API availability | High |
| **Stress/load testing** — No multiple-concurrent-request tests | Low — app is single-user by design | Low |
| **Edge case URLs** — Internationalized domains, very long URLs, weird protocols | Medium — URL validation is regex-based | Low |
| **Screenshot rendering** — No visual regression testing | Low — screenshots are transient | Low |

### Future Additions

```bash
# Priority order for additional test coverage:

1. Add unit tests for lib/security/rate-limit.ts
   - Boundary: exactly 5 requests in window → allowed
   - Boundary: 6th request → blocked
   - Edge: timestamps older than window → excluded
   - Edge: cleanup removes stale entries

2. Add unit tests for lib/analysis/analytics.ts
   - Edge: localStorage full → silent fail
   - Edge: malformed JSON → return []
   - Boundary: exactly 200 events
   - Boundary: 201st event → trimmed

3. Add component tests with Vitest + React Testing Library
   - landing/hero.tsx: URL validation, error display, keydown handler
   - landing/analysis-loading.tsx: error state, try again button
   - report/report-history.tsx: empty state, populated state, clear button

4. Add error-mocking for API route tests
   - capture/route.ts: simulate Playwright failure
   - analyze/route.ts: simulate NVIDIA NIM API failure
```

## Constraints

- **No test runner**: Pure Node.js — no Jest, Vitest, or Mocha. Simplifies setup but lacks features (watch mode, parallel execution, code coverage)
- **Single file**: All tests in `tests/e2e/capture-report.spec.cjs`. Feasible now at 169 lines, but will need refactoring as coverage grows
- **Real external calls**: The test captures `example.com` and calls NVIDIA NIM — requires internet and valid API key
- **No assertions library**: Uses simple `ok()`/`fail()` helper functions
