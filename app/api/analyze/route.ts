import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit, type LimitKind } from "@/lib/rate-limit"

export const runtime = "nodejs"

// Simple in-memory cache with TTL
const cache = new Map<string, { data: AiReport; ts: number }>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "127.0.0.1"
}

function getCacheKey(data: any): string {
  const relevant = JSON.stringify({
    url: data.finalUrl,
    tech: data.analysis?.technologies,
    headers: data.analysis?.securityHeaders,
    metrics: {
      loadTimeMs: data.analysis?.loadTimeMs,
      pageSizeBytes: data.analysis?.pageSizeBytes,
    },
    seo: {
      title: data.title,
      description: data.metaDescription,
      og: data.analysis?.openGraph,
      twitter: data.analysis?.twitterCard,
      robots: data.analysis?.hasRobotsTxt,
      sitemap: data.analysis?.hasSitemapXml,
      https: data.analysis?.hasHttps,
    },
    redirects: data.analysis?.redirectChain,
  })
  const crypto = require("node:crypto")
  return crypto.createHash("md5").update(relevant).digest("hex")
}

export interface AiReport {
  executiveSummary: string
  strengths: string[]
  weaknesses: string[]
  securityRisks: string[]
  seoSuggestions: string[]
  performanceSuggestions: string[]
  overallScore: number
  scoreExplanation: string
}

const SYSTEM_PROMPT = `You are Scout AI, a professional website intelligence analyst. You produce structured, data-driven reports.

You will receive collected data from a website analysis. Your job is to analyze ONLY the provided data and produce a professional intelligence report.

RULES:
- NEVER invent data. Only reason over the facts provided.
- If data is missing (e.g., "Not set"), note the absence as a finding.
- Be specific and reference actual values from the data.
- Keep every point concise — one or two sentences max per item.
- The overall score must be between 50 and 100 and should reflect the combined assessment of security, performance, SEO, and technology posture.

Output must be a valid JSON object with these exact keys:
{
  "executiveSummary": "2-3 sentence summary of the website's overall posture",
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "securityRisks": ["risk 1", "risk 2", ...],
  "seoSuggestions": ["suggestion 1", "suggestion 2", ...],
  "performanceSuggestions": ["suggestion 1", "suggestion 2", ...],
  "overallScore": 85,
  "scoreExplanation": "Brief explanation of how the score was determined"
}`

function buildPrompt(data: any): string {
  const a = data.analysis || {}

  return `Analyze the following website data and produce a structured intelligence report.

PAGE INFORMATION:
- Title: ${data.title || "N/A"}
- Meta Description: ${data.metaDescription || "Not set"}
- Final URL: ${data.finalUrl || "N/A"}
- HTTPS: ${a.hasHttps ? "Yes" : "No"}

PERFORMANCE METRICS:
- Load Time: ${a.loadTimeMs ?? "N/A"}ms
- Page Size: ${a.pageSizeBytes ? formatBytes(a.pageSizeBytes) : "N/A"}
- Redirects: ${a.redirectChain?.length || 0} (${a.redirectChain?.join(" → ") || "none"})

SECURITY FINDINGS:
- Content-Security-Policy: ${a.securityHeaders?.contentSecurityPolicy || "Not set"}
- Strict-Transport-Security: ${a.securityHeaders?.strictTransportSecurity || "Not set"}
- X-Frame-Options: ${a.securityHeaders?.xFrameOptions || "Not set"}
- X-Content-Type-Options: ${a.securityHeaders?.xContentTypeOptions || "Not set"}
- robots.txt: ${a.hasRobotsTxt ? "Present" : "Not found"}
- sitemap.xml: ${a.hasSitemapXml ? "Present" : "Not found"}

SEO FINDINGS:
- Open Graph tags: ${Object.keys(a.openGraph || {}).length > 0 ? Object.entries(a.openGraph || {}).map(([k, v]) => `${k}="${v}"`).join(", ") : "None"}
- Twitter Card tags: ${Object.keys(a.twitterCard || {}).length > 0 ? Object.entries(a.twitterCard || {}).map(([k, v]) => `${k}="${v}"`).join(", ") : "None"}
- Favicon: ${a.favicon ? "Present" : "Not found"}

DETECTED TECHNOLOGIES:
${(a.technologies || []).map((t: any) => `- ${t.name}${t.version ? " " + t.version : ""}`).join("\n") || "None detected"}

Now produce the structured JSON report.`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function parseResponse(text: string): AiReport {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("No JSON found in AI response")
  const parsed = JSON.parse(jsonMatch[0])

  return {
    executiveSummary: parsed.executiveSummary || "No summary generated.",
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    securityRisks: Array.isArray(parsed.securityRisks) ? parsed.securityRisks : [],
    seoSuggestions: Array.isArray(parsed.seoSuggestions) ? parsed.seoSuggestions : [],
    performanceSuggestions: Array.isArray(parsed.performanceSuggestions) ? parsed.performanceSuggestions : [],
    overallScore:
      typeof parsed.overallScore === "number"
        ? Math.max(50, Math.min(100, parsed.overallScore))
        : 70,
    scoreExplanation: parsed.scoreExplanation || "",
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const limit = checkRateLimit(ip, "analyze" as LimitKind)
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

  const data = await req.json()

  if (!data?.finalUrl) {
    return NextResponse.json({ error: "Capture data with finalUrl is required" }, { status: 400 })
  }

  const apiKey = process.env.NVIDIA_NIM_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "NVIDIA_NIM_API_KEY environment variable is not set. Add it to .env.local" },
      { status: 500 }
    )
  }

  // Check cache
  const cacheKey = getCacheKey(data)
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json({ report: cached.data, cached: true })
  }

  try {
    const prompt = buildPrompt(data)

    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => "")
      throw new Error(`NVIDIA NIM API error ${res.status}: ${errBody}`)
    }

    const json = await res.json()
    const text = json.choices?.[0]?.message?.content || ""
    if (!text) throw new Error("Empty response from NVIDIA NIM")

    const report = parseResponse(text)

    cache.set(cacheKey, { data: report, ts: Date.now() })

    return NextResponse.json({ report, cached: false })
  } catch (err: any) {
    return NextResponse.json(
      { error: `AI analysis failed: ${err.message}` },
      { status: 500 }
    )
  }
}
