"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Scan } from "lucide-react"
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
} from "@/components/ui/progress"

const STAGES: { label: string; range: [number, number] }[] = [
  { label: "Validating URL", range: [0, 18] },
  { label: "Scanning website structure", range: [18, 45] },
  { label: "Analyzing technology stack", range: [45, 72] },
  { label: "Generating intelligence report", range: [72, 100] },
]

export default function AnalysisLoading({ url }: { url: string }) {
  const [progress, setProgress] = useState(0)
  const stageIndex = Math.min(
    STAGES.findIndex((s) => progress < s.range[1]),
    STAGES.length - 1
  )
  const currentStage = STAGES[Math.max(0, stageIndex < 0 ? STAGES.length - 1 : stageIndex)]
  const router = useRouter()
  const startedAt = useRef(Date.now())

  useEffect(() => {
    const duration = 2600
    const interval = 32
    const step = 100 / (duration / interval)

    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt.current
      const ratio = Math.min(elapsed / duration, 1)
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - ratio, 3)
      setProgress(eased * 100)

      if (ratio >= 1) {
        clearInterval(timer)
        // Brief pause at 100% then navigate
        setTimeout(() => {
          router.push(`/report?url=${encodeURIComponent(url)}`)
        }, 400)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [url, router])

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pt-36 pb-28 text-center">
      {/* Same background as hero for seamless transition */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-blue-500/20 via-blue-500/5 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex max-w-lg flex-col items-center gap-8">
        {/* Animated radar rings */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full border border-blue-500/30" />
          <div
            className="absolute inset-4 animate-ping rounded-full border border-blue-500/20"
            style={{ animationDelay: "0.3s", animationDuration: "2.5s" }}
          />
          <div
            className="absolute inset-8 animate-ping rounded-full border border-blue-500/10"
            style={{ animationDelay: "0.6s", animationDuration: "2.5s" }}
          />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
            <Scan className="h-7 w-7 text-blue-500" />
          </div>
        </div>

        {/* URL being analyzed */}
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-500">Analyzing</p>
          <p className="mt-1 max-w-md truncate text-lg font-semibold text-zinc-100">
            {url}
          </p>
        </div>

        {/* Current stage label */}
        <p className="text-blue-400 transition-all duration-300">
          {currentStage.label}
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-sm">
          <Progress value={progress}>
            <ProgressTrack className="h-1.5 rounded-full bg-zinc-800" />
            <ProgressIndicator className="rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-150" />
          </Progress>
        </div>
      </div>
    </section>
  )
}
