# Report History

## What

Stores the last 20 analyzed websites in the user's browser localStorage, allowing quick re-access without re-analyzing.

## How

### Save to History

Triggered in `report/page.tsx` `ReportContent` component when capture data loads:

```typescript
function saveToHistory(data: CaptureData): void {
  try {
    const raw = localStorage.getItem("scout:history")
    const history: CaptureData[] = raw ? JSON.parse(raw) : []
    // Remove duplicate if same URL (move to front instead)
    const existing = history.findIndex((h) => h.finalUrl === data.finalUrl)
    if (existing >= 0) history.splice(existing, 1)
    // Prepend new item
    history.unshift(data)
    // Trim to max 20
    if (history.length > 20) history.length = 20
    localStorage.setItem("scout:history", JSON.stringify(history))
  } catch { /* silently fail — storage full or blocked */ }
}
```

Call site:
```typescript
// report/page.tsx line 338
useEffect(() => {
  if (!url) return
  const stored = sessionStorage.getItem(`capture:${url}`)
  if (stored) {
    const data = JSON.parse(stored) as CaptureData
    setCapture(data)
    // ...
    saveToHistory(data)
  }
}, [url])
```

### Display History

`ReportHistory` component on the landing page reads the stored history:

```typescript
// From components/report/report-history.tsx
useEffect(() => {
  try {
    const raw = localStorage.getItem("scout:history")
    if (raw) setItems(JSON.parse(raw))
  } catch { /* ignore */ }
}, [])
```

If no items exist, the component returns `null` (renders nothing).

### Shareable IDs

Each history item generates a URL-safe ID for direct links:

```typescript
const id = btoa(item.finalUrl).replace(/[/+=]/g, "").slice(0, 12)
// e.g., "aHR0cHM6Ly9le" for "https://example.com"
```

When a user visits `/report?id=...`, the report page decodes by scanning localStorage history:

```typescript
const found = history.find((h) => {
  const hId = btoa(h.finalUrl).replace(/[/+=]/g, "").slice(0, 12)
  return hId === id
})
```

## Limits

| Property | Value |
|---|---|
| Max items | 20 |
| Storage key | `scout:history` |
| Data per item | ~1-2KB (title, URL, analysis summary) |
| Eviction policy | Oldest removed when new item exceeds 20 |
| Deduplication | Same URL → removed from old position, added to front |

## Data Structure

Each history item stores a subset of the capture data (enough to render the card and re-open the full report):

```typescript
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
```

## UI

```
┌─────────────────────────────────────────────────────────┐
│  ⌛ Report History                                      │
│  Your recently analyzed websites          [Clear]  ✕   │
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │ 🌐 Example.com       │  │ 🌐 Another Site         │   │
│  │ https://example.com  │  │ https://another.org     │   │
│  │ 342ms • HTTPS        │  │ 891ms • HTTPS           │   │
│  └─────────────────────┘  └─────────────────────────┘   │
│                                                         │
│  ┌─────────────────────┐                                │
│  │ 🌐 Third Site        │                                │
│  │ https://third.dev    │                                │
│  │ 1204ms • HTTPS       │                                │
│  └─────────────────────┘                                │
└─────────────────────────────────────────────────────────┘
```

## Edge Cases

| Edge Case | Behavior |
|---|---|
| **localStorage full** | `saveToHistory` silently fails (try/catch) — history not saved |
| **localStorage blocked** | (Private browsing, restricted) — same silent failure |
| **No history** | `ReportHistory` returns `null` — nothing rendered |
| **Malformed JSON in storage** | `JSON.parse` fails → treated as empty array |
| **Manual clear** | User clicks Trash2 button → `localStorage.removeItem()` + `setItems([])` |
| **Duplicate URL** | Old entry removed, new entry prepended (moves to top) |
| **20+ items** | Array trimmed to 20 after each addition |
| **Shared link from another browser** | ID decode fails → "Report not found" page |
