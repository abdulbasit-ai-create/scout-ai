# Scout AI — Final Report

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │ Landing  │───▶│  Capture +   │───▶│    Report     │  │
│  │  Page    │    │  Progress    │    │    Page       │  │
│  │ (hero)   │    │  Animation   │    │ (full report) │  │
│  └──────────┘    └──────┬───────┘    └───────┬───────┘  │
│                         │   sessionStorage   │          │
│                         └────────────────────┘          │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP POST
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js Server (API)                   │
│  ┌──────────────────┐        ┌──────────────────────┐   │
│  │  /api/capture     │        │  /api/analyze        │   │
│  │  - Playwright     │        │  - NVIDIA NIM API    │   │
│  │  - Wappalyzer     │        │  - In-memory cache   │   │
│  │  - Screenshots    │        │  (1hr TTL)           │   │
│  │  - Rate limited   │        │  - Rate limited      │   │
│  │  (5/min/IP)       │        │  (15/min/IP)         │   │
│  └────────┬──────────┘        └──────────┬───────────┘   │
│           │                              │              │
│           │    ┌─────────────────┐       │              │
│           │    │  rate-limit.ts  │       │              │
│           │    │  (in-memory     │       │              │
│           │    │   sliding       │       │              │
│           │    │   window)       │       │              │
│           │    └─────────────────┘       │              │
│           ▼                              ▼              │
│    ┌──────────────┐           ┌──────────────────┐      │
│    │ Target       │           │ NVIDIA NIM API   │      │
│    │ Website      │           │ (Llama 3.1 8B)   │      │
│    └──────────────┘           └──────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. User enters a URL on the landing page
2. `components/landing/hero.tsx` validates the URL and renders `components/landing/analysis-loading.tsx`
3. `components/landing/analysis-loading.tsx` POSTs to `/api/capture` with the URL
4. `/api/capture` launches headless Chromium (Playwright), scrapes the page, runs Wappalyzer for tech detection, saves a screenshot, and returns structured JSON
5. Capture data is stored in `sessionStorage`; user is redirected to `/report?url=...`
6. Report page reads capture data from `sessionStorage` and POSTs to `/api/analyze`
7. `/api/analyze` sends structured data to NVIDIA NIM (Llama 3.1 8B), caches results server-side (1h TTL) and client-side (sessionStorage)
8. Report page renders the full intelligence report with score gauge, technical analysis, and AI-generated insights

### Storage Strategy

| Data | Storage | Lifetime |
|------|---------|----------|
| Capture data | `sessionStorage` | Per browser tab |
| AI report | `sessionStorage` + server Map | Session + 1 hour |
| Report history | `localStorage` | Persistent (20 entries) |
| Theme preference | `localStorage` | Persistent |
| Analytics events | `localStorage` | Persistent (200 entries) |
| Screenshots | `public/screenshots/` (filesystem) | Until deleted |

---

## Technologies Used

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 16.2.10 | React meta-framework with API routes |
| **UI Library** | React | 19.2.4 | Component rendering |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **UI Components** | shadcn/ui | 4.x | Design system primitives |
| **UI Primitives** | @base-ui/react | 1.6.0 | Accessible headless UI components |
| **Icons** | Lucide React | 1.23.0 | SVG icon library |
| **Fonts** | Geist (via next/font) | — | Sans + Mono typefaces |
| **Browser Automation** | Playwright | 1.61.1 | Headless browser for page capture |
| **Tech Detection** | Wappalyzer Core | 6.11.0 | Website technology fingerprinting |
| **AI Backend** | NVIDIA NIM API | — | Llama 3.1 8B inference |
| **Build Tool** | Webpack | (Next.js built-in) | Module bundling |

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **No database** | All state is client-side (sessionStorage/localStorage). Eliminates setup cost and hosting requirements. Suitable for single-user/self-hosted use. |
| **In-memory rate limiter** | Sufficient for single-instance deployment. Upgrade to Redis for multi-instance. |
| **NVIDIA NIM over Gemini** | Free tier has higher limits, OpenAI-compatible API, no API key needed for basic access. |
| **print-to-PDF over jsPDF** | Zero dependencies, native browser print dialog, works offline. |
| **Dark-first with light support** | CSS variables from shadcn support both themes. Dark is default for developer audience. |
| **@base-ui/react over Radix** | shadcn v4 (base-nova) ships with @base-ui/react as the default primitive library. |
| **WASM SWC fallback on Win32** | Next.js SWC binary doesn't load on this system; automatically falls back to WASM. Works correctly. |

---

## Open-Source Libraries Used

| Library | License | Purpose |
|---------|---------|---------|
| [next](https://nextjs.org/) | MIT | React framework |
| [react](https://react.dev/) | MIT | UI library |
| [tailwindcss](https://tailwindcss.com/) | MIT | CSS framework |
| [@base-ui/react](https://base-ui.com/) | MIT | Headless UI primitives |
| [shadcn/ui](https://ui.shadcn.com/) | MIT | Component system |
| [lucide-react](https://lucide.dev/) | ISC | Icons |
| [playwright](https://playwright.dev/) | Apache 2.0 | Browser automation |
| [wapalyzer-core](https://www.wappalyzer.com/) | Apache 2.0 | Technology detection |
| [class-variance-authority](https://cva.style/) | Apache 2.0 | Component variants |
| [clsx](https://github.com/lukeed/clsx) | MIT | Class name utility |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | MIT | Class deduplication |
| [tw-animate-css](https://github.com/ben-rogerson/tw-animate-css) | MIT | Tailwind animation |
| [@tailwindcss/postcss](https://tailwindcss.com/) | MIT | PostCSS integration |
| [next/font](https://nextjs.org/) | MIT | Font optimization (Geist) |

**Total dependencies: 17 production + 5 dev**

---

## Features

### Core

| Feature | Status | Description |
|---------|--------|-------------|
| Website Capture | ✅ | Real-time Playwright-based page scraping |
| Technology Detection | ✅ | Wappalyzer integration (1000+ technologies) |
| AI Intelligence Report | ✅ | NVIDIA NIM (Llama 3.1 8B) structured analysis |
| Screenshot Capture | ✅ | Full-page screenshots saved to disk |

### Production

| Feature | Status | Description |
|---------|--------|-------------|
| Print / PDF Export | ✅ | Browser print dialog with custom @media print styles |
| Shareable Links | ✅ | Unique hash-based URLs via localStorage |
| Report History | ✅ | Last 20 reports in localStorage with card grid |
| Dark/Light Theme | ✅ | System-aware with manual toggle and flash prevention |
| Rate Limiting | ✅ | Per-IP sliding window (5 capture/min, 15 analyze/min) |
| Input Validation | ✅ | Private IP blocking, URL format validation |
| Analytics | ✅ | Local tracking of duration, size, success rate |
| Mobile Responsive | ✅ | Touch targets, breakpoints, fluid layout |
| Accessibility | ✅ | ARIA labels, roles, semantic HTML, keyboard nav |

### Performance

| Area | Detail |
|------|--------|
| Bundle size | ~150KB JS (Next.js + React + shadcn) |
| AI latency | ~2–5s per analysis (NVIDIA NIM) |
| Capture speed | ~2–6s depending on target website |
| Caching | Server-side (1h), client-side (sessionStorage) |
| Image loading | `loading="lazy"` on all screenshots |
| Code splitting | AiReportSection separated from main render |

---

## Future Improvements

### Short-term

- **Database backend** — Replace localStorage with IndexedDB (via Dexie) or a server-side database (SQLite) for larger storage limits and queryability
- **Multi-URL analysis** — Compare multiple websites in a single view
- **Scheduled scans** — Cron-based periodic re-analysis with change detection
- **Email reports** — Send PDF reports via email (Resend, SendGrid)

### Medium-term

- **User accounts** — Simple auth (NextAuth) for persistent history across devices
- **Team workspaces** — Shared reports, annotations, team comments
- **API key management** — Let users bring their own NVIDIA/OpenAI keys
- **Advanced analytics dashboard** — Charts for scan history, trends over time

### Long-term

- **Browser extension** — One-click analysis from the browser toolbar
- **Public API** — Rate-limited API for third-party integrations
- **White-label reports** — Custom branding for agencies
- **On-premise deployment** — Docker compose with all dependencies (Playwright, PostgreSQL, Redis)

---

## Known Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| SWC not available on Win32 | Slower builds (WASM fallback) | Use `--webpack` flag |
| In-memory rate limiter | Resets on server restart | Built-in limitation of single-instance |
| localStorage storage limit | ~5MB per origin | History capped at 20 entries |
| Social preview screenshots unavailable | Share links lack preview cards | Future: dynamic OG image generation |
| Screenshots accumulate on disk | No automatic cleanup | Manual deletion of `public/screenshots/` |
| Free NVIDIA NIM rate limits | ~50 requests/day for free tier | Upgrade to paid NVIDIA API key |

---

## Verification

| Check | Result |
|-------|--------|
| TypeScript compilation | ✅ Zero errors (5.9s) |
| Webpack build | ✅ Compiled in 18.9s |
| API route validation | ✅ Capture validates URL, rejects private IPs |
| Rate limiting | ✅ 429 returned with Retry-After header |
| Theme persistence | ✅ localStorage survives page reload |
| Print styles | ✅ @media print overrides all dark backgrounds |
| Report history | ✅ Stored and retrievable from landing page |
| Share links | ✅ Encoded IDs resolve from history |
| Empty/error states | ✅ All edge cases handled (no URL, not found, error) |
