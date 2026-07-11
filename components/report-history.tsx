"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Clock, Globe, Trash2, History } from "lucide-react"

interface HistoryItem {
  title: string
  finalUrl: string
  metaDescription: string
  analysis: {
    loadTimeMs: number
    pageSizeBytes: number
    hasHttps: boolean
  }
}

export default function ReportHistory() {
  const [items, setItems] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("scout:history")
      if (raw) setItems(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const clearHistory = () => {
    localStorage.removeItem("scout:history")
    setItems([])
  }

  if (items.length === 0) return null

  return (
    <section className="border-t border-zinc-800/50 px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <History className="h-5 w-5 text-blue-500" aria-hidden="true" />
              Report History
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Your recently analyzed websites</p>
          </div>
          <button
            onClick={clearHistory}
            aria-label="Clear history"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:border-red-500/40 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const id = btoa(item.finalUrl).replace(/[/+=]/g, "").slice(0, 12)
            return (
              <Link
                key={item.finalUrl}
                href={`/report?id=${id}`}
                className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition-all duration-200 hover:border-blue-500/40 hover:bg-zinc-900/60"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500 shrink-0" aria-hidden="true" />
                  <h3 className="truncate text-sm font-semibold text-zinc-200 group-hover:text-zinc-100">
                    {item.title || item.finalUrl}
                  </h3>
                </div>
                <p className="mb-3 truncate text-xs text-zinc-600">{item.finalUrl}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-600">
                  {item.analysis?.loadTimeMs && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {item.analysis.loadTimeMs}ms
                    </span>
                  )}
                  {item.analysis?.hasHttps !== undefined && (
                    <span>{item.analysis.hasHttps ? "HTTPS" : "HTTP"}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
