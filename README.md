# Scout AI — AI-Powered Website Intelligence

[![CI](https://github.com/your-org/scout-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/scout-ai/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Scout AI** captures any live website, analyzes its technology stack, and generates a structured intelligence report using AI — all in seconds.

---

## Features

- **Website Capture** — Headless browser (Playwright) scrapes page content, metadata, screenshots, redirect chains, and security headers
- **Technology Detection** — Identifies frameworks, libraries, analytics tools, and hosting providers via Wappalyzer
- **AI Intelligence Report** — Structured analysis (score, strengths, weaknesses, security risks, SEO/performance suggestions) using NVIDIA NIM (Llama 3.1 8B)
- **Dark/Light Theme** — System-aware with manual toggle and localStorage persistence
- **Report History** — Stores last 20 reports in localStorage with quick reload and shareable links
- **Print / PDF Export** — Optimized `@media print` styles for clean PDF output
- **Rate Limiting** — Per-IP sliding window (5 captures/min, 15 analyses/min)
- **Responsive & Accessible** — Mobile-first, ARIA labels, keyboard navigation, 44px touch targets

---

## Screenshots

| Landing Page | Capture In Progress | Intelligence Report |
|---|---|---|
| *(screenshot placeholder)* | *(screenshot placeholder)* | *(screenshot placeholder)* |

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (React 19) | App Router, SSR, API routes |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + [@base-ui/react](https://base-ui.com/) | Accessible primitives |
| **Icons** | [Lucide React](https://lucide.dev/) | Tree-shakeable icon library |
| **Browser Automation** | [Playwright](https://playwright.dev/) | Headless Chromium capture |
| **Tech Detection** | [Wappalyzer](https://www.wappalyzer.com/) | Technology fingerprinting |
| **AI Backend** | [NVIDIA NIM](https://build.nvidia.com/) | LLM inference (Llama 3.1 8B) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (strict mode) | Type safety |
| **Linting** | [ESLint 9](https://eslint.org/) + `eslint-config-next` | Code quality |

---

## Quick Start

### Prerequisites

- **Node.js 20+**
- **NVIDIA NIM API Key** — [Free at build.nvidia.com](https://build.nvidia.com/) (no credit card required)
- **Playwright browsers** — Installed via `npx playwright install chromium`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/scout-ai.git
cd scout-ai

# 2. Install dependencies
npm install

# 3. Install Playwright browser
npx playwright install chromium

# 4. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your NVIDIA NIM API key
```

### Development

```bash
# Start the dev server (use --webpack on Win32)
npx next dev --webpack

# Open http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Testing

```bash
# E2E tests (requires dev server on :3000)
npm run test:e2e

# Type checking
npm run type-check

# Lint
npm run lint
```

---

## Project Structure

```
scout-ai/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── capture/route.ts      # POST — Playwright website capture
│   │   └── analyze/route.ts      # POST — NVIDIA NIM AI analysis
│   ├── report/page.tsx           # /report — Intelligence report (693 lines)
│   ├── page.tsx                  # / — Landing page
│   ├── layout.tsx                # Root layout with theme injection
│   └── globals.css               # Tailwind v4, theme vars, print styles
│
├── components/
│   ├── ui/                       # shadcn/ui primitives (Button, Input, Progress)
│   ├── landing/                  # Landing: hero, features, how-it-works, analysis loading
│   ├── report/                   # Report: history component
│   └── layout/                   # Layout: header, footer, theme toggle
│
├── lib/
│   ├── analysis/                 # Analytics tracking (localStorage)
│   ├── capture/                  # Capture utilities (reserved)
│   ├── performance/              # Performance modules (reserved)
│   ├── security/                 # Rate limiter (in-memory sliding window)
│   ├── seo/                      # SEO utilities (reserved)
│   └── utils/                    # cn() helper and shared utilities
│
├── tests/
│   ├── e2e/                      # Playwright E2E tests
│   └── unit/                     # Unit tests (planned)
│
├── docs/                         # Documentation
│   ├── api/                      # API specifications
│   ├── architecture/             # System architecture & data flow
│   ├── decisions/                # Architecture Decision Records
│   ├── features/                 # Feature specs
│   ├── reports/                  # Project reports & samples
│   ├── demos/                    # Demo scripts
│   ├── testing/                  # Testing strategy
│   ├── deployment/               # Deployment guides
│   └── setup/                    # Setup guides
│
├── .scout/                       # AI agent context
│   ├── agents/                   # Agent role definitions
│   ├── skills/                   # Reusable skill documents
│   └── prompts/                  # Prompt templates (reserved)
│
├── .github/workflows/ci.yml      # CI pipeline
├── AGENTS.md                     # AI agent single source of truth
├── .env.example                  # Environment variable template
└── package.json
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NVIDIA_NIM_API_KEY` | **Yes** | NVIDIA NIM API key. Get one free at [build.nvidia.com](https://build.nvidia.com/) |

Copy `.env.example` to `.env.local` and fill in your key. The `.env.*` files are gitignored by default.

---

## API Routes

| Route | Method | Rate Limit | Description |
|---|---|---|---|
| `/api/capture` | POST | 5/min/IP | Captures website via headless Playwright |
| `/api/analyze` | POST | 15/min/IP | Generates AI intelligence report |

### Capture Endpoint

```json
// POST /api/capture
// Request:
{ "url": "https://example.com" }

// Response (200):
{
  "title": "Example Domain",
  "metaDescription": "...",
  "finalUrl": "https://example.com/",
  "screenshot": "/screenshots/abc123-1234567890.png",
  "analysis": {
    "hasHttps": true,
    "redirectChain": [],
    "securityHeaders": { ... },
    "loadTimeMs": 1234,
    "pageSizeBytes": 56789,
    "technologies": [{ "name": "React", "version": "18" }],
    "openGraph": { ... },
    "twitterCard": { ... },
    "hasRobotsTxt": true,
    "hasSitemapXml": false
  }
}

// Error (400): { "error": "A valid public website URL is required" }
// Error (429): { "error": "Rate limit exceeded. Retry in 45s." }
```

### Analyze Endpoint

```json
// POST /api/analyze
// Request: Full CaptureData object from /api/capture

// Response (200):
{
  "report": {
    "executiveSummary": "...",
    "strengths": ["..."],
    "weaknesses": ["..."],
    "securityRisks": ["..."],
    "seoSuggestions": ["..."],
    "performanceSuggestions": ["..."],
    "overallScore": 85,
    "scoreExplanation": "..."
  },
  "cached": false
}
```

### Validation Rules

The capture API rejects:
- Empty or malformed URLs
- Private/reserved IPs (`10.x`, `172.16.x`, `192.168.x`, `localhost`, `127.0.0.1`)
- Non-HTTP(S) protocols

### Rate Limiting

In-memory sliding window per IP address:
- **Capture**: 5 requests per minute
- **Analyze**: 15 requests per minute

Returns HTTP 429 with `Retry-After` header when exceeded. Resets on server restart — use Redis for multi-instance deployments.

---

## Architecture Overview

```
User enters URL → /api/capture (Playwright) → Screenshot + metadata + tech detection
                                      ↓
                            /api/analyze (NVIDIA NIM) → Structured JSON report
                                      ↓
                            /report page → displays technical + AI analysis
```

**Data Flow:**
1. **Capture** — `POST /api/capture` launches headless Chromium, scrapes page content, metadata, security headers, redirects, and runs Wappalyzer for technology detection. Saves a full-page screenshot.
2. **Analyze** — `POST /api/analyze` sends structured capture data to NVIDIA NIM (Llama 3.1 8B). Returns a validated JSON report with score, summary, strengths, weaknesses, risks, and suggestions.
3. **Storage** — Capture data flows through `sessionStorage` (cross-page), AI reports cache server-side (1h TTL), history persists in `localStorage` (20 item cap).

See [docs/architecture/overview.md](docs/architecture/overview.md) for detailed diagrams and data flow.

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repo to [Vercel](https://vercel.com/)
3. Set `NVIDIA_NIM_API_KEY` in environment variables
4. Set build command: `npx next build --webpack` (Win32) or `next build`
5. Deploy

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx playwright install chromium
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual

```bash
npm run build
npm start
```

> **Note:** Playwright requires system dependencies for Chromium. On headless Linux: `npx playwright install-deps chromium`.

---

## Roadmap

- [ ] **Unit tests** — Vitest for lib/ utilities
- [ ] **Redis rate limiter** — Multi-instance support
- [ ] **Dashboard** — Aggregate analytics across scans
- [ ] **Export formats** — PDF, CSV, JSON download
- [ ] **Comparison view** — Side-by-side site reports
- [ ] **Scheduled scans** — Periodic re-analysis with notifications

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/description`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `feat: add new feature`
4. Push and open a Pull Request targeting `main`

### Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Ensure `npm run lint` and `npm run type-check` pass
- Update docs if API or architecture changes
- Add E2E test coverage for new features

---

## License

MIT — see [LICENSE](LICENSE).

---

## Acknowledgments

- [NVIDIA NIM](https://build.nvidia.com/) for free LLM inference
- [Playwright](https://playwright.dev/) for headless browser automation
- [Wappalyzer](https://www.wappalyzer.com/) for technology detection
- [shadcn/ui](https://ui.shadcn.com/) for accessible UI primitives
