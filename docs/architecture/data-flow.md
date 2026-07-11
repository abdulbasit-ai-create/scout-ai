# Data Flow

## 1. Capture Flow

```
User types URL ─→ hero.tsx ─→ normalizeUrl() ─→ isValidUrl()
                              │
                              │ valid?
                              ├── No → setError("Please enter a valid URL")
                              │
                              └── Yes → setIsAnalyzing(true)
                                          │
                                          ↓
                              analysis-loading.tsx
                              │
                              ├── POST /api/capture
                              │     Content-Type: application/json
                              │     Body: { url: "https://example.com" }
                              │
                              │     capture/route.ts:
                              │       │
                              │       ├── getClientIp(req)
                              │       ├── checkRateLimit(ip, "capture")
                              │       │     └── 429? → return { error, Retry-After }
                              │       │
                              │       ├── validateUrl(url)
                              │       │     ├── add https:// if missing
                              │       │     ├── block private IPs (localhost, 10.*, 192.168.*, etc.)
                              │       │     └── require http:/https: protocol
                              │       │
                              │       ├── chromium.launch({ headless: true })
                              │       ├── browser.newContext({ viewport, userAgent })
                              │       ├── page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
                              │       │
                              │       ├── Extract metadata:
                              │       │     ├── page.title()
                              │       │     ├── meta[name="description"] content
                              │       │     ├── OG tags (meta[property^="og:"])
                              │       │     ├── Twitter card tags (meta[name^="twitter:"])
                              │       │     ├── favicon (link[rel~="icon"]) → fallback /favicon.ico
                              │       │     ├── page.content() → HTML
                              │       │     ├── response headers
                              │       │     └── redirect chain (page.on("response") listener)
                              │       │
                              │       ├── page.screenshot({ fullPage: true })
                              │       │     └── → public/screenshots/{hash}-{timestamp}.png
                              │       │
                              │       ├── Wappalyzer.analyze({ url, html, headers, meta, scripts, cookies, ... })
                              │       │     └── → deduplicated tech list [{ name, version }]
                              │       │
                              │       ├── Fetch /robots.txt + /sitemap.xml (parallel)
                              │       │
                              │       ├── browser.close()
                              │       │
                              │       └── Return JSON:
                              │             { title, metaDescription, finalUrl,
                              │               screenshot, analysis: {
                              │                 hasHttps, redirectChain, securityHeaders,
                              │                 hasRobotsTxt, hasSitemapXml, openGraph,
                              │                 twitterCard, favicon, loadTimeMs,
                              │                 pageSizeBytes, technologies } }
                              │
                              ├── sessionStorage.setItem("capture:{url}", JSON.stringify(data))
                              │
                              └── router.push("/report?url={encodeURIComponent(url)}")
```

## 2. Report Flow

```
/report?url=https://example.com

report/page.tsx (client component inside Suspense boundary):
  │
  ├── useSearchParams() → url = "https://example.com"
  │
  ├── sessionStorage.getItem("capture:{url}")
  │     ├── Found? → setCapture(data), setCaptureDuration(data.analysis.loadTimeMs)
  │     │             saveToHistory(data)  ← writes to localStorage
  │     │
  │     └── Not found? → check searchParams.get("id") for shared link
  │                        ├── Find in localStorage "scout:history" by decoded ID
  │                        ├── Found? → setCapture(found)
  │                        └── Not found? → show "Report not found" UI
  │
  ├── Once capture is loaded:
  │     └── Check sessionStorage.getItem("ai:{finalUrl}")
  │           ├── Found? → setAiReport(parsed)  (skip API call)
  │           │
  │           └── Not found? → POST /api/analyze
  │                 Body: { finalUrl, title, metaDescription, analysis }
  │
  │                 analyze/route.ts:
  │                   ├── checkRateLimit(ip, "analyze")
  │                   │     └── 429? → return error
  │                   │
  │                   ├── Validate: data.finalUrl exists, NVIDIA_NIM_API_KEY is set
  │                   │
  │                   ├── getCacheKey(data) → MD5 of relevant fields
  │                   ├── Check in-memory cache Map
  │                   │     └── Hit? → return { report: cached.data, cached: true }
  │                   │
  │                   ├── buildPrompt(data) → structured prompt string
  │                   │
  │                   ├── POST https://integrate.api.nvidia.com/v1/chat/completions
  │                   │     Model: meta/llama-3.1-8b-instruct
  │                   │     Temperature: 0.1, Max tokens: 2048
  │                   │     System prompt + user prompt with website data
  │                   │
  │                   ├── Parse response → extract JSON from text
  │                   │     → { executiveSummary, strengths, weaknesses,
  │                   │         securityRisks, seoSuggestions, performanceSuggestions,
  │                   │         overallScore, scoreExplanation }
  │                   │
  │                   ├── cache.set(cacheKey, { data: report, ts: Date.now() })
  │                   │
  │                   └── Return { report, cached: false }
  │
  ├── Set state on response:
  │     ├── Success → setAiReport(data.report)
  │     │             sessionStorage.setItem("ai:{finalUrl}", JSON.stringify(data.report))
  │     │             trackAnalysis({ status: "success", ... })
  │     │
  │     └── Error → setAiError(data.error)
  │                  trackAnalysis({ status: "error", ... })
  │
  └── Render:
        ├── Report header (title, description, HTTPS badge, action buttons)
        ├── Screenshot preview + stats grid (load time, page size, redirects)
        ├── Quick checks (robots.txt, sitemap.xml, security headers)
        ├── Detected Technology list
        ├── Security Headers section
        ├── Redirect Chain section
        ├── Open Graph / Twitter Card / Favicon sections
        ├── AI Intelligence Report (ScoreRing + Executive Summary + findings)
        └── Footer navigation
```

## 3. History Flow

```
Landing page loads:

app/page.tsx
  └── <ReportHistory /> (client component)

ReportHistory:
  ├── useEffect → localStorage.getItem("scout:history")
  │     ├── Found → JSON.parse(raw) → setItems(data)
  │     └── Not found / error → setItems([])
  │
  ├── items.length === 0? → return null (render nothing)
  │
  └── Render grid of cards:
        └── Each card:
              ├── id = btoa(item.finalUrl).replace(/[/+=]/g, "").slice(0, 12)
              ├── Title, URL, load time, HTTPS status
              └── Link → /report?id={id}

       ┌─────────────────────────────────────────────┐
       │  Report History              [Clear]  ✕     │
       │                                             │
       │  ┌─────────────────┐  ┌─────────────────┐   │
       │  │ Example.com      │  │ Another Site    │   │
       │  │ https://example  │  │ https://another │   │
       │  │ 342ms • HTTPS    │  │ 891ms • HTTPS   │   │
       │  └─────────────────┘  └─────────────────┘   │
       └─────────────────────────────────────────────┘

Click card → /report?id=abc123def456

report/page.tsx:
  ├── searchParams.get("id") → "abc123def456"
  ├── Read localStorage "scout:history"
  ├── Find item where btoa(finalUrl).replace(...).slice(0,12) === "abc123def456"
  ├── Found → setCapture(found), saveToHistory(found) (moves to top)
  └── Render same report page as fresh capture
```

## 4. Theme Flow

```
Initial load (pre-paint):

layout.tsx → <head> → inline <script>:
  ┌──────────────────────────────────────────────────────┐
  │  (function(){                                        │
  │    try {                                             │
  │      var t = localStorage.getItem("scout:theme")     │
  │      if (t === "light" || t === "dark") {            │
  │        document.documentElement.classList.add(t)      │
  │      } else if (matchMedia("(prefers-color-scheme:   │
  │          light)").matches) {                          │
  │        document.documentElement.classList.add("light")│
  │      } else {                                         │
  │        document.documentElement.classList.add("dark") │
  │      }                                                │
  │    } catch(e) {                                       │
  │      document.documentElement.classList.add("dark")   │
  │    }                                                  │
  │  })()                                                 │
  └──────────────────────────────────────────────────────┘

Result: .dark or .light class on <html> before React hydrates
        → No flash of unstyled content (FOUC)
        → suppressHydrationWarning on <html> tag

ThemeToggle component:
  ├── getInitialTheme() → reads localStorage → prefers-color-scheme → "dark"
  ├── useState("dark" | "light")
  ├── useEffect: root.classList.toggle("dark", theme === "dark")
  │              localStorage.setItem("scout:theme", theme)
  │
  └── Toggle button:
        ── Click → setTheme(dark ↔ light)
             └── Effect fires → classList + localStorage updated

CSS Variables (globals.css):
  :root { --background: oklch(1 0 0); --foreground: oklch(0.145 0 0); ... }
  .dark { --background: oklch(0.145 0 0); --foreground: oklch(0.985 0 0); ... }

All components use: bg-background, text-foreground, text-muted-foreground, etc.
```

## 5. Rate Limiting Flow

```
Request arrives → getClientIp(req)
                    │
                    ├── x-forwarded-for header (first IP in comma-separated list)
                    ├── x-real-ip header (fallback)
                    └── "127.0.0.1" (development fallback)
                    │
                    ↓
              checkRateLimit(ip, kind)
                    │
                    ├── kind = "capture" (max 5/min) or "analyze" (max 15/min)
                    ├── key = "{ip}:{kind}"
                    │
                    ├── Retrieve timestamps from Map
                    ├── Filter: keep timestamps within last 60 seconds
                    │
                    ├── If count >= max:
                    │     → return { ok: false, remaining: 0, resetAfter }
                    │     → API route returns 429 with Retry-After header
                    │
                    └── If count < max:
                          → Push Date.now() to array
                          → return { ok: true, remaining, resetAfter: 0 }
                          → API route proceeds

Background cleanup (every 60s):
  └── Iterate Map, remove entries with no recent timestamps
      → Prevents memory leak from abandoned IPs
```
