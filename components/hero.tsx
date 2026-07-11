"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AnalysisLoading from "@/components/analysis-loading"

function normalizeUrl(str: string) {
  const s = str.trim()
  if (!s.startsWith("http://") && !s.startsWith("https://")) {
    return "https://" + s
  }
  return s
}

function isValidUrl(str: string) {
  try {
    const url = new URL(str)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export default function Hero() {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleAnalyze = () => {
    if (!url.trim()) {
      setError("Please enter a website URL")
      return
    }

    const normalized = normalizeUrl(url)
    if (!isValidUrl(normalized)) {
      setError("Please enter a valid URL (e.g., example.com)")
      return
    }

    setError(null)
    setUrl(normalized)
    setIsAnalyzing(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAnalyze()
    }
  }

  if (isAnalyzing) {
    return <AnalysisLoading url={url} />
  }

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-24 text-center">
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-blue-500/20 via-blue-500/5 to-transparent" />

      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-8">
        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
            AI-Powered
          </span>{" "}
          <span className="text-white">Website</span>
          <br />
          <span className="text-white">Intelligence</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-base sm:text-lg leading-relaxed text-zinc-400">
          Analyze any website and receive an AI-generated intelligence report in
          seconds.
        </p>

        {/* Input + CTA */}
        <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Input
              type="url"
              placeholder="Enter website URL..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (error) setError(null)
              }}
              onKeyDown={handleKeyDown}
              aria-label="Website URL"
              aria-describedby={error ? "url-error" : undefined}
              aria-invalid={!!error}
              className="h-12 w-full border-zinc-800 bg-zinc-900/80 px-4 text-base backdrop-blur-sm transition-all duration-300 placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
            {error && (
              <p id="url-error" className="absolute -bottom-6 left-0 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>
          <Button
            onClick={handleAnalyze}
            aria-label="Analyze website"
            className="h-12 gap-2 bg-blue-600 px-8 text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-[0.97]"
          >
            Analyze Website
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  )
}
