# Scout AI — Demo Script (2–3 minutes)

## Setup

```bash
# Terminal 1 — Start the app
cd scout-ai
npx next dev --webpack
```

Open `http://localhost:3000` in a browser (Chrome recommended for best print preview).

---

## Script

### 0. Opening (15 seconds)

> *"Hi, I'd like to show you Scout AI — an open-source website intelligence tool. It takes any URL and produces a comprehensive AI-powered analysis report in about 15 seconds."*

Point to the landing page.

### 1. Enter a URL (15 seconds)

> *"Let's analyze a real website. I'll use Hacker News."*

Type `news.ycombinator.com` into the input field.

Click **Analyze Website**.

### 2. Capture in progress (10 seconds)

> *"Scout AI launches a headless browser, loads the page, takes a screenshot, detects the tech stack, and checks security headers — all automatically."*

Point to the radar animation and progress bar.

### 3. Overview (30 seconds)

Report page loads. Walk through the top section:

> *"Here's the report. We can see the live screenshot — Hacker News loaded in about 2 seconds, it's 34KB, and uses HTTPS with no redirects. The green badges show it has a Content-Security-Policy and robots.txt."*

Point to:
- Screenshot preview
- Stats cards (load time, page size, redirects)
- Badge row (robots.txt, CSP, etc.)

### 4. Technical details (20 seconds)

> *"Scrolling down, we see the detected technologies, the security headers in detail, and any redirect chains or Open Graph tags."*

Quick scroll through:
- Detected Technology
- Security Headers
- (Skip Open Graph/Twitter if not present)

### 5. AI Intelligence Report (40 seconds)

> *"The real power is the AI Intelligence Report. It sends all this data to an LLM running on NVIDIA NIM — specifically Llama 3.1 8B — which produces a structured analysis."*

Point to the score ring:

> *"It gives an overall score of 80 out of 100, with a clear explanation. The executive summary covers the big picture."*

Scroll through strengths, weaknesses, security risks:

> *"The strengths highlight the HTTPS setup and robots.txt. The weaknesses point out the load time. The security risks flag the inline script policies — all backed by the actual data we collected."*

### 6. Print as PDF (15 seconds)

> *"You can export this as a PDF by clicking the Print button — it opens the browser's print dialog with custom styles for clean paper output."*

Click **Print / PDF** → show the print preview briefly → cancel.

### 7. Share and History (15 seconds)

> *"You can copy a shareable link. And on the landing page, your recent reports show up in the History section so you can come back to them anytime."*

Click **Share** → "Copied!" appears.

Scroll to the bottom and click **Back to Scout AI** to show the History section.

### 8. Theme toggle (10 seconds)

> *"And of course, there's a dark and light theme that follows your system preference."*

Click the theme toggle (sun/moon icon) in the top-right corner.

### 9. Closing (10 seconds)

> *"That's Scout AI. It's open-source under MIT, built with Next.js and TypeScript — available now on GitHub."*

---

## Key talking points

- **No paid API keys required** — NVIDIA NIM has a generous free tier
- **No database** — Everything runs in localStorage and sessionStorage
- **Privacy-first** — No user accounts, no tracking, no data collection
- **Real-time** — Playwright captures live website data, not cached results
- **AI-powered** — Structured AI analysis grounded in actual measurements, not hallucinated
