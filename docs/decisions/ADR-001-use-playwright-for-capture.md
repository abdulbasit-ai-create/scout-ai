# ADR-001: Use Playwright for Website Capture

**Status:** Accepted  
**Date:** 2026-07-11  
**Tags:** capture, browser, scraping

## Context

Scout AI needs to capture live website data for intelligence analysis. Requirements include:

- Full page rendering including JavaScript execution (SPAs, dynamic content)
- Metadata extraction (title, description, OG tags, Twitter cards)
- Full-page screenshot capture
- Technology detection via Wappalyzer (requires access to rendered DOM, loaded scripts, and response headers)
- Security header inspection
- Redirect chain tracking
- Cookie inspection

A simple HTTP fetch or DOM parser would miss JavaScript-rendered content, fail to capture screenshots, and provide incomplete data for technology detection.

## Decision

Use **Playwright** with headless Chromium as the browser automation engine.

```
capture/route.ts:
  chromium.launch({ headless: true })
    → browser.newContext({ viewport: 1280×800, spoofed User-Agent })
    → page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
    → Extract metadata via page.$eval() + page.evaluate()
    → page.screenshot({ fullPage: true })
    → Wappalyzer.analyze() with collected DOM + headers + scripts + cookies
    → browser.close()
```

Key configuration:
- **Headless**: Always headless (no GUI needed)
- **Viewport**: 1280×800 (standard desktop)
- **User-Agent**: Spoofed to standard Chrome — no "HeadlessChrome" exposure
- **Navigation timeout**: 30 seconds
- **Wait strategy**: `networkidle` — waits for network activity to settle

## Consequences

### Positive
- Complete page rendering with full JavaScript execution
- High-quality full-page screenshots
- Access to all browser APIs (cookies, headers, DOM queries)
- Cross-platform support (Windows, macOS, Linux)
- Active maintenance by Microsoft

### Negative
- Large dependency — Playwright binaries add ~300MB to deployment
- Per-capture cost is high: browser launch → navigate → screenshot → close (2-5s per capture)
- Requires Node.js runtime (cannot run on Next.js Edge Runtime)
- Rate limited to 5 captures/minute to manage server resources

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| **Puppeteer** | Similar capabilities, less cross-browser support, Chrome-only |
| **Cheerio** | No JavaScript execution, no screenshots, misses SPA content |
| **puppeteer-extra** | More plugins (stealth, adblock) but adds complexity; Playwright has built-in UA spoofing |
| **Headless Chrome via CLI** | Manual process management, no programmatic control |
| **chromium via puppeteer-core** | Essentially Puppeteer; no advantage over Playwright for this use case |

Playwright was chosen over Puppeteer for its cleaner API, built-in cross-browser support (future-proof), and better integration with modern Node.js.
