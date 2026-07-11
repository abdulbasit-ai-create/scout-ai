// ponytail: simple localStorage analytics. No database, no server.
// Upgrade to a proper analytics backend if query patterns emerge.

export interface AnalysisEvent {
  url: string
  durationMs: number
  pageSizeBytes: number
  status: "success" | "error"
  timestamp: number
}

const STORAGE_KEY = "scout:analytics"
const MAX_EVENTS = 200

export function trackAnalysis(event: AnalysisEvent): void {
  if (typeof window === "undefined") return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const events: AnalysisEvent[] = raw ? JSON.parse(raw) : []
    events.unshift(event)
    if (events.length > MAX_EVENTS) events.length = MAX_EVENTS
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch {
    // localStorage full or blocked — silently drop
  }
}

export function getAnalytics(): AnalysisEvent[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getAnalyticsStats() {
  const events = getAnalytics()
  if (events.length === 0) return null
  const avgLoad = Math.round(
    events.reduce((s, e) => s + e.durationMs, 0) / events.length
  )
  const successRate = Math.round(
    (events.filter((e) => e.status === "success").length / events.length) * 100
  )
  return { totalScans: events.length, avgLoadMs: avgLoad, successRate }
}
