# ADR-003: Use localStorage for Report History Persistence

**Status:** Accepted  
**Date:** 2026-07-11  
**Tags:** storage, persistence, history

## Context

Scout AI needs to provide users access to previously analyzed website reports. Requirements:

- Users should be able to return to reports after closing and reopening the browser
- Maximum practical history: ~20 items (recently analyzed websites)
- No user authentication or accounts — anonymous usage only
- No server-side database infrastructure
- Must work immediately without any setup or login

The simplest persistence mechanism that meets these needs should be chosen — over-engineering storage for a client-only app is unnecessary.

## Decision

Store report history in **localStorage** under the key `scout:history`, limited to 20 items.

```
saveToHistory(data):
  1. localStorage.getItem("scout:history") → existing array
  2. Check for duplicate (same finalUrl) → remove existing entry
  3. data.unshift(newItem)  → prepend to front
  4. history.length = 20    → trim to max
  5. localStorage.setItem("scout:history", JSON.stringify(history))

ReportHistory component:
  1. useEffect → localStorage.getItem("scout:history") → setItems
  2. If empty → return null
  3. Render clickable cards with decoded IDs
  4. Clear button → localStorage.removeItem("scout:history")

Shareable IDs:
  btoa(finalUrl).replace(/[/+=]/g, "").slice(0, 12)
  → Base64-encoded, URL-safe, 12-char ID
  → Used for /report?id= links
```

## Consequences

### Positive
- **No server cost**: Zero infrastructure for persistence
- **No auth required**: Works immediately for anonymous users
- **Fast**: Synchronous reads/writes, no network latency
- **Per-browser isolation**: Each browser has its own history — appropriate for a client-only app
- **Simple implementation**: ~15 lines of code for save/load/clear

### Negative
- **Per-browser only**: History doesn't sync across devices or browsers
- **Size limit**: ~5MB total localStorage quota; 20 items at ~2KB each = negligible
- **Eviction risk**: Browsers may clear localStorage on cache clear
- **No server backup**: Lost if user clears browser data
- **Shareable links break**: IDs only resolve if the report is in the user's own localStorage — shared links don't work for other users

## Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| **IndexedDB** | More complex API, overkill for 20 items; async overhead not needed |
| **Server database (SQLite/Postgres)** | Requires backend, auth, API endpoints — out of scope for an anonymous client app |
| **Cookies** | Max ~4KB per cookie, sent with every request; terrible for this use case |
| **sessionStorage** | Cleared on tab close — defeats persistence requirement |

localStorage is the right tradeoff: simple, persistent, zero-infrastructure, and the 20-item limit keeps it within storage constraints. If multi-device history is needed later, that's a separate feature requiring authentication and a backend.
