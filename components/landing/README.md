# Landing Components

Components for the homepage (`app/page.tsx`).

## Files

- `hero.tsx` — URL input, client-side validation, triggers capture flow
- `features.tsx` — Three feature cards (static server component)
- `how-it-works.tsx` — Three-step guide (static server component)
- `analysis-loading.tsx` — Loading screen during Playwright capture with animated radar and progress bar

## Flow

```
hero.tsx → validates URL → renders analysis-loading.tsx
                              ↓
                        POST /api/capture → sessionStorage → redirect to /report
```
