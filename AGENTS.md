# AGENTS.md — Scout AI

> **Single source of truth for AI agents working on this codebase.**
> Last updated: 2026-07-11

---

## 1. Project Overview

**Scout AI** is an AI-powered website intelligence analyzer. It captures a live website via headless browser, detects its technology stack, and generates a structured intelligence report using an LLM.

### Core Flow

```
User enters URL → /api/capture (Playwright) → screenshot + metadata + tech detection
                                      ↓
                            /api/analyze (NVIDIA NIM LLM) → structured JSON report
                                      ↓
                            /report page → displays technical + AI analysis
```

1. **Capture**: User submits a URL → `analysis-loading.tsx` calls `POST /api/capture` → Playwright `chromium.launch()` navigates to URL, takes a full-page screenshot, extracts metadata (title, description, OG tags, Twitter cards, security headers, redirect chain, cookies), and runs `Wappalyzer.analyze()` for technology detection. Also checks `/robots.txt` and `/sitemap.xml`. Result saved to `sessionStorage`.
2. **Analyze**: Report page sends captured data to `POST /api/analyze` → builds a structured prompt → calls NVIDIA NIM API (`meta/llama-3.1-8b-instruct`) → parses JSON response into `AiReport` → caches server-side for 1 hour.
3. **Report**: `/report` page reads from `sessionStorage`, renders technical findings (screenshot, stats, security headers, tech list, OG data), then loads AI analysis section lazily.

---

## 2. Folder Architecture

```
scout-ai/
├── app/                          # Next.js App Router pages + API
│   ├── api/
│   │   ├── capture/route.ts      # POST — Playwright website capture (Node.js runtime)
│   │   └── analyze/route.ts      # POST — NVIDIA NIM AI analysis (Node.js runtime)
│   ├── report/page.tsx           # /report — Intelligence report UI (client component, 745 lines)
│   ├── page.tsx                  # / — Landing/home page (server component)
│   ├── layout.tsx                # Root layout — Geist fonts, theme injection script, Header
│   └── globals.css               # Tailwind v4 import, shadcn theme vars, dark/light, print styles
│
├── components/
│   ├── ui/                       # Primitive UI components (shadcn/ui + base-ui/react)
│   │   ├── button.tsx            # CVA-based button with variants (default, outline, ghost, etc.)
│   │   ├── input.tsx             # Styled input wrapping @base-ui/react/input
│   │   └── progress.tsx          # Progress bar with Track, Indicator, Label, Value sub-components
│   ├── hero.tsx                  # Landing hero: heading + URL input + analyze button
│   ├── analysis-loading.tsx      # Capture loading screen with animated progress + error state
│   ├── header.tsx                # Sticky header: logo + theme toggle
│   ├── footer.tsx                # Simple footer with branding
│   ├── features.tsx              # Three feature cards (Website Analysis, Technology Detection, AI Report)
│   ├── how-it-works.tsx          # Three-step guide (Paste URL → Scout Analyzes → AI Generates Report)
│   ├── report/
│   │   └── report-history.tsx    # History list read from localStorage (max 20 items)
│   └── layout/
│       ├── header.tsx            # Sticky header
│       ├── footer.tsx            # Site footer
│       └── theme-toggle.tsx      # Dark/light toggle via localStorage + prefers-color-scheme
│
├── lib/
│   ├── analysis/                 # Analytics tracking
│   │   └── analytics.ts          # localStorage analytics tracker (max 200 events)
│   ├── capture/                  # Capture utilities (reserved for future extraction)
│   ├── performance/              # Performance modules (reserved for future extraction)
│   ├── security/                 # Security modules
│   │   └── rate-limit.ts         # In-memory sliding window rate limiter (capture: 5/min, analyze: 15/min)
│   ├── seo/                      # SEO utilities (reserved for future extraction)
│   └── utils/                    # Shared utilities
│       └── utils.ts              # cn() helper — clsx + tailwind-merge
│
├── public/screenshots/           # Captured page screenshots (gitignored)
│
├── types/
│   └── wapalyzer-core.d.ts       # TypeScript declarations for wapalyzer-core
│
├── docs/                         # Documentation directories (populated as ARRs are written)
│   ├── api/                      # API documentation
│   ├── architecture/             # Architecture decision records
│   ├── decisions/                # Product/engineering decisions
│   ├── features/                 # Feature specs
│   └── testing/                  # Test plans and results
│
├── .env.local                    # NVIDIA_NIM_API_KEY (gitignored)
├── tests/
│   ├── e2e/
│   │   └── capture-report.spec.cjs  # Playwright E2E test suite
│   └── unit/                         # Unit tests (planned)
│       └── README.md
├── next.config.ts                # Next.js 16.2 config
├── tsconfig.json                 # TypeScript strict mode, @/ alias
├── eslint.config.mjs             # ESLint 9 — core-web-vitals + TypeScript rules
├── postcss.config.mjs            # @tailwindcss/postcss plugin
├── components.json               # shadcn/ui configuration
├── package.json                  # Dependencies and scripts
├── README.md                     # Project README
├── LICENSE                       # License file
├── docs/
│   ├── reports/
│   │   ├── FINAL_REPORT.md       # Final project report
│   │   └── SAMPLE_REPORTS.md     # Sample report outputs
│   └── demos/
│       └── DEMO_SCRIPT.md        # Demo walkthrough script
└── AGENTS.md                     # ← This file — AI agent instructions
```

---

## 3. Tech Stack

| Dependency | Version | Purpose |
|---|---|---|
| **next** | 16.2.10 | React framework with App Router |
| **react** / **react-dom** | 19.2.4 | UI library |
| **typescript** | ^5 | Type safety |
| **tailwindcss** | ^4 | Utility-first CSS framework |
| **@tailwindcss/postcss** | ^4 | Tailwind v4 PostCSS plugin |
| **tw-animate-css** | ^1.4.0 | Animation utilities for Tailwind |
| **shadcn** | ^4.13.0 | Component scaffolding + tailwind.css theme |
| **@base-ui/react** | ^1.6.0 | Headless UI primitives (Button, Input, Progress) |
| **class-variance-authority** | ^0.7.1 | Variant-based component styling (CVA) |
| **clsx** | ^2.1.1 | Conditional class joining |
| **tailwind-merge** | ^3.6.0 | Intelligent Tailwind class merging (used in `cn()`) |
| **lucide-react** | ^1.23.0 | Icon library |
| **playwright** | ^1.61.1 | Headless browser for website capture |
| **wapalyzer-core** | ^6.11.0 | Technology detection engine |
| **eslint** | ^9 | Linting |
| **eslint-config-next** | 16.2.10 | Next.js ESLint config (core-web-vitals + TypeScript) |

### External Services

| Service | Endpoint | Purpose |
|---|---|---|
| **NVIDIA NIM API** | `https://integrate.api.nvidia.com/v1/chat/completions` | LLM inference — `meta/llama-3.1-8b-instruct`, temp 0.1, max 2048 tokens |

---

## 4. Coding Conventions

### TypeScript

- **`strict: true`** in tsconfig.json (strict mode enabled).
- **No `any`** unless unavoidable (error catch, third-party interop). Prefer `unknown` + narrowing.
- **Explicit return types** on functions that export an interface (API routes, library functions). Local helpers can infer.
- **Use `Readonly<>`** for props interfaces in server components.
- **`@/` path alias** configured — always use `@/components/...`, `@/lib/...` instead of relative imports.

### React

- **Server components by default**, "use client" only when interactivity, hooks, or browser APIs are needed.
- **Server components** are async-capable but Scout AI doesn't use data fetching in server components yet.
- **Client component boundary** at the leaves: `landing/hero.tsx`, `landing/analysis-loading.tsx`, `report/page.tsx`, `report/report-history.tsx`, `layout/theme-toggle.tsx`.
- **Props are typed inline** via `interface` near the component (not in a separate types file) unless shared between components.
- **No prop-drilling deeper than 2 levels** — the report page uses simple `useState` at the top level because it's only one layer deep.
- **`Suspense` boundary** wraps `ReportContent` in `report/page.tsx` for `useSearchParams`.

### Tailwind CSS

- **Tailwind v4** with `@import "tailwindcss"` (not the v3 `@tailwind` directives).
- **Dark mode** via `.dark` class strategy, toggled by `layout/theme-toggle.tsx` and script-injected in `layout.tsx`.
- **`@theme inline`** for CSS custom properties (colors, radius, fonts).
- **`cn()` utility** for merging classes — always use it in component className props.
- **Print styles** in `globals.css` under `@media print` — hide interactive elements, force light backgrounds.
- **`@custom-variant dark (&:is(.dark *))`** for dark variant support in v4.
- **Use `oklch()`** color syntax throughout for modern color space.
- **Responsive breakpoints**: Tailwind defaults (sm: 640px, md: 768px, lg: 1024px, xl: 1280px).

### File Naming

- **Components**: `kebab-case.tsx` — `landing/hero.tsx`, `landing/analysis-loading.tsx`, `layout/theme-toggle.tsx`.
- **UI primitives**: `button.tsx`, `input.tsx`, `progress.tsx` inside `components/ui/`.
- **Library modules**: `kebab-case.ts` — `security/rate-limit.ts`, `analysis/analytics.ts`, `utils/utils.ts`.
- **API routes**: `route.ts` under `app/api/[name]/`.
- **Pages**: `page.tsx` under `app/[route]/`.
- **Test files**: `tests/e2e/capture-report.spec.cjs`.

---

## 5. Naming Conventions

| Category | Convention | Examples |
|---|---|---|
| **Files** | `kebab-case.tsx` / `kebab-case.ts` | `landing/analysis-loading.tsx`, `security/rate-limit.ts` |
| **React components** | PascalCase | `Hero`, `AnalysisLoading`, `ScoreRing` |
| **Functions** | camelCase | `handleAnalyze`, `normalizeUrl`, `formatBytes` |
| **Interfaces / Types** | PascalCase | `CaptureData`, `AiReport`, `AnalysisEvent` |
| **Props interfaces** | Defined locally, PascalCase | `interface HistoryItem` in `report/report-history.tsx` |
| **Environment variables** | `UPPER_SNAKE_CASE` | `NVIDIA_NIM_API_KEY` |
| **localStorage keys** | `scout:namespaced` | `scout:history`, `scout:theme`, `scout:analytics` |
| **sessionStorage keys** | `capture:{url}` / `ai:{url}` | `capture:https://example.com` |
| **CSS custom properties** | `--kebab-case` | `--color-background`, `--radius-lg` |
| **API routes** | `POST /api/capture`, `POST /api/analyze` | Resource-based naming |

### Storage Namespacing

All browser storage keys are prefixed with `scout:` to avoid collisions:

- `scout:history` — Report history (localStorage, max 20 items)
- `scout:theme` — Theme preference (localStorage, `"dark"` | `"light"`)
- `scout:analytics` — Analysis event log (localStorage, max 200 events)
- `capture:{normalizedUrl}` — Capture result for URL (sessionStorage, per-tab)
- `ai:{finalUrl}` — Cached AI report (sessionStorage, per-tab)

---

## 6. Component Patterns

### Server vs Client Split

```
app/page.tsx              — Server: composes Hero (client), Features (server), HowItWorks (server),
│                            ReportHistory (client), Footer (server)
├── components/landing/
│   ├── hero.tsx           — "use client" — input state, form validation, router navigation
│   ├── features.tsx       — Server — static data, no interactivity
│   ├── how-it-works.tsx   — Server — static data, no interactivity
│   └── analysis-loading.tsx — "use client" — capture progress + fetch
├── components/report/
│   └── report-history.tsx — "use client" — localStorage access
└── components/layout/
    ├── header.tsx         — Server — sticky header
    ├── footer.tsx         — Server — static markup
    └── theme-toggle.tsx   — "use client" — dark/light toggle
```

### State Management

- **No global state library** (no Redux, Zustand, Context). The app is simple enough for local state.
- **URL → capture → analysis → report** flow uses:
  - **Component state** (`useState`) for UI state (loading, errors, form values).
  - **sessionStorage** to pass capture data between loading page → report page (single user flow).
  - **localStorage** for persistence across sessions (history, theme, analytics).
- **Shared state between components** is passed as props (max 2 levels deep).

### Event Handling

- **Form submissions**: `handleAnalyze` in `hero.tsx` — validates URL, triggers navigation to loading page.
- **Keyboard**: `handleKeyDown` on URL input — Enter key triggers analyze.
- **Error recovery**: `analysis-loading.tsx` shows error with "Try Again" button that navigates to `/`.
- **Share/Print**: Direct DOM APIs (`navigator.clipboard`, `window.print()`) in `report/page.tsx`.

### Component Composition

- **Page sections** are composed in `app/page.tsx`: `<Hero />` → `<Features />` → `<HowItWorks />` → `<ReportHistory />` → `<Footer />`.
- **Report page** is a single `ReportContent` component wrapped in `Suspense`.
- **AI Report section** is a sub-component `AiReportSection` within `report/page.tsx` (not extracted — co-located for readability).
- **UI primitives** (`Button`, `Input`, `Progress`) wrap `@base-ui/react` with shadcn styling. These live in `components/ui/`.

---

## 7. API Design Rules

### Endpoint Conventions

| Method | Route | Purpose | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/capture` | Playwright website capture | `{ url: string }` | `CaptureData` JSON |
| `POST` | `/api/analyze` | NVIDIA NIM AI analysis | `CaptureData` JSON | `{ report: AiReport, cached: boolean }` or `{ error: string }` |

Both use `export const runtime = "nodejs"` (Playwright requires Node.js; no edge runtime).

### Validation

- **URL validation** in `capture/route.ts:validateUrl()`:
  - Normalizes (adds `https://` if missing).
  - Blocks private/reserved IPs: `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`, `10.*`, `172.16.*`, `192.168.*`, `*.local`, `*.internal`.
  - Requires `http:` or `https:` protocol.
- **Missing field checks** in `analyze/route.ts`: `data?.finalUrl` must exist, `NVIDIA_NIM_API_KEY` must be set.

### Rate Limiting

- **In-memory sliding window** (`lib/security/rate-limit.ts`):
  - `capture`: 5 requests per minute per IP (Playwright is resource-heavy).
  - `analyze`: 15 requests per minute per IP.
- **Headers** on 429 response: `Retry-After`, `X-RateLimit-Remaining`.
- **IP extraction**: `x-forwarded-for` → `x-real-ip` → `127.0.0.1`.
- **Cleanup interval**: Every 60 seconds, stale entries are purged via `setInterval().unref()`.

### Error Responses

```typescript
// All errors follow this shape:
{ error: string }

// Status codes:
400 — Validation failure (invalid URL, missing fields)
429 — Rate limit exceeded (Retry-After header set)
500 — Internal error (capture failed, AI API error, missing env var)
```

### Caching

- **Server-side**: In-memory `Map<string, { data, ts }>` in `analyze/route.ts` with 1-hour TTL. Cache key is MD5 of the relevant capture data fields (URL, technologies, headers, metrics, SEO data, redirects).
- **Client-side**: sessionStorage caches AI reports by `finalUrl` key (`ai:{finalUrl}`) to avoid re-fetching on page reload.

### Cache Invalidation

- Server cache is TTL-based only (1 hour). No manual invalidation endpoint.
- Client cache is per-tab (sessionStorage) — cleared on tab close.

---

## 8. Error Handling Rules

### try/catch Patterns

```typescript
// Route handlers — catch at the outer boundary, return JSON error
export async function POST(req: NextRequest) {
  try {
    // ... operation ...
    return NextResponse.json({ ...data })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Fallback message" },
      { status: 500 }
    )
  }
}

// Browser calls — catch per operation, set error state
try {
  const res = await fetch("/api/capture", { ... })
  if (!res.ok) { throw new Error(...) }
  // ... success handling ...
} catch (err: any) {
  setError(err.message || "Failed to capture website")
}
```

### User-Facing Errors

- **Validation errors**: Show inline below input (`hero.tsx` line 110), role="alert", red text.
- **Capture errors**: Show in `analysis-loading.tsx` with error message + "Try Again" button.
- **AI analysis errors**: Show inline in `AiReportSection` — yellow/amber warning, not a red error. The technical report data is still displayed below.
- **Rate limit errors**: Return 429 with descriptive message and headers. The loading page will display the error.

### Silent Failures

- **localStorage/sessionStorage access**: Wrapped in try/catch — silently drops if storage is full, private browsing restricts, or JSON parse fails.
- **`page.$eval()` for optional elements**: Uses `.catch(() => "")` or `.catch(() => defaultValue)` in capture route.
- **`browser.close()` in error path**: Uses `.catch(() => {})` to avoid unhandled promise rejections.
- **`navigator.clipboard.writeText()`**: `.catch(() => {})` — clipboard access may be denied.

### Error Boundary

- No React error boundary is implemented. The app is simple enough that API-level error handling + UI error states cover failure modes.

---

## 9. Testing Strategy

### Current Approach

- **Single E2E test file**: `tests/e2e/capture-report.spec.cjs`. Uses Playwright directly (no test runner).
- Run with: `npm run test:e2e` (requires `npm run dev` running on port 3000).
- **No unit tests** currently. Library functions (`security/rate-limit.ts`, `analysis/analytics.ts`, `utils/utils.ts`) are straightforward enough that E2E coverage is sufficient at this stage.

### Test Coverage Areas

The E2E test (`tests/e2e/capture-report.spec.cjs`) covers:

| Category | Tests |
|---|---|
| **API Routes** | Landing page 200, empty URL → 400, private IP → 400, analyze endpoint graceful 500 |
| **UI Rendering** | Title renders, invalid URL shows error, loading screen shown, /report navigation |
| **Report Page** | Intelligence Report heading, AI score/loading/error states, Share button, Print button |
| **Theme Toggle** | Toggle exists, click toggles class, click again restores |
| **Share Feature** | Share button copies link, "Copied!" confirmation appears |
| **Console Errors** | No console errors on page reload |
| **History** | Report History section renders (or gracefully absent) |

### Testing Patterns

- **Assertion style**: Simple `ok()` / `fail()` functions, no assertion library.
- **No test runner**: Pure Node.js script — `await` + try/catch.
- **Headless browser**: `chromium.launch({ headless: true })`.

### Target Coverage Additions

- Unit tests for `security/rate-limit.ts` boundary cases (exact limit, cleanup after window).
- Unit tests for `validateUrl()` in capture route (edge cases, edge of regex).
- AI report `parseResponse()` robustness (malformed JSON, missing keys).
- Capture route resilience (timeouts, network failures, malformed responses).

---

## 10. Git Workflow

### Branching

- `main` — Production-ready, deployable.
- Feature branches: `feat/description` (e.g., `feat/ai-caching`).
- Fix branches: `fix/description` (e.g., `fix/rate-limit-overflow`).

### Commits

- **Conventional Commits** format:
  ```
  feat: add AI report caching layer
  fix: handle empty localStorage gracefully
  chore: update dependencies
  docs: add AGENTS.md
  ```
- Keep commits atomic (one logical change per commit).
- No `--no-verify` unless absolutely necessary.

### Pull Requests

- Target: `main`.
- Title matches the feature/fix description (Conventional Commits style).
- Description should link to relevant docs/decisions if applicable.
- At least one review required.
- Squash-merge preferred (clean commit history on main).

---

## 11. Security Rules

### Private IP Blocking

`capture/route.ts:validateUrl()` rejects:
- `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`
- Private ranges: `10.*`, `172.16.*`, `192.168.*`
- Internal domains: `*.local`, `*.internal`

### Rate Limiting

- Per-IP sliding window prevents abuse (5 captures/min, 15 analyses/min).
- IP extracted from `x-forwarded-for` header (respects proxy setups).
- Cleanup timer prevents memory leak from stale entries.

### Environment Variable Protection

- `.env*` is gitignored (see `.gitignore`).
- `NVIDIA_NIM_API_KEY` is read from `process.env` at request time.
- API route returns clear 500 error if env var is missing (no crash, no exposure of other env vars).

### Playwright Security

- Browser runs `headless: true`.
- User-Agent is spoofed to a standard Chrome UA (not exposing "HeadlessChrome").
- Navigation timeout: 30 seconds.
- Screenshots are saved to `public/screenshots/` (gitignored) with hashed filenames to prevent enumeration.

### API Key Exposure

- NVIDIA NIM API key is never exposed to the client. All calls to the external API happen server-side in `analyze/route.ts`.
- Client only talks to `/api/capture` and `/api/analyze` — never directly to NVIDIA.

### localStorage Safety

- All data stored is read-only by Scout AI. No sensitive data is stored.
- Max limits enforced: history (20 items), analytics (200 events).

---

## 12. Performance Rules

### Caching Strategy

| Layer | What | TTL | Mechanism |
|---|---|---|---|
| **Server** | AI report responses | 1 hour | In-memory `Map<string, { data, ts }>` in `analyze/route.ts` |
| **Client** | AI report per URL | Per-tab | `sessionStorage.setItem("ai:" + finalUrl, ...)` |
| **Client** | Capture data per URL | Per-tab | `sessionStorage.setItem("capture:" + url, ...)` |

### Bundle Size

- **No large client libraries**. Playwright and Wappalyzer run only server-side (Node.js runtime).
- **Lucide React** is tree-shakeable — import only the icons you need (the report page imports ~20 icons).
- **No moment/lodash/date-fns** — native `Date` methods for formatting.
- **No chart library** — the score ring is a hand-rolled SVG component.

### Image Optimization

- Screenshots are served from `public/screenshots/` as static PNGs.
- Report page uses `loading="lazy"` on screenshot images.
- Favicon image has `onError` handler to hide if load fails.

### CSS Performance

- Tailwind v4 uses JIT compilation — zero unused CSS in production builds.
- Animation classes (`animate-spin`, `animate-ping`) are utility-based, no heavy CSS-in-JS runtime.
- Print styles are in `globals.css` under `@media print` — loaded only when printing.

### Server-Side Heavy Operations

- Playwright browser launch per request is the heaviest operation. Rate limited to 5/min.
- If scaling to multiple instances, the in-memory rate limiter and cache would need Redis.

---

## 13. Definition of Done

A feature/bugfix is **done** when all these criteria are met:

### Functionality

- [ ] Feature works as specified in the task/issue description.
- [ ] All error states are handled (network failure, empty data, invalid input, rate limit).
- [ ] No console errors in browser (checked via E2E test).
- [ ] Works in both dark and light themes.
- [ ] Works on mobile viewports (responsive).
- [ ] Print output looks correct (print styles applied).

### Code Quality

- [ ] TypeScript strict mode passes — no `any` (unless unavoidable and justified in comment).
- [ ] ESLint passes with zero warnings (run `npm run lint`).
- [ ] No debug artifacts (console.log, commented code, unused imports).
- [ ] Follows naming conventions (Section 5).
- [ ] No duplicated logic — reuse existing utilities (`cn()`, `formatBytes()`, etc.).
- [ ] Ponytail `// ponytail:` comments added for deliberate simplifications.

### Testing

- [ ] E2E test (`npm run test:e2e`) passes.
- [ ] If new API endpoint: tested manually or via E2E.
- [ ] If new component: renders without error in both server and client contexts.

### Documentation

- [ ] If new API route: documented in AGENTS.md API section.
- [ ] If new component: listed in AGENTS.md Folder Architecture.
- [ ] If new dependency: listed in AGENTS.md Tech Stack with version and purpose.
- [ ] If architectural decision: ADR added to `docs/decisions/`.

### Security

- [ ] No API keys exposed to client (all external API calls server-side).
- [ ] URL validation blocks private/internal IPs if user-supplied URL is used.
- [ ] Rate limiting applied if public-facing endpoint.
- [ ] `.env` values never committed.

### Performance

- [ ] No unnecessary server/client component boundary changes.
- [ ] No large dependencies added without justification.
- [ ] Images use `loading="lazy"`.
- [ ] localStorage/sessionStorage has hard limits (max items).
