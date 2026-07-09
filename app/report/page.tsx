"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Shield,
  Gauge,
  Search,
  Brain,
  Lightbulb,
  Globe,
  FileText,
} from "lucide-react"

const MOCK = {
  overall: 87,
  security: 92,
  performance: 76,
  seo: 94,
  techStack: [
    "Next.js 16",
    "React 19",
    "Tailwind CSS",
    "Vercel (Hosting)",
    "Cloudflare (DNS)",
  ],
  summary:
    "example.com is a well-structured modern website built on Next.js with strong performance fundamentals. The site leverages React 19 and Tailwind CSS for a responsive, accessible UI. Content delivery is optimized through Vercel's edge network. Security headers are properly configured, and the SSL certificate is up to date. Structured data implementation is excellent, contributing to strong search visibility. Key opportunities include image optimization for Core Web Vitals and additional caching strategies for dynamic routes.",
  recommendations: [
    "Optimize image sizes and serve next-gen formats (WebP/AVIF) to improve LCP scores",
    "Add breadcrumb structured data for enhanced SERP appearance",
    "Implement resource hints (preload, prefetch) for critical assets",
    "Enable brotli compression for smaller asset transfers",
    "Add a Content Security Policy header for XSS protection",
  ],
  details: {
    security:
      "SSL certificate is valid and properly configured. HTTPS redirect is enforced. Key security headers (X-Content-Type-Options, X-Frame-Options) are present. No mixed content detected.",
    performance:
      "First Contentful Paint is within acceptable range. Largest Contentful Paint needs optimization. JavaScript bundle size could be reduced through code splitting. Third-party scripts impact rendering.",
    seo: "Meta tags are properly structured. Open Graph and Twitter Card tags are present. XML sitemap is accessible. robots.txt is correctly configured. Semantic HTML5 structure in use.",
  },
}

function ScoreCard({
  label,
  score,
  icon: Icon,
  color,
}: {
  label: string
  score: number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}/10`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <span className="text-sm font-medium text-zinc-400">{label}</span>
      </div>
      <p className={`text-4xl font-bold tracking-tight ${color}`}>{score}</p>
      <p className="mt-1 text-xs text-zinc-600">
        / 100
      </p>
    </div>
  )
}

function ReportContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get("url") || "Unknown URL"

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
          <p className="text-sm font-medium text-blue-500">Intelligence Report</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-100">
            {url}
          </h1>
        </div>

        {/* Website preview + Score grid */}
        <div className="mb-10 grid gap-6 lg:grid-cols-5">
          {/* Website preview — takes 2 cols */}
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-zinc-800/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="ml-3 flex-1 truncate rounded-md bg-zinc-800/50 px-3 py-1 text-xs text-zinc-500">
                {url}
              </div>
            </div>
            <div className="flex aspect-[4/3] items-center justify-center bg-zinc-900/80 p-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <Globe className="h-10 w-10 text-zinc-700" />
                <div className="space-y-1">
                  <div className="mx-auto h-2 w-32 rounded-full bg-zinc-800" />
                  <div className="mx-auto h-2 w-24 rounded-full bg-zinc-800/60" />
                </div>
                <p className="text-xs text-zinc-600">Preview unavailable</p>
              </div>
            </div>
          </div>

          {/* Score cards — 3 cols */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-3 lg:grid-cols-3">
            <ScoreCard
              label="AI Score"
              score={MOCK.overall}
              icon={Brain}
              color="text-blue-500"
            />
            <ScoreCard
              label="Security"
              score={MOCK.security}
              icon={Shield}
              color="text-emerald-500"
            />
            <ScoreCard
              label="Performance"
              score={MOCK.performance}
              icon={Gauge}
              color="text-amber-500"
            />
            <ScoreCard
              label="SEO"
              score={MOCK.seo}
              icon={Search}
              color="text-violet-500"
            />
          </div>
        </div>

        {/* Detected Technology */}
        <section className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-100">
            <FileText className="h-5 w-5 text-blue-500" />
            Detected Technology
          </h2>
          <div className="flex flex-wrap gap-2">
            {MOCK.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-sm text-zinc-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Score details */}
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <Shield className="h-4 w-4" />
              Security
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              {MOCK.details.security}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-400">
              <Gauge className="h-4 w-4" />
              Performance
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              {MOCK.details.performance}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-400">
              <Search className="h-4 w-4" />
              SEO
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              {MOCK.details.seo}
            </p>
          </div>
        </div>

        {/* AI Summary */}
        <section className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-100">
            <Brain className="h-5 w-5 text-blue-500" />
            AI Summary
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">{MOCK.summary}</p>
        </section>

        {/* Recommendations */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-100">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            Recommendations
          </h2>
          <ul className="space-y-3">
            {MOCK.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-400">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-medium text-blue-500">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </section>
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
