import { NextRequest, NextResponse } from "next/server"
import { chromium } from "playwright"
import { Wappalyzer, technologies, categories } from "wapalyzer-core"
import crypto from "node:crypto"
import path from "node:path"
import fs from "node:fs"

export const runtime = "nodejs"

const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "screenshots")
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })

// Init Wappalyzer once
Wappalyzer.setTechnologies(technologies)
Wappalyzer.setCategories(categories)

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
  const { url } = await req.json()

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
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

    // Track redirects from page events
    const redirectUrls: string[] = []
    let responseHeaders: Record<string, string> = {}

    page.on("response", (res) => {
      const status = res.status()
      if (status >= 300 && status < 400 && res.headers()["location"]) {
        redirectUrls.push(res.url())
      }
    })

    // Navigate
    const startTime = Date.now()
    const resp = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    })
    const loadTimeMs = Date.now() - startTime
    const finalUrl = page.url()

    // Capture response headers from the final navigation
    if (resp) {
      responseHeaders = resp.headers() as Record<string, string>
      // Build redirect chain from request object
      let req2 = resp.request()
      const chain: string[] = []
      while (req2) {
        chain.unshift(req2.url())
        req2 = req2.redirectedFrom() as any
      }
      // Only add to redirectUrls if we captured any
      if (chain.length > 1) {
        redirectUrls.length = 0
        redirectUrls.push(...chain.slice(0, -1))
      }
    }

    // --- Extract page metadata ---
    const title = await page.title()
    const metaDescription = await page
      .$eval('meta[name="description"]', (el) =>
        el.getAttribute("content") || ""
      )
      .catch(() => "")

    // --- OG & Twitter tags ---
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

    // --- Favicon ---
    const favicon = await page
      .$eval(
        'link[rel~="icon"]',
        (el) => (el as HTMLLinkElement).href
      )
      .catch(() => {
        // Default to /favicon.ico
        const u = new URL(finalUrl)
        return `${u.protocol}//${u.host}/favicon.ico`
      })

    // --- Page size ---
    const pageSizeBytes = responseHeaders["content-length"]
      ? parseInt(responseHeaders["content-length"], 10)
      : (await page.content()).length

    // --- Take full-page screenshot ---
    const hash = crypto
      .createHash("md5")
      .update(finalUrl)
      .digest("hex")
      .slice(0, 10)
    const filename = `${hash}-${Date.now()}.png`
    const filepath = path.join(SCREENSHOTS_DIR, filename)
    await page.screenshot({ path: filepath, fullPage: true })

    // --- Collect data for Wappalyzer ---
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

    // Build headers in array format for Wappalyzer
    const wappHeaders: Record<string, string[]> = {}
    for (const [k, v] of Object.entries(responseHeaders)) {
      wappHeaders[k] = [String(v)]
    }
    const wappMeta: Record<string, string[]> = {}
    for (const [k, v] of Object.entries(metaTags)) {
      wappMeta[k] = v
    }

    // Build cookie string
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

    // Deduplicate and extract technology names
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

    // --- Check robots.txt & sitemap.xml (separate HTTP fetches) ---
    const urlObj = new URL(finalUrl)
    const origin = `${urlObj.protocol}//${urlObj.host}`

    const [robotsResult, sitemapResult] = await Promise.all([
      fetchUrl(`${origin}/robots.txt`),
      fetchUrl(`${origin}/sitemap.xml`),
    ])

    // Detect HTTPS
    const hasHttps = finalUrl.startsWith("https://")

    // Security headers
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
