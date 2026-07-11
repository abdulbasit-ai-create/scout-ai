import { NextRequest, NextResponse } from "next/server"
import { chromium } from "playwright"
import { Wappalyzer, technologies, categories } from "wapalyzer-core"
import crypto from "node:crypto"
import path from "node:path"
import fs from "node:fs"
import { checkRateLimit, type LimitKind } from "@/lib/rate-limit"

export const runtime = "nodejs"

const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "screenshots")
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })

// Init Wappalyzer once
Wappalyzer.setTechnologies(technologies)
Wappalyzer.setCategories(categories)

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "127.0.0.1"
}

function validateUrl(str: string): string | null {
  if (!str || typeof str !== "string") return null
  const s = str.trim()
  try {
    const url = new URL(s.startsWith("http") ? s : `https://${s}`)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    // Block private/reserved IPs
    const hostname = url.hostname.toLowerCase()
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.16.") ||
      hostname.startsWith("192.168.") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return null
    }
    return url.href
  } catch {
    return null
  }
}

async function fetchUrl(
  url: string
): Promise<{ ok: boolean; text?: string }> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (res.ok) return { ok: true, text: await res.text() }
    return { ok: false }
  } catch {
    return { ok: false }
  }
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = getClientIp(req)
  const limit = checkRateLimit(ip, "capture" as LimitKind)
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Retry in ${Math.ceil(limit.resetAfter / 1000)}s.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limit.resetAfter / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    )
  }

  const { url: rawUrl } = await req.json()
  const url = validateUrl(rawUrl)
  if (!url) {
    return NextResponse.json(
      { error: "A valid public website URL is required (e.g., https://example.com)" },
      { status: 400 }
    )
  }

  let browser
  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    })
    const page = await context.newPage()

    const redirectUrls: string[] = []
    let responseHeaders: Record<string, string> = {}

    page.on("response", (res) => {
      const status = res.status()
      if (status >= 300 && status < 400 && res.headers()["location"]) {
        redirectUrls.push(res.url())
      }
    })

    const startTime = Date.now()
    const resp = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    const loadTimeMs = Date.now() - startTime
    const finalUrl = page.url()

    if (resp) {
      responseHeaders = resp.headers() as Record<string, string>
      let req2 = resp.request()
      const chain: string[] = []
      while (req2) {
        chain.unshift(req2.url())
        req2 = req2.redirectedFrom() as any
      }
      if (chain.length > 1) {
        redirectUrls.length = 0
        redirectUrls.push(...chain.slice(0, -1))
      }
    }

    const title = await page.title()
    const metaDescription = await page
      .$eval('meta[name="description"]', (el) =>
        el.getAttribute("content") || ""
      )
      .catch(() => "")

    const ogTags = await page.evaluate(() => {
      const tags: Record<string, string> = {}
      document
        .querySelectorAll('meta[property^="og:"], meta[name^="og:"]')
        .forEach((el) => {
          const key =
            el.getAttribute("property") || el.getAttribute("name") || ""
          tags[key] = el.getAttribute("content") || ""
        })
      return tags
    })

    const twitterTags = await page.evaluate(() => {
      const tags: Record<string, string> = {}
      document
        .querySelectorAll('meta[name^="twitter:"]')
        .forEach((el) => {
          const key = el.getAttribute("name") || ""
          tags[key] = el.getAttribute("content") || ""
        })
      return tags
    })

    const favicon = await page
      .$eval(
        'link[rel~="icon"]',
        (el) => (el as HTMLLinkElement).href
      )
      .catch(() => {
        const u = new URL(finalUrl)
        return `${u.protocol}//${u.host}/favicon.ico`
      })

    const pageSizeBytes = responseHeaders["content-length"]
      ? parseInt(responseHeaders["content-length"], 10)
      : (await page.content()).length

    const hash = crypto
      .createHash("md5")
      .update(finalUrl)
      .digest("hex")
      .slice(0, 10)
    const filename = `${hash}-${Date.now()}.png`
    const filepath = path.join(SCREENSHOTS_DIR, filename)
    await page.screenshot({ path: filepath, fullPage: true })

    const html = await page.content()
    const scripts = await page.evaluate(() =>
      Array.from(document.scripts).map((s) => s.src).filter(Boolean)
    )
    const metaTags = await page.evaluate(() => {
      const m: Record<string, string[]> = {}
      document.querySelectorAll("meta").forEach((el) => {
        const name =
          el.getAttribute("name") ||
          el.getAttribute("property") ||
          ""
        const content = el.getAttribute("content") || ""
        if (name && content) {
          m[name] = m[name] || []
          m[name].push(content)
        }
      })
      return m
    })

    const wappHeaders: Record<string, string[]> = {}
    for (const [k, v] of Object.entries(responseHeaders)) {
      wappHeaders[k] = [String(v)]
    }
    const wappMeta: Record<string, string[]> = {}
    for (const [k, v] of Object.entries(metaTags)) {
      wappMeta[k] = v
    }

    const cookies = await context.cookies()
    const cookieMap: Record<string, string[]> = {}
    for (const c of cookies) {
      cookieMap[c.name] = [c.value]
    }

    const techResult = Wappalyzer.analyze({
      url: finalUrl,
      html,
      headers: wappHeaders,
      meta: wappMeta,
      scripts,
      scriptSrc: scripts,
      cookies: cookieMap,
      css: [],
      dns: {},
      probe: {},
      certIssuer: "",
      robots: "",
      text: "",
      xhr: "",
    })

    const seen = new Set<string>()
    const technologiesDetected: { name: string; version?: string }[] = []
    for (const r of techResult) {
      const name = r.technology?.name
      if (name && !seen.has(name)) {
        seen.add(name)
        technologiesDetected.push({ name, version: r.version || undefined })
      }
    }

    await browser.close()
    browser = null

    const urlObj = new URL(finalUrl)
    const origin = `${urlObj.protocol}//${urlObj.host}`

    const [robotsResult, sitemapResult] = await Promise.all([
      fetchUrl(`${origin}/robots.txt`),
      fetchUrl(`${origin}/sitemap.xml`),
    ])

    const hasHttps = finalUrl.startsWith("https://")

    const sec = responseHeaders
    const securityHeaders = {
      contentSecurityPolicy: sec["content-security-policy"] || null,
      strictTransportSecurity:
        sec["strict-transport-security"] || null,
      xFrameOptions: sec["x-frame-options"] || null,
      xContentTypeOptions:
        sec["x-content-type-options"] || null,
    }

    return NextResponse.json({
      title,
      metaDescription,
      finalUrl,
      screenshot: `/screenshots/${filename}`,
      analysis: {
        hasHttps,
        redirectChain: redirectUrls,
        securityHeaders,
        hasRobotsTxt: robotsResult.ok,
        hasSitemapXml: sitemapResult.ok,
        openGraph: ogTags,
        twitterCard: twitterTags,
        favicon,
        loadTimeMs,
        pageSizeBytes,
        technologies: technologiesDetected,
      },
    })
  } catch (err: any) {
    if (browser) await browser.close().catch(() => {})
    return NextResponse.json(
      { error: err.message || "Failed to capture website" },
      { status: 500 }
    )
  }
}
