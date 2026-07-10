import { NextRequest, NextResponse } from "next/server"
import { chromium } from "playwright"
import crypto from "node:crypto"
import path from "node:path"

export const runtime = "nodejs"

const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "screenshots")

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

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })

    // Extract metadata
    const title = await page.title()
    const finalUrl = page.url()
    const metaDescription = await page
      .$eval('meta[name="description"]', (el) => el.getAttribute("content") || "")
      .catch(() => "")

    // Take full-page screenshot
    const hash = crypto.createHash("md5").update(finalUrl).digest("hex").slice(0, 10)
    const filename = `${hash}-${Date.now()}.png`
    const filepath = path.join(SCREENSHOTS_DIR, filename)
    await page.screenshot({ path: filepath, fullPage: true })

    await browser.close()
    browser = null

    return NextResponse.json({
      title,
      metaDescription,
      finalUrl,
      screenshot: `/screenshots/${filename}`,
    })
  } catch (err: any) {
    if (browser) await browser.close().catch(() => {})
    return NextResponse.json(
      { error: err.message || "Failed to capture website" },
      { status: 500 }
    )
  }
}
