# System Architecture Overview

## System Context

```
┌──────────┐    HTTP     ┌──────────────┐    Playwright    ┌────────────────┐
│  Browser  │ ──────────→ │  Next.js App  │ ──────────────→ │  Target Website │
│  (User)   │ ←────────── │  (Server)     │ ←────────────── │                 │
└──────────┘    JSON      └──────┬───────┘                 └────────────────┘
                                 │
                                 │ NVIDIA NIM API
                                 │ (meta/llama-3.1-8b-instruct)
                                 ↓
                         ┌────────────────┐
                         │  NVIDIA NIM    │
                         │  (Cloud LLM)   │
                         └────────────────┘
```

## Layer Diagram

```
Browser → Next.js App Router
            ├── app/page.tsx (Landing — server component)
            │     ├── components/landing/hero.tsx (client — URL input + validation)
            │     │     └── components/landing/analysis-loading.tsx (client — progress + fetch)
            │     │           └── POST /api/capture → Playwright → Target Website
            │     ├── components/landing/features.tsx (server — static)
            │     ├── components/landing/how-it-works.tsx (server — static)
            │     ├── components/report/report-history.tsx (client — localStorage read)
            │     └── components/layout/footer.tsx (server — static)
            │
            └── app/report/page.tsx (client — report display)
                  ├── sessionStorage ← capture data
                  └── POST /api/analyze → NVIDIA NIM API
                        └── Server-side cache (1h TTL)
```

## Data Flow

1. **User** enters a URL on the landing page
2. **hero.tsx** validates the URL client-side (normalize + protocol check)
3. **analysis-loading.tsx** calls `POST /api/capture` with the URL
4. **capture/route.ts** launches headless Chromium via Playwright:
   - Navigates to URL, waits for `networkidle`
   - Extracts metadata (title, description, OG tags, Twitter cards)
   - Captures full-page screenshot
   - Runs Wappalyzer for technology detection
   - Checks `/robots.txt` and `/sitemap.xml`
5. Capture result is stored in **sessionStorage**, user is redirected to `/report`
6. **report/page.tsx** reads sessionStorage, displays technical report
7. Simultaneously calls `POST /api/analyze` with capture data
8. **analyze/route.ts** checks server-side cache → builds prompt → calls NVIDIA NIM → parses response → caches result
9. AI report is displayed below technical data

## Component Relationships

| Layer | Components | Concerns |
|---|---|---|
| **Pages** | `page.tsx`, `report/page.tsx` | Route composition, data orchestration |
| **Client Components** | `landing/hero.tsx`, `landing/analysis-loading.tsx`, `report/page.tsx`, `report/report-history.tsx`, `layout/theme-toggle.tsx` | Interactivity, browser APIs, state |
| **Server Components** | `features.tsx`, `how-it-works.tsx`, `footer.tsx`, `header.tsx`, `layout.tsx` | Static content, layout structure |
| **UI Primitives** | `ui/button.tsx`, `ui/input.tsx`, `ui/progress.tsx` | Base UI elements (shadcn/ui + base-ui) |
| **API Routes** | `api/capture/route.ts`, `api/analyze/route.ts` | Server-side business logic |

## Caching Strategy

| Layer | What | TTL | Key |
|---|---|---|---|
| **Server** | AI report responses | 1 hour | MD5 of URL + technologies + headers + metrics + SEO data |
| **Client (sessionStorage)** | Capture data | Per-tab | `capture:{normalizedUrl}` |
| **Client (sessionStorage)** | AI report | Per-tab | `ai:{finalUrl}` |
| **Client (localStorage)** | Report history | Persistent | `scout:history` (max 20 items) |

## State Ownership

| State | Location | Why |
|---|---|---|
| Form input value | `useState` in hero.tsx | Local UI state, no cross-component need |
| Loading / error flags | `useState` in analysis-loading.tsx | Single-use component lifecycle |
| Capture data | sessionStorage | Pass data from loading page → report page; not persistent |
| AI report | sessionStorage | Avoid re-fetching on page reload within tab |
| Report history | localStorage | Persist across sessions, no database |
| Theme preference | localStorage | Persist across sessions, apply before paint |
| Analytics events | localStorage | Track usage stats without a server |

## Rate Limiting Architecture

```
                        ┌──────────────────────────┐
                        │  lib/security/rate-limit.ts│
                        │                          │
Client IP ─────────────→│  In-memory Map<string,   │
  (x-forwarded-for)     │    number[]>              │
                        │                          │
                        │  Sliding window: 60s      │
                        │  capture:  5/min/IP       │
                        │  analyze: 15/min/IP       │
                        │                          │
                        │  Cleanup: setInterval     │
                        │   every 60s (.unref())    │
                        └──────────┬───────────────┘
                                   │
                        429 response with:
                        • Retry-After header
                        • X-RateLimit-Remaining header
```

- **Per-IP tracking**: IP extracted from `x-forwarded-for` → `x-real-ip` → `127.0.0.1`
- **Separate counters**: Each endpoint has its own rate limit bucket
- **Memory-safe**: 60-second cleanup interval removes stale entries; `setInterval().unref()` prevents blocking process exit
- **Scaling limit**: In-memory only — single instance. Scale-out requires Redis. (`ponytail:` commented in source)
