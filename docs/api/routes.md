# API Routes

## POST /api/capture

Captures a live website using Playwright headless browser. Returns metadata, screenshot path, technology detection, and security analysis.

### Request

```http
POST /api/capture
Content-Type: application/json
Accept: application/json

{
  "url": "https://example.com"
}
```

**Runtime:** `nodejs` (requires Node.js — Playwright binaries are incompatible with Edge Runtime)

**Rate Limit:** 5 requests per minute per IP

### Response — 200 OK

```json
{
  "title": "Example Domain",
  "metaDescription": "Example description text",
  "finalUrl": "https://example.com/",
  "screenshot": "/screenshots/abc123def4-1712345678.png",
  "analysis": {
    "hasHttps": true,
    "redirectChain": [],
    "securityHeaders": {
      "contentSecurityPolicy": null,
      "strictTransportSecurity": null,
      "xFrameOptions": null,
      "xContentTypeOptions": null
    },
    "hasRobotsTxt": true,
    "hasSitemapXml": false,
    "openGraph": {
      "og:title": "Example Title",
      "og:description": "Example description"
    },
    "twitterCard": {
      "twitter:card": "summary",
      "twitter:site": "@example"
    },
    "favicon": "https://example.com/favicon.ico",
    "loadTimeMs": 1234,
    "pageSizeBytes": 45200,
    "technologies": [
      { "name": "React", "version": "18.2.0" },
      { "name": "Nginx", "version": "1.24" }
    ]
  }
}
```

### Error Responses

#### 400 — Validation Failure

```json
{
  "error": "A valid public website URL is required (e.g., https://example.com)"
}
```

Triggered when:
- URL is empty or not a string
- URL protocol is not `http:` or `https:`
- Hostname is a private/reserved IP (localhost, 127.0.0.1, 10.*, 192.168.*, etc.)
- URL is malformed

#### 429 — Rate Limit Exceeded

```json
{
  "error": "Rate limit exceeded. Retry in 42s."
}
```

Headers:
- `Retry-After: 42`
- `X-RateLimit-Remaining: 0`

#### 500 — Server Error

```json
{
  "error": "Failed to capture website: Navigation timeout of 30000 ms exceeded"
}
```

Triggered when:
- Playwright navigation fails/timeout
- Browser launch fails
- Screenshot write fails
- Unexpected runtime error

---

## POST /api/analyze

Generates an AI-powered intelligence report from captured website data using NVIDIA NIM API (`meta/llama-3.1-8b-instruct`).

### Request

```http
POST /api/analyze
Content-Type: application/json
Accept: application/json

{
  "title": "Example Domain",
  "metaDescription": "...",
  "finalUrl": "https://example.com/",
  "analysis": {
    "hasHttps": true,
    "redirectChain": [],
    "securityHeaders": { ... },
    "hasRobotsTxt": true,
    "hasSitemapXml": false,
    "openGraph": { ... },
    "twitterCard": { ... },
    "favicon": "...",
    "loadTimeMs": 1234,
    "pageSizeBytes": 45200,
    "technologies": [ ... ]
  }
}
```

**Runtime:** `nodejs`

**Rate Limit:** 15 requests per minute per IP

**Server Cache:** 1 hour TTL (in-memory Map, keyed by MD5 of relevant fields)

### Response — 200 OK

```json
{
  "report": {
    "executiveSummary": "Example.com is a well-configured website with strong security posture...",
    "strengths": [
      "Site loads in 342ms — excellent performance",
      "HTTPS enabled with valid certificate"
    ],
    "weaknesses": [
      "No Content-Security-Policy header set — XSS risk",
      "Missing sitemap.xml reduces search engine discoverability"
    ],
    "securityRisks": [
      "X-Frame-Options not set — clickjacking vulnerability"
    ],
    "seoSuggestions": [
      "Add a sitemap.xml for better search engine indexing"
    ],
    "performanceSuggestions": [
      "Enable compression (gzip/brotli) to reduce page size"
    ],
    "overallScore": 78,
    "scoreExplanation": "Score reflects strong security fundamentals but missing headers and SEO gaps reduce the total."
  },
  "cached": false
}
```

When served from cache:
```json
{
  "report": { ... },
  "cached": true
}
```

### Error Responses

#### 400 — Missing Required Data

```json
{
  "error": "Capture data with finalUrl is required"
}
```

#### 429 — Rate Limit Exceeded

```json
{
  "error": "Rate limit exceeded. Retry in 12s."
}
```

Headers:
- `Retry-After: 12`
- `X-RateLimit-Remaining: 0`

#### 500 — AI Analysis Failed

```json
{
  "error": "AI analysis failed: NVIDIA NIM API error 401: ..."
}
```

```json
{
  "error": "AI analysis failed: NVIDIA_NIM_API_KEY environment variable is not set. Add it to .env.local"
}
```

Triggered when:
- `NVIDIA_NIM_API_KEY` is missing from environment
- NVIDIA NIM API returns non-200 status
- API response contains no valid JSON
- JSON parsing fails or required fields are missing
- Network error reaching NVIDIA NIM

### Caching Details

Server-side cache key is computed as MD5 hash of a JSON containing:
- `finalUrl`
- `analysis.technologies` (sorted list)
- `analysis.securityHeaders` (all four headers)
- `analysis.loadTimeMs`, `analysis.pageSizeBytes`
- `title`, `metaDescription`
- `analysis.openGraph`, `analysis.twitterCard`
- `analysis.hasRobotsTxt`, `analysis.hasSitemapXml`, `analysis.hasHttps`
- `analysis.redirectChain`

If the same site is re-analyzed within 1 hour with identical data, the cached report is returned (`cached: true`). Cache is in-memory and lost on server restart.
