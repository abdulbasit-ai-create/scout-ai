"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Shield,
  Gauge,
  Search,
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
} from "lucide-react"

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

function Badge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        ok
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-zinc-800 text-zinc-500"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      {label}
    </span>
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
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-100">
        <Icon className="h-5 w-5 text-blue-500" />
        {title}
      </h2>
      {children}
    </section>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ReportContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url") || ""
  const [capture, setCapture] = useState<CaptureData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!url) return
    const stored = sessionStorage.getItem(`capture:${url}`)
    if (stored) {
      setCapture(JSON.parse(stored))
    }
    setLoading(false)
  }, [url])

  const c = capture
  const a = c?.analysis
  const pageTitle = c?.title || url || "Unknown URL"
  const displayUrl = c?.finalUrl || url
  const description = c?.metaDescription || ""

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800/50 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Scout AI
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10">
              <Globe className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-zinc-400">Scout AI</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Report title */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-blue-500">
              Intelligence Report
            </p>
            {a && <Badge label="HTTPS" ok={a.hasHttps} />}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-100">
            {pageTitle}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              {description}
            </p>
          )}
        </div>

        {/* Website preview + Badge grid */}
        <div className="mb-10 grid gap-6 lg:grid-cols-5">
          {/* Website preview */}
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-zinc-800/50 px-4 py-3">
              <div className="flex gap-1.5">
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
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <Globe className="h-10 w-10 text-zinc-700" />
                  <p className="text-xs text-zinc-600">Preview unavailable</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-3 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Clock className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-zinc-100">
                {a ? `${a.loadTimeMs}ms` : "—"}
              </p>
              <p className="mt-1 text-xs text-zinc-600">Load time</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <HardDrive className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-zinc-100">
                {a ? formatBytes(a.pageSizeBytes) : "—"}
              </p>
              <p className="mt-1 text-xs text-zinc-600">Page size</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                  <Route className="h-4 w-4 text-violet-500" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-zinc-100">
                {a ? a.redirectChain.length : "—"}
              </p>
              <p className="mt-1 text-xs text-zinc-600">Redirects</p>
            </div>
          </div>
        </div>

        {/* Quick checks */}
        {a && (
          <div className="mb-10 flex flex-wrap gap-2">
            <Badge label="robots.txt" ok={a.hasRobotsTxt} />
            <Badge label="sitemap.xml" ok={a.hasSitemapXml} />
            {a.securityHeaders.contentSecurityPolicy && (
              <Badge label="CSP" ok={true} />
            )}
            {a.securityHeaders.strictTransportSecurity && (
              <Badge label="HSTS" ok={true} />
            )}
            {a.securityHeaders.xFrameOptions && (
              <Badge label="X-Frame-Options" ok={true} />
            )}
            {a.securityHeaders.xContentTypeOptions && (
              <Badge label="X-Content-Type-Options" ok={true} />
            )}
          </div>
        )}

        {/* Detected Technology */}
        <Section title="Detected Technology" icon={FileText}>
          {a && a.technologies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
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
            <HeaderValue
              label="Content-Security-Policy"
              value={a?.securityHeaders.contentSecurityPolicy ?? null}
            />
            <HeaderValue
              label="Strict-Transport-Security"
              value={a?.securityHeaders.strictTransportSecurity ?? null}
            />
            <HeaderValue
              label="X-Frame-Options"
              value={a?.securityHeaders.xFrameOptions ?? null}
            />
            <HeaderValue
              label="X-Content-Type-Options"
              value={a?.securityHeaders.xContentTypeOptions ?? null}
            />
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
                <div
                  key={key}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
                >
                  <p className="mb-1 text-xs font-medium text-zinc-500">
                    {key}
                  </p>
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
                <div
                  key={key}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
                >
                  <p className="mb-1 text-xs font-medium text-zinc-500">
                    {key}
                  </p>
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
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none"
                  }}
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
      </main>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
        </div>
      }
    >
      <ReportContent />
    </Suspense>
  )
}
