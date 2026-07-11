"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Shield,
  Globe,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  HardDrive,
  Image,
  Share2,
  AtSign,
  Route,
  Brain,
  ThumbsUp,
  AlertTriangle,
  TrendingUp,
  Zap,
  Printer,
  Copy,
  Check,
  History,
  ExternalLink,
} from "lucide-react"
import { trackAnalysis } from "@/lib/analytics"

interface Analysis {
  hasHttps: boolean
  redirectChain: string[]
  securityHeaders: {
    contentSecurityPolicy: string | null
    strictTransportSecurity: string | null
    xFrameOptions: string | null
    xContentTypeOptions: string | null
  }
  hasRobotsTxt: boolean
  hasSitemapXml: boolean
  openGraph: Record<string, string>
  twitterCard: Record<string, string>
  favicon: string
  loadTimeMs: number
  pageSizeBytes: number
  technologies: { name: string; version?: string }[]
}

interface CaptureData {
  title: string
  metaDescription: string
  finalUrl: string
  screenshot: string
  analysis: Analysis
}

interface AiReport {
  executiveSummary: string
  strengths: string[]
  weaknesses: string[]
  securityRisks: string[]
  seoSuggestions: string[]
  performanceSuggestions: string[]
  overallScore: number
  scoreExplanation: string
}

function saveToHistory(data: CaptureData): void {
  try {
    const raw = localStorage.getItem("scout:history")
    const history: CaptureData[] = raw ? JSON.parse(raw) : []
    // Avoid dupes for same URL
    const existing = history.findIndex((h) => h.finalUrl === data.finalUrl)
    if (existing >= 0) history.splice(existing, 1)
    history.unshift(data)
    if (history.length > 20) history.length = 20
    localStorage.setItem("scout:history", JSON.stringify(history))
  } catch { /* ignore */ }
}

// --- Sub-components ---

function Badge({ label, ok, className = "" }: { label: string; ok: boolean; className?: string }) {
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        ok
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-zinc-800 text-zinc-500"
      } ${className}`}
    >
      {ok ? (
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
      ) : (
        <XCircle className="h-3 w-3" aria-hidden="true" />
      )}
      {label}
    </span>
  )
}

function StatCard({ icon: Icon, value, label, color }: {
  icon: React.ElementType; value: string; label: string; color: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-100">
        <Icon className="h-5 w-5 shrink-0 text-blue-500" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  )
}

function HeaderValue({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <p className="mb-1 text-xs font-medium text-zinc-500">{label}</p>
      <p className="break-all font-mono text-xs text-zinc-300">
        {value || (
          <span className="text-zinc-600 italic">Not set</span>
        )}
      </p>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }, [text])
  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

function ScoreRing({ score }: { score: number }) {
  const r = 54
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center" role="img" aria-label={`Score: ${score} out of 100`}>
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="oklch(0.269 0 0)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={score >= 80 ? "oklch(0.627 0.194 149.214)" : score >= 60 ? "oklch(0.681 0.162 75.834)" : "oklch(0.577 0.245 27.325)"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-3xl font-bold text-zinc-100">{score}</span>
    </div>
  )
}

function AiReportSection({ report, loading, error, captureUrl }: {
  report: AiReport | null
  loading: boolean
  error: string | null
  captureUrl: string
}) {
  if (loading) {
    return (
      <Section title="AI Intelligence Report" icon={Brain}>
        <div className="flex items-center gap-3 py-4" role="status" aria-label="Generating AI report">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" aria-hidden="true" />
          <p className="text-sm text-zinc-500">Analyzing collected data and generating intelligence report...</p>
        </div>
      </Section>
    )
  }

  if (error) {
    return (
      <Section title="AI Intelligence Report" icon={Brain}>
        <div className="flex flex-col gap-3 py-2">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            AI analysis unavailable: {error}
          </p>
          <p className="text-xs text-zinc-500">
            The AI analysis service is currently unavailable. The technical report data is still shown below.
          </p>
        </div>
      </Section>
    )
  }

  if (!report) return null

  return (
    <>
      <div className="mb-10 rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <ScoreRing score={report.overallScore} />
          <div>
            <h2 className="mb-1 text-lg font-semibold text-zinc-100">
              AI Intelligence Score
            </h2>
            <p className="max-w-lg text-sm leading-relaxed text-zinc-400">
              {report.scoreExplanation}
            </p>
          </div>
        </div>
      </div>

      <Section title="Executive Summary" icon={Brain}>
        <p className="text-sm leading-relaxed text-zinc-400 print:text-zinc-800">
          {report.executiveSummary}
        </p>
      </Section>

      {report.strengths.length > 0 && (
        <Section title="Strengths" icon={ThumbsUp}>
          <ul className="space-y-2">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-400 print:text-zinc-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-500">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {report.weaknesses.length > 0 && (
        <Section title="Weaknesses" icon={AlertTriangle}>
          <ul className="space-y-2">
            {report.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-400 print:text-zinc-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs text-amber-500">
                  !
                </span>
                {w}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {report.securityRisks.length > 0 && (
        <Section title="Security Risks" icon={Shield}>
          <ul className="space-y-2">
            {report.securityRisks.map((r, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-400 print:text-zinc-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs text-red-500">
                  !
                </span>
                {r}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {report.seoSuggestions.length > 0 && (
        <Section title="SEO Suggestions" icon={TrendingUp}>
          <ul className="space-y-2">
            {report.seoSuggestions.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-400 print:text-zinc-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-medium text-blue-500">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {report.performanceSuggestions.length > 0 && (
        <Section title="Performance Suggestions" icon={Zap}>
          <ul className="space-y-2">
            {report.performanceSuggestions.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-400 print:text-zinc-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs font-medium text-violet-500">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )
}

// --- Main content ---

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ReportContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url") || ""
  const [capture, setCapture] = useState<CaptureData | null>(null)
  const [aiReport, setAiReport] = useState<AiReport | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareCopied, setShareCopied] = useState(false)
  const [captureDuration, setCaptureDuration] = useState(0)

  useEffect(() => {
    if (!url) return
    const stored = sessionStorage.getItem(`capture:${url}`)
    if (stored) {
      const data = JSON.parse(stored) as CaptureData
      setCapture(data)
      setCaptureDuration(data.analysis?.loadTimeMs || 0)
      saveToHistory(data)
    }
    setLoading(false)
  }, [url])

  // Fetch AI analysis once capture data is loaded
  useEffect(() => {
    if (!capture) return

    const cachedAi = sessionStorage.getItem(`ai:${capture.finalUrl}`)
    if (cachedAi) {
      setAiReport(JSON.parse(cachedAi))
      return
    }

    setAiLoading(true)
    setAiError(null)

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(capture),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setAiError(data.error)
          trackAnalysis({
            url: capture.finalUrl,
            durationMs: captureDuration,
            pageSizeBytes: capture.analysis.pageSizeBytes,
            status: "error",
            timestamp: Date.now(),
          })
        } else if (data.report) {
          setAiReport(data.report)
          sessionStorage.setItem(`ai:${capture.finalUrl}`, JSON.stringify(data.report))
          trackAnalysis({
            url: capture.finalUrl,
            durationMs: captureDuration,
            pageSizeBytes: capture.analysis.pageSizeBytes,
            status: "success",
            timestamp: Date.now(),
          })
        }
      })
      .catch((err) => {
        setAiError(err.message)
        trackAnalysis({
          url: capture.finalUrl,
          durationMs: captureDuration,
          pageSizeBytes: capture.analysis.pageSizeBytes,
          status: "error",
          timestamp: Date.now(),
        })
      })
      .finally(() => setAiLoading(false))
  }, [capture, captureDuration])

  // Wait — check for shared report ID
  useEffect(() => {
    const id = searchParams.get("id")
    if (!id && !url) return
    if (id && !url) {
      // Load from history by ID
      try {
        const raw = localStorage.getItem("scout:history")
        const history: CaptureData[] = raw ? JSON.parse(raw) : []
        const found = history.find((h) => {
          const hId = btoa(h.finalUrl).replace(/[/+=]/g, "").slice(0, 12)
          return hId === id
        })
        if (found) {
          setCapture(found)
          saveToHistory(found)
          setCaptureDuration(found.analysis?.loadTimeMs || 0)
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
  }, [searchParams, url])

  const handlePrint = () => window.print()

  const handleShare = () => {
    const shareUrl = capture?.finalUrl
      ? `${window.location.origin}/report?id=${btoa(capture.finalUrl).replace(/[/+=]/g, "").slice(0, 12)}`
      : window.location.href
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }).catch(() => {})
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading report">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          <p className="text-sm text-zinc-500">Loading report...</p>
        </div>
      </div>
    )
  }

  if (!url && !searchParams.get("id")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <Globe className="h-16 w-16 text-zinc-700" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-zinc-300">No URL specified</h1>
          <p className="max-w-md text-sm text-zinc-500">
            Enter a website URL on the home page to generate an intelligence report.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scout AI
          </Link>
        </div>
      </div>
    )
  }

  if (!capture) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500/60" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-zinc-300">Report not found</h1>
          <p className="max-w-md text-sm text-zinc-500">
            This report was not found in your history. Try analyzing the website again.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 transition-colors hover:bg-blue-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Analyze a website
          </Link>
        </div>
      </div>
    )
  }

  const c = capture
  const a = c?.analysis
  const pageTitle = c?.title || searchParams.get("url") || "Unknown URL"
  const displayUrl = c?.finalUrl || searchParams.get("url")
  const description = c?.metaDescription || ""

  return (
    <div className="min-h-screen bg-zinc-950 print:bg-white">
      {/* Print header — only visible when printing */}
      <div className="hidden print:block print:px-6 print:py-4">
        <h1 className="text-xl font-bold text-zinc-900">Scout AI — Intelligence Report</h1>
        <p className="text-sm text-zinc-500">{new Date().toLocaleDateString()}</p>
      </div>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 print:py-4">
        {/* Report header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium text-blue-500">
                Intelligence Report
              </p>
              {a && <Badge label="HTTPS" ok={a.hasHttps} />}
            </div>
            <h1 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 break-words">
              {pageTitle}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                {description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 flex-wrap gap-2" role="toolbar" aria-label="Report actions">
            <button
              onClick={handlePrint}
              aria-label="Print or save as PDF"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={handleShare}
              aria-label={shareCopied ? "Share link copied" : "Copy shareable link"}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
            >
              {shareCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{shareCopied ? "Copied!" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Website preview + Stats grid */}
        <div className="mb-10 grid gap-6 lg:grid-cols-5">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-zinc-800/50 px-4 py-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="ml-3 flex-1 truncate rounded-md bg-zinc-800/50 px-3 py-1 text-xs text-zinc-500">
                {displayUrl}
              </div>
            </div>
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-zinc-900/80">
              {c?.screenshot ? (
                <img
                  src={c.screenshot}
                  alt={`Screenshot of ${pageTitle}`}
                  className="h-full w-full object-cover object-top print:object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <Globe className="h-10 w-10 text-zinc-700" aria-hidden="true" />
                  <p className="text-xs text-zinc-600">Preview unavailable</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-3 lg:grid-cols-3">
            <StatCard icon={Clock} value={a ? `${a.loadTimeMs}ms` : "—"} label="Load time" color="bg-emerald-500/10" />
            <StatCard icon={HardDrive} value={a ? formatBytes(a.pageSizeBytes) : "—"} label="Page size" color="bg-blue-500/10" />
            <StatCard icon={Route} value={a ? String(a.redirectChain.length) : "—"} label="Redirects" color="bg-violet-500/10" />
          </div>
        </div>

        {/* Quick checks */}
        {a && (
          <div className="mb-10 flex flex-wrap gap-2" role="list" aria-label="Security and SEO checks">
            <Badge label="robots.txt" ok={a.hasRobotsTxt} />
            <Badge label="sitemap.xml" ok={a.hasSitemapXml} />
            {a.securityHeaders.contentSecurityPolicy && <Badge label="CSP" ok={true} />}
            {a.securityHeaders.strictTransportSecurity && <Badge label="HSTS" ok={true} />}
            {a.securityHeaders.xFrameOptions && <Badge label="X-Frame-Options" ok={true} />}
            {a.securityHeaders.xContentTypeOptions && <Badge label="X-Content-Type-Options" ok={true} />}
          </div>
        )}

        {/* Detected Technology */}
        <Section title="Detected Technology" icon={FileText}>
          {a && a.technologies.length > 0 ? (
            <div className="flex flex-wrap gap-2" role="list" aria-label="Detected technologies">
              {a.technologies.map((tech) => (
                <span
                  key={tech.name}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-300"
                >
                  {tech.name}
                  {tech.version && (
                    <span className="ml-1 text-xs text-zinc-500">
                      {tech.version}
                    </span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No technologies detected</p>
          )}
        </Section>

        {/* Security Headers */}
        <Section title="Security Headers" icon={Shield}>
          <div className="grid gap-3 sm:grid-cols-2">
            <HeaderValue label="Content-Security-Policy" value={a?.securityHeaders.contentSecurityPolicy ?? null} />
            <HeaderValue label="Strict-Transport-Security" value={a?.securityHeaders.strictTransportSecurity ?? null} />
            <HeaderValue label="X-Frame-Options" value={a?.securityHeaders.xFrameOptions ?? null} />
            <HeaderValue label="X-Content-Type-Options" value={a?.securityHeaders.xContentTypeOptions ?? null} />
          </div>
        </Section>

        {/* Redirect Chain */}
        {a && a.redirectChain.length > 0 && (
          <Section title="Redirect Chain" icon={ArrowRight}>
            <div className="space-y-2">
              <p className="mb-3 text-sm text-zinc-400">
                The URL redirected through {a.redirectChain.length} hop
                {a.redirectChain.length !== 1 ? "s" : ""} before reaching the
                final destination.
              </p>
              {a.redirectChain.map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500">
                    {i + 1}
                  </span>
                  <p className="break-all pt-0.5 font-mono text-xs text-zinc-400">
                    {r}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Open Graph */}
        {a && Object.keys(a.openGraph).length > 0 && (
          <Section title="Open Graph" icon={Share2}>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(a.openGraph).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                  <p className="mb-1 text-xs font-medium text-zinc-500">{key}</p>
                  <p className="break-all text-xs text-zinc-300">{value}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Twitter Card */}
        {a && Object.keys(a.twitterCard).length > 0 && (
          <Section title="Twitter Card" icon={AtSign}>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(a.twitterCard).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                  <p className="mb-1 text-xs font-medium text-zinc-500">{key}</p>
                  <p className="break-all text-xs text-zinc-300">{value}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Favicon */}
        <Section title="Favicon" icon={Image}>
          <div className="flex items-center gap-4">
            {a?.favicon ? (
              <>
                <img
                  src={a.favicon}
                  alt="Favicon"
                  className="h-10 w-10 rounded-lg border border-zinc-700 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-300">{a.favicon}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-500">No favicon detected</p>
            )}
          </div>
        </Section>

        {/* AI Intelligence Report — lazy loaded */}
        <div id="ai-report" aria-live="polite">
          <AiReportSection
            report={aiReport}
            loading={aiLoading}
            error={aiError}
            captureUrl={capture.finalUrl}
          />
        </div>

        {/* Footer nav */}
        <div className="mt-12 flex flex-col gap-4 border-t border-zinc-800/50 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scout AI
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-blue-500 transition-colors hover:text-blue-400"
          >
            Analyze another website
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      {/* Print footer */}
      <div className="hidden print:block print:px-6 print:py-4 print:text-xs print:text-zinc-400">
        <p>Generated by Scout AI — {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
            <p className="text-sm text-zinc-500">Preparing report...</p>
          </div>
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  )
}
