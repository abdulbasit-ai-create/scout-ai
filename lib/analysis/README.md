# Analysis Module

localStorage-based analytics tracking for website analysis events.

## Files

- `analytics.ts` — Tracks analysis events (URL, duration, page size, status) in localStorage under `scout:analytics` key. Max 200 events. Includes `trackAnalysis()`, `getAnalytics()`, and `getAnalyticsStats()`.

## Usage

```tsx
import { trackAnalysis, getAnalyticsStats } from "@/lib/analysis/analytics"
```
